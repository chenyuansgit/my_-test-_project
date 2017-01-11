var db = require('../../model/index').models;
var logger = require("../../common/log").logger("index");
var validate = require('../../common/validate');
var email_template = require('../../common/email_template');
var async = require('async');
var des = require('../../common/des');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var push_template = require('../../common/push_template');


//企业用户更新职位对应的简历状态
exports.updateResumeStatus = function (req, res) {
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
            //成功返回
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            // 更新job的简历首次处理延时
            if (original_status == 1) {
                proxy.stats_job.incrResumeTreatNum(jid[0], Math.ceil((resume_job_rel.update_time - resume_job_rel.create_time) / (1000 * 3600)));
            }
            //异步发送通知
            async.parallel([function (callback) {
                proxy.company.findOne(employer.company_id,function (err,company) {
                    callback(err, company);
                });
            }, function (callback) {
                proxy.resume.findOneByVersion(option.rid, resume_job_rel.version, function (e1, resume) {
                    callback(e1, resume);
                });
            }], function (err, results) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10005));
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
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};

