var db = require('../../model/index').models;
var config = require('../../config_default').config;
var des = require('../../common/des');
var validate = require('../../common/validate');
var rankey = require('../../common/fn').rankey;
var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var email_template = require('../../common/email_template');
var md5 = require('md5');
var sequelize = require('../../model/connect').sequelize;
var resp_status_builder = require('../../common/response_status_builder.js');
var job_type = require('../../common/job_type');
var push_template = require('../../common/push_template');


exports.deliveryResumePreview = function (req, res) {
    var employer = res.locals.employer;
    proxy.company.findOne(employer.company_id, function (err, company) {
       if(err){
           return res.render("employer/resumeManage/resumePreview", {
               resume: req.insert_data.resumes[0] || {},
               company:{},
               job: req.insert_data.job,
               status: req.status,
               job_type: job_type
           });
       }
       res.render("employer/resumeManage/resumePreview", {
            resume: req.insert_data.resumes[0] || {},
            company:company,
            job: req.insert_data.job,
            status: req.status,
            job_type: job_type
        });
    });
};
//公开简历
exports.shareResumePreview = function (req, res) {
    var host = res.locals.host,shareKey = req.params.shareKey, rid, jid, str, code, time;
    var now = +new Date;
    try {
        str = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, shareKey));
        code = str.code;
        time = str.time;
        rid = str.rid;
        jid = str.jid;
    } catch (e) {
        logger.error(e);
        return res.render("public/resumePreview", {
            resume: {},
            job: {},
            status: null,
            employer: {},
            shareKey: shareKey,
            job_type: job_type
        });
    }
    var resume_auth = req.signedCookies[rid + "_r_auth_code"];

    if (resume_auth && resume_auth == code && now - time <= 7 * 24 * 60 * 1000 * 1000) {
        async.parallel([
            function (callback) {
                proxy.job.findOneById(jid, function (err, job) {
                    callback(err, job);
                });
            },
            function (callback) {
                proxy.resume_job_rel.getOneByOption({
                    resume_id: rid,
                    job_id: jid
                }, function (err, resume_job_rel) {
                    callback(err, resume_job_rel);
                });
            }
        ], function (e0, results) {
            if (!results[1] || !results[0] || e0) {
                if (e0) logger.error(e0);
                return res.render("public/resumePreview", {
                    resume: {},
                    job: {},
                    employer: {},
                    shareKey: shareKey,
                    status: null,
                    job_type: job_type
                });
            }
            async.parallel([
                function (_callback) {
                    proxy.resume.findOneByVersion(rid, results[1].version, function (e1, resume) {
                        _callback(e1, resume);
                    });
                },
                function (_callback) {
                    proxy.employer.getOneById(results[0].user_id, function (e1, employer) {
                        _callback(e1, employer);
                    });
                }
            ], function (e3, subresults) {
                if (!subresults[1] || !subresults[0] || e3) {
                    if (e3) logger.error(e3);
                    return res.render("public/resumePreview", {
                        resume: {},
                        job: {},
                        status: null,
                        employer: subresults[1] || {},
                        shareKey: shareKey,
                        job_type: job_type
                    });
                }
                res.render("public/resumePreview", {
                    resume: subresults[0],
                    status: results[1].status,
                    job: results[0],
                    employer: subresults[1] || {},
                    shareKey: shareKey,
                    job_type: job_type
                });
            });
        });
    } else {
        res.redirect('http://' + host.hr + '/public/resumeValidate?tp=job&sk=' + shareKey);
    }
};
//包打听公开简历
exports.detResumePreview = function (req, res) {
    var host = res.locals.host, shareKey = req.params.shareKey, rid, det_id, str, code, time;
    var now = +new Date;
    try {
        str = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, shareKey));
        code = str.code;
        time = str.time;
        rid = str.rid;
        det_id = str.det_id;
    } catch (e) {
        logger.error(shareKey + " error:" + e);
        return res.render("det/resumePreview", {
            resume: {},
            det: {},
            shareKey: shareKey,
            job_type: job_type
        });
    }
    var resume_auth = req.signedCookies[rid + "_r_auth_code"];
    if (resume_auth && resume_auth == code && now - time <= 7 * 24 * 60 * 1000 * 1000) {
        async.parallel([
            function (callback) {
                proxy.det.findOneById(det_id, function (err, det) {
                    callback(err, det);
                });
            },
            function (callback) {
                proxy.resume_det_rel.getOneByOption({
                    resume_id: rid,
                    det_id: det_id
                }, function (err, resume_det_rel) {
                    callback(err, resume_det_rel);
                });
            }
        ], function (e0, results) {
            if (!results[1] || !results[0] || e0) {
                if (e0) logger.error(e0);
                return res.render("det/resumePreview", {
                    resume: {},
                    det: {},
                    shareKey: shareKey,
                    job_type: job_type
                });
            }
            proxy.resume.findOneByVersion(rid, results[1].version, function (e1, resume) {
                if (e1) {
                    logger.error(e1);
                    return res.render("det/resumePreview", {
                        resume: {},
                        det: {},
                        shareKey: shareKey,
                        job_type: job_type
                    });
                }
                //增加一个包打听查看
                proxy.stats_det.incrResumeCheckNum(det_id, results[0].notice_email);

                res.render("det/resumePreview", {
                    resume: resume,
                    det: results[0],
                    shareKey: shareKey,
                    job_type: job_type
                });
            });
        });
    } else {
        res.redirect('http://' + host.hr + '/public/resumeValidate?tp=det&sk=' + shareKey);
    }
};

