var logger = require("../../common/log").logger("index");
var validate = require('../../common/validate');
var email_template = require('../../common/email_template');
var sequelize = require('../../model/connect').sequelize;
var config = require('../../config_default').config;
var async = require('async');
var des = require('../../common/des');
var proxy = require("../../proxy/index");
var rankey = require('../../common/fn').rankey;
var resp_status_builder = require('../../common/response_status_builder.js');
var createEmailSubject = require('../../common/email_subject');


/*投递状态
 1:投递成功,2:带沟通,3:通知面试,4:不合适*/
//普通用户投递简历
exports.delivery = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid, rid = req.insert_data.rid[0], resumeone = req.insert_data.resumes[0];
    if (!option.job_id) {
        return res.json(resp_status_builder.build(10002));
    }
    if (!req.insert_data.rid.length) {
        return res.json(resp_status_builder.build(10006, 'you have no resumes!'));
    }
    async.parallel([
        function (callback) {
            proxy.resume_job_rel.getDeliveryTimes(uid, function (err, times) {
                callback(err, times);
            });
        },
        function (callback) {
            proxy.resume_job_rel.checkRepeatDelivering(rid, option.job_id, function (err, score) {
                callback(err, score);
            });
        }, function (callback) {
            proxy.job.findOneById(option.job_id, function (err, job) {
                callback(err, job);
            });
        }], function (err, results) {
        if (err) {
            logger.error(err);
        }
        if (err || !results || !results[2]) {
            return res.json(resp_status_builder.build(10003));
        }
        if (results[0] >= config.resume.delivery_limits) {
            return res.json(resp_status_builder.build(10013, 'you can just delivery 15 times everyday'));
        }
        if (results[1]) {
            return res.json(resp_status_builder.build(10005, 'do not repeat delivering'));
        }
        if (!results[1]) {
            var timestamp = +new Date;
            var rel_option = {
                resume_id: req.insert_data.rid[0],
                resume_user_id: uid,
                job_id: option.job_id,
                job_user_id: results[2].user_id,
                job_company_id: results[2].company_id,
                recruit_type: results[2].channel_type || 1,
                status: 1,
                create_time: timestamp,
                update_time: timestamp,
                version: resumeone.version
            };

            return proxy.resume_job_rel.create(rel_option, function (err, relation) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10003));
                }
                //增加该用户的一条投递统计记录
                proxy.quick_recruit_user_info.increFieldValue(uid, 'deliveries', 1);

                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
                //给对应职位的企业hr发送邮件通知
                sequelize.query("select job.jid,job.name,job.user_id,a.* from job,(select user_id as uid,`nick_name` as hr_name,`notice_email` as hr_mail,`email_subject_template` from employer)a where job.user_id = a.uid and jid = :jid limit 1;", {
                    replacements: {jid: option.job_id},
                    type: sequelize.QueryTypes.SELECT
                }).then(function (jobs) {
                    if (!!jobs.length && jobs[0].hr_mail) {
                        var subject = createEmailSubject(resumeone, jobs[0].name, jobs[0].email_subject_template) || (jobs[0].name + '岗位实习生:' + resumeone.name + '的简历');
                        var code = rankey(100000, 999999), encode = {
                            rid: rid,
                            jid: jobs[0].jid,
                            code: code,
                            time: +new Date
                        }, shareKey = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(encode));
                        email_template.delivery({
                            jid: jobs[0].jid,
                            job_name: jobs[0].name,
                            hr_name: jobs[0].hr_name || jobs[0].hr_mail.split('@')[0],
                            resume: resumeone,
                            shareKey: shareKey,
                            code: code
                        }, function (err, str) {
                            if (!err)  validate.sendMail({
                                name: jobs[0].hr_mail.split('@')[0],
                                address: jobs[0].hr_mail,
                                subject: subject,
                                html: str
                            });
                        });
                    }
                }).catch(function (error) {
                    logger.error(error);
                    return res.json(resp_status_builder.build(10003));
                });
            });
        }
        res.json(resp_status_builder.build(10003));
    });
};

exports.detail = function (req, res) {
    var uid = res.locals.uid, jid = req.query.jid;
    if (!jid) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.resume_job_rel.getDeliveryDetail(uid, jid, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};

