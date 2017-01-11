var db = require('../../model/index').models;
var logger = require("../../common/log").logger("index");
var validate = require('../../common/validate');
var email_template = require('../../common/email_template');
var async = require('async');
var des = require('../../common/des');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var config = require('../../config_default').config;
var rankey = require('../../common/fn').rankey;
var push_template = require('../../common/push_template');

/*投递状态
 1:投递成功,2:带沟通,3:通知面试,4:不合适*/

//企业用户更新职位对应的简历状态
exports.companyUpdateResumeStatus = function (req, res) {
    var jid = req.insert_data.jid, option = req.body.option || {}, status = option.status, employer = res.locals.employer,original_status = option.original_status;
    if (!option || !option.rid || !option.job_name || !status || status <= 1 || status > 4) {
        return res.json(resp_status_builder.build(10002));
    }
    if (!jid || !jid.length) {
        return res.json(resp_status_builder.build(10002));
    }
    db.resume_job_rel.findOne({
        where: {
            job_id: jid[0],
            resume_id: option.rid
        }
    }).then(function (resume_job_rel) {
        if (!resume_job_rel) {
            return res.json(resp_status_builder.build(10006, 'no some jobs or resumes'));
        }
        if (resume_job_rel.status == status || resume_job_rel.status > 4) {
            return res.json(resp_status_builder.build(10009, 'resume status has been set!'));
        }
        switch (parseInt(status)) {
            case 2:
                resume_job_rel.contact_info = JSON.stringify({
                    update_time: +new Date
                });
                break;
            case 3:
                resume_job_rel.interview_info = JSON.stringify({
                    update_time: +new Date,
                    address: option.address || '',
                    hr_name: option.hr_name || '',
                    hr_phone: option.hr_phone || '',
                    interview_time: option.interview_time || 0
                });
                break;
            case 4:
                resume_job_rel.improper_info = JSON.stringify({
                    update_time: +new Date,
                    reason_title: option.reason_title || ''
                });
                break;
        }
        resume_job_rel.status = status;
        resume_job_rel.update_time = +new Date;
        resume_job_rel.interview_time = option.interview_time || 0;
        resume_job_rel.save().then(function () {
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            // 更新job的简历首次处理延时
            if (original_status == 1) {
                proxy.stats_job.incrResumeTreatNum(jid[0], Math.ceil((resume_job_rel.update_time - resume_job_rel.create_time) / (1000 * 3600)));
            }
            //发送通知
            async.parallel([function (callback) {
                db.company.findOne({
                    where: {
                        cid: employer.company_id
                    }
                }).then(function (company) {
                    callback(null, company);
                }).catch(function (err) {
                    callback(err);
                });
            }, function (callback) {
                proxy.resume.findOneByVersion(option.rid, resume_job_rel.version, function (e1, resume) {
                    callback(e1, resume);
                });
            }], function (err, results) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10003));
                }
                //发送客户端通知
                if (results[0].name) {
                    switch (status) {
                        case '2':
                            proxy.push.toSingleByUid(resume_job_rel.resume_user_id, push_template.toBeCommunicated());
                            break;
                        case '3':
                            proxy.push.toSingleByUid(resume_job_rel.resume_user_id, push_template.interview(results[0].name));
                            break;
                        case '4':
                            proxy.push.toSingleByUid(resume_job_rel.resume_user_id, push_template.improper());
                            break;
                    }
                }
                //添加到面试提醒的消息队列中(面试时间在当前时间的两个小时之后)
                if (status == 3 && option.interview_time - (+new Date) > 2 * 60 * 60 * 1000) {
                    proxy.push.interviewNotification.add(resume_job_rel.resume_user_id + "_" + resume_job_rel.job_id, option.interview_time);
                }
                //发送邮件通知
                if (results[1].email) {
                    var data = {
                        name: results[1].name,
                        address: results[1].email,
                        subject: '简历状态更改通知'
                    };
                    switch (status) {
                        case '2':
                            email_template.contact({
                                jid: jid[0],
                                job_name: option.job_name,
                                cid: employer.company_id,
                                company_name: results[0].name
                            }, function (err, str) {
                                if (!err) {
                                    data.html = str;
                                    validate.sendMail(data);
                                }
                            });
                            break;
                        case '3':
                            email_template.interview({
                                jid: jid[0],
                                job_name: option.job_name,
                                cid: employer.company_id,
                                company_name: results[0].name,
                                interview_time: option.interview_time,
                                resume_name: results[1].name,
                                address: option.address,
                                subject: option.subject,
                                hr_name: option.hr_name,
                                hr_phone: option.hr_phone,
                                content: option.content
                            }, function (err, str) {
                                if (!err) {
                                    data.html = str;
                                    validate.sendMail(data);
                                }
                            });
                            break;
                        case '4':
                            email_template.improper({
                                resume_name: results[1].name,
                                job_name: option.job_name,
                                jid: jid[0],
                                cid: employer.company_id,
                                company_name: results[0].name,
                                reason_title: option.reason_title,
                                reason_content: option.reason_content
                            }, function (err, str) {
                                if (!err) {
                                    data.html = str;
                                    validate.sendMail(data);
                                }
                            });
                            break;
                    }
                }

            });
        }).catch(function (e) {
            logger.error(e);
            res.json(resp_status_builder.build(10003));
        });
    });
};
//企业用户删除投递的简历对应的关系
exports.removeResumeJobs = function (req, res) {
    var jid = req.insert_data.jid, option = req.body.option || {};
    if (!option.rid) {
        return res.json(resp_status_builder.build(10002));
    }
    if (!jid || !jid.length) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.resume_job_rel.deleteRel(req.body.option.rid.split(','), jid, function (err, resume_job_rel) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!resume_job_rel[0]) {
            return res.json(resp_status_builder.build(10006, "no some resumes or jobs"));
        }
        res.json(resp_status_builder.build(10000, +new Date - req.start_time) + 'ms');
    });
};
//转发简历至他人邮箱
exports.resumeTransmitted = function (req, res) {
    var jid = req.insert_data.jid, option = req.body.option || {}, employer = res.locals.employer,host = res.locals.host;
    if (!option || !option.rid || !option.job_name) {
        return res.json(resp_status_builder.build(10002));
    }
    if (!jid || !jid.length) {
        return res.json(resp_status_builder.build(10002));
    }
    var code = rankey(100000, 999999);
    var transmitData = {
        code: code,
        time: +new Date,
        rid: option.rid,
        jid: option.jid
    };
    var shareKey = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(transmitData)), email = option.email, url = "http://"+host.hr+"/resume/s/" + shareKey, data = {
        name: email.split('@')[0],
        address: email,
        subject: option.subject || '',
        html: "<p>" + (option.content || '') + "</p><p>邮箱查看的验证码为:" + code + "</p><a href ='" + url + "'>查看完整简历</a>"
    };
    validate.sendMail(data);
    async.parallel([
        function (callback) {
            db.resume_job_rel.update({transmitted: 1}, {
                where: {
                    transmitted: {
                        $ne: 1
                    },
                    job_id: option.jid,
                    resume_id: option.rid
                }
            }).then(function (resume_job_rel) {
                if (!!resume_job_rel[0]) {
                    return callback(null, true);
                }
                callback(null, false);
            });
        },
        function (callback) {
            db.company.findOne({
                where: {
                    cid: employer.company_id
                }
            }).then(function (company) {
                callback(null, company || {});
            }).catch(function (e1) {
                callback(e1);
            });
        },
        function (callback) {
            proxy.resume.findLastResume(null, option.rid, function (err, resume) {
                callback(err, resume);
            });
        }
    ], function (err, results) {
        if (!err && results[0] && results[1] && results[2]) {
            if (err) logger.error(err);
            email_template.transmit({
                jid: option.jid,
                job_name: option.job_name,
                cid: results[1].cid,
                company_name: results[1].name
            }, function (err, str) {
                if (!err) {
                    var data1 = {
                        name: results[2].email.split('@')[0],
                        address: results[2].email,
                        subject: '简历转发通知',
                        html: str
                    };
                    validate.sendMail(data1);
                }
            });
        }
    });
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
};