exports.publicUpdateResumeStatus = function (req, res) {
    var option = req.body.option || {}, status = option.status;
    if (!option.job_name || !status || status <= 1 || status > 4) {
        return res.json(resp_status_builder.build(10002));
    }
    var shareKey = option.shareKey, rid, jid, str, code, time;
    var now = +new Date;
    try {
        str = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, shareKey));
        code = str.code;
        time = str.time;
        rid = str.rid;
        jid = str.jid;
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002));
    }
    var resume_auth = req.signedCookies[rid + "_r_auth_code"];

    if (resume_auth && resume_auth == code && now - time >= 3 * 24 * 60 * 1000 * 1000) {
        return res.json(resp_status_builder.build(10011, 'code expired'));
    }
    db.resume_job_rel.findOne({
        where: {
            job_id: jid,
            resume_id: rid
        }
    }).then(function (resume_job_rel) {
        if (!resume_job_rel) {
            return res.json(resp_status_builder.build(10006, "no some jobs or resumes"));
        }
        if (resume_job_rel.status == status || resume_job_rel.status > 4) {
            return res.json(resp_status_builder.build(10009, "resume status has been set"));
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

            //异步发送通知

            async.parallel([function (callback) {
                sequelize.query("select company.*,job.jid from company,job where company.cid = job.company_id and job.jid = :jid limit 1", {
                    replacements: {jid: jid},
                    type: sequelize.QueryTypes.SELECT
                }).then(function (company) {
                    callback(null, company[0] || null);
                }).catch(function (err) {
                    callback(err);
                });
            }, function (callback) {
                proxy.resume.findOneByVersion(rid, resume_job_rel.version, function (err, resume) {
                    callback(err, resume);
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
                    if (option.original_status == 1) {
                        proxy.stats_job.incrResumeTreatNum(jid[0], Math.ceil((resume_job_rel.update_time - resume_job_rel.create_time) / (1000 * 3600)));
                    }
                    var data = {
                        name: results[1].name,
                        address: results[1].email,
                        subject: '简历状态更改通知'
                    };
                    switch (status) {
                        case '2':
                            email_template.contact({
                                jid: jid,
                                job_name: option.job_name,
                                cid: results[0].cid,
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
                                jid: jid,
                                job_name: option.job_name,
                                cid: results[0].cid,
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
                                jid: jid,
                                cid: results[0].cid,
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
//输入code,验证简历查看权限
exports.resumeValidate = function (req, res) {
    var rid, resumeData, code, time, option = req.body.option || {}, now = +new Date, host = res.locals.host;
    if (!option.code || !option.shareKey) {
        return res.json(resp_status_builder.build(10002));
    }
    try {
        resumeData = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, req.body.option.shareKey));
        rid = resumeData.rid;
        code = resumeData.code;
        time = resumeData.time;
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002));
    }
    if (option.code != code) {
        return res.json(resp_status_builder.build(10006, 'code error'));
    }
    if (now - time >= 3 * 24 * 60 * 1000 * 1000) {
        return res.json(resp_status_builder.build(10007, 'code expired'));
    }
    res.cookie(rid + "_r_auth_code", option.code, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 2,
        signed: true,
        httpOnly: true
    });
    var path = req.query.tp === 'det' ? '/resume/det/' : '/resume/s/';
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
        url: "http://" + host.hr + path + option.shareKey
    }));
};

exports.publicResumeTransmitted = function (req, res) {
    var option = req.body.option || {}, host = res.locals.host;
    if (!option.job_name || !option.email) {
        return res.json(resp_status_builder.build(10002));
    }
    var shareKey = option.shareKey, rid, jid, str, code, time;
    var now = +new Date;
    try {
        str = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, shareKey));
        code = str.code;
        time = str.time;
        rid = str.rid;
        jid = str.jid;
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002));
    }
    var resume_auth = req.signedCookies[rid + "_r_auth_code"];

    if (resume_auth && resume_auth == code && now - time >= 3 * 24 * 60 * 1000 * 1000) {
        return res.json(resp_status_builder.build(10011, 'code expired'));
    }
    var code1 = rankey(100000, 999999);
    var transmitData = {
        code: code1,
        time: +new Date,
        rid: rid,
        jid: jid
    };
    var shareKey1 = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(transmitData)), url = "http://" + host.hr + "/resume/s/" + shareKey1, email = option.email, data = {
        name: email.split('@')[0],
        address: email,
        subject: option.subject || '简历转发通知',
        html: "<p>" + (option.content || '') + "</p><p>邮箱查看的验证码为:" + code1 + "</p><a href ='" + url + "'>查看完整简历</a>"
    };
    validate.sendMail(data);
    async.parallel([
        function (callback) {
            sequelize.query("select company.*,job.jid from company,job where company.cid = job.company_id and job.jid = '" + jid + "' limit 1", {type: sequelize.QueryTypes.SELECT}).then(function (company) {
                callback(null, company[0] || null);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            proxy.resume.findLastResume(null, option.rid, function (err, resume) {
                callback(err, resume);
            });
        }
    ], function (err, results) {
        if (!err && results[0] && results[1]) {
            if (err) logger.error(err);
            email_template.transmit({
                jid: jid,
                job_name: option.job_name,
                cid: results[0].cid,
                company_name: results[0].name
            }, function (err, str) {
                if (!err) {
                    var data1 = {
                        name: results[1].email.split('@')[0],
                        address: results[1].email,
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

//转发简历至他人邮箱
exports.resumeTransmitted = function (req, res) {
    var jid = req.insert_data.jid, option = req.body.option || {}, employer = res.locals.employer, host = res.locals.host;
    if (!option.rid || !option.job_name) {
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
    var shareKey = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(transmitData)), email = option.email, url = "http://" + host.hr + "/resume/s/" + shareKey, data = {
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
//转发简历验证页面
exports.resumeValidatePage = function (req, res) {
    return res.render("public/resumeValidate");
};