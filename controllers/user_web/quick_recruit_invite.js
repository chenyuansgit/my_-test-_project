var logger = require("../../common/log").logger("index");
var validate = require('../../common/validate');
var email_template = require('../../common/email_template');
var async = require('async');
var des = require('../../common/des');
var proxy = require("../../proxy/index");
var push_template = require('../../common/push_template');
var resp_status_builder = require('../../common/response_status_builder.js');


/**
 * 普通用户的快招邀请列表
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    var uid = res.locals.uid, now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.quick_recruit_invite.getListByUser({
        user_id: uid,
        status: req.query.status || 1,
        timestamp: timestamp,
        page: page,
        no_count: true
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.invites.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {invites: data.invites}));
    });
};


/**
 * 普通用户响应快招邀请 response:2(接受)   3（拒绝）
 * @param req
 * @param res
 */
exports.response = function (req, res) {
    var option = req.body.option || {};
    var response = option.response;
    var id = option.id;
    var jid = option.jid;
    var term_id = option.term_id >= 1 ? option.term_id : 0;
    var user_id = res.locals.uid;

    if (!jid || !id || !response || (response != 2 && response != 3)) {
        return res.json(resp_status_builder.build(10002, "invalid id or response"));
    }
    var opt = {
        status: response,
        update_time: +new Date
    };
    proxy.quick_recruit_invite.update(opt, {
        id: id,
        user_id: user_id,
        status: 1
    }, function (err, rows) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (rows[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "inivte not exists or expired"));
        }

        async.parallel([
            function (callback) {
                proxy.resume.findLastResume(user_id, null, function (err, resume) {
                    callback(err, resume);
                });
            },
            function (callback) {
                proxy.job.findOneById(jid, function (err, job) {
                    callback(err, job);
                });
            }
        ], function (err, results) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            var resume = results[0];
            var job = results[1];
            if (!resume || !job) {
                return res.json(resp_status_builder.build(10006, "resume or job not exists"));
            }
            if (response == 3) {
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            } else {
                var timestamp = +new Date;
                var rel_option = {
                    resume_id: resume.rid,
                    resume_user_id: user_id,
                    job_id: jid,
                    job_user_id: job.user_id,
                    job_company_id: job.company_id,
                    status: 2, // 直接是待沟通状态
                    create_time: timestamp,
                    update_time: timestamp,
                    version: resume.version,
                    recruit_type: 2, // type是2
                    term_id: term_id
                };

                proxy.resume_job_rel.create(rel_option, function (err, relation) {
                    if (err) {
                        logger.error(err);
                        return res.json(resp_status_builder.build(10003));
                    }
                    //增加该用户的一条接受邀请记录
                    proxy.quick_recruit_user_info.increFieldValue(user_id, 'accepted_num', 1);

                    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
                });
            }

            //成功返回后的邮件操作,异步操作
            async.parallel([
                function (callback) {
                    proxy.company.findOne(job.company_id, function (e1, company) {
                        callback(e1, company);
                    });
                },
                function (callback) {
                    proxy.employer.getOneById(job.user_id, function (e2, employer) {
                        callback(e2, employer);
                    });
                }
            ], function (error, results) {
                if (error) {
                    logger.error(error);
                }
                if (!error && results[0] && results[1]) {
                    if (response == 2) {
                        //1.用户收到关于hr信息的邮件
                        email_template.quickRecruitAccept({
                            resume_name: resume.name,
                            company_name: results[0].name,
                            term_id: term_id || 0,
                            hr_email: results[1].notice_email,
                            cid: results[0].cid,
                            jid: job.jid,
                            job_name: job.name
                        }, function (e0, str) {
                            if (!e0) {
                                validate.sendMail({
                                    name: resume.name,
                                    address: resume.email,
                                    subject: "快招回复(来自实习鸟)",
                                    html: str
                                });
                            } else {
                                logger.error(e0);
                            }
                        });
                        //2.hr收到相应的通知
                        email_template.quickRecruitDelivery({
                            resume: resume,
                            job_name: job.name,
                            jid: job.jid,
                            term_id: term_id,
                            hr_name: results[1].nick_name
                        }, function (e0, str) {
                            if (!e0) {
                                validate.sendMail({
                                    name: 'hr',
                                    address: results[1].notice_email,
                                    subject: "快招被接受通知(来自实习鸟)",
                                    html: str
                                });
                            } else {
                                logger.error(e0);
                            }
                        });
                    } else {
                        //2.hr收到相应的通知
                        logger.info(results[1]);
                        email_template.quickRecruitRefused({
                            resume: resume,
                            job_name: job.name,
                            jid: job.jid,
                            term_id: term_id,
                            hr_name: results[1].nick_name
                        }, function (e0, str) {
                            if (!e0) {
                                validate.sendMail({
                                    name: 'hr',
                                    address: results[1].notice_email,
                                    subject: "快招被拒绝通知(来自实习鸟)",
                                    html: str
                                });
                            } else {
                                logger.error(e0);
                            }
                        });
                    }
                }
            });

        });
    });
};