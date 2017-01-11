var logger = require("../../common/log").logger("index");
var validate = require('../../common/validate');
var email_template = require('../../common/email_template');
var sequelize = require('../../model/connect').sequelize;
var async = require('async');
var des = require('../../common/des');
var proxy = require("../../proxy/index");
var push_template = require('../../common/push_template');
var resp_status_builder = require('../../common/response_status_builder.js');


/**
 * hr用户的快招邀请列表
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var employer = res.locals.employer;
    proxy.quick_recruit_invite.getListByEmployer({
        employer_user_id: employer.user_id,
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
 * hr通过快招发送面试邀请
 * @param req
 * @param res
 */
exports.sendInvite = function (req, res) {
    var option = req.body.option || {};
    if (!option.jid || (!option.content_id && (!option.resume_id || !option.version))) {
        return res.json(resp_status_builder.build(10002));
    }
    var employer = res.locals.employer, jid = option.jid, text = option.text;
    async.parallel([
        function (callback) {
            if (option.content_id >= 1) {
                return proxy.quick_recruit.findOneById(option.content_id, function (err, content) {
                    callback(err, content);
                });
            }
            proxy.resume.findOneByVersion(option.resume_id, option.version, function (err, resume) {
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
        if (!option.content_id && (!results[0] || !results[0].is_public)) {
            return res.json(resp_status_builder.build(10005));
        }
        if (!results[0] || !results[1]) {
            return res.json(resp_status_builder.build(10006, "content or job not exists"));
        }
        var data = results[0];
        var job = results[1];
        var now = +new Date;
        var qr_invite = {
            user_id: data.user_id,
            job_id: job.jid,
            employer_user_id: employer.user_id,
            create_time: now,
            update_time: now,
            status: 1,  // 创建，未处理
            term_id: data.term_id || 0,
            company_id: job.company_id,
            resume_id: data.resume_id || data.rid,
            version: data.version
        };

        proxy.quick_recruit_invite.create(qr_invite, function (err, rst) {
            if (err) {
               // logger.error(err);
                return res.json(resp_status_builder.build(10001, "do not repeat inviting!"));
            }
            //成功返回
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            //增加该被邀请用户的一条被邀请记录
            proxy.quick_recruit_user_info.increFieldValue(data.user_id, 'invited_num', 1);
            //发送通知
            async.parallel([
                function (callback) {
                    sequelize.query("SELECT a.*, b.`name` AS `company_name`,b.`full_name` AS `company_full_name` FROM `employer` a LEFT JOIN `company` b  ON a.`company_id` = b.`cid` WHERE a.user_id=:uid ;", {
                        replacements: {uid: job.user_id},
                        type: sequelize.QueryTypes.SELECT
                    }).then(function (employers) {
                        callback(null, employers[0]);
                    }).catch(function (err) {
                        callback(err);
                    });
                },
                function (callback) {
                    proxy.resume.findLastResume(data.user_id, data.resume_id, function (err, resume) {
                        callback(err, resume);
                    });
                }
            ], function (err, results) {
                if (err) {
                    logger.error(err);
                    return;
                }
                var employer = results[0];
                var resume = results[1];
                //发送邮件通知
                if (employer && resume) {
                    email_template.quickRecruit({
                        jid: job.jid,
                        job_name: job.name,
                        hr_name: employer.nick_name,
                        user_name: resume.name,
                        company_name: employer.company_name,
                        company_id: employer.company_id,
                        text: text
                    }, function (err, str) {
                        if (!err) {
                            validate.sendMail({
                                name: resume.email.split('@')[0],
                                address: resume.email,
                                subject: '【实习鸟】快招企业面试邀请通知',
                                html: str
                            });
                        }
                    });
                    //发送客户端通知
                    proxy.push.toSingleByUid(data.user_id, push_template.quickRecruitInvite(employer.company_name));
                }
            });
        });
    });
};
