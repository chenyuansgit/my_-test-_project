var logger = require("../../common/log").logger("index");
var validate = require('../../common/validate');
var email_template = require('../../common/email_template');
var config = require('../../config_default').config;
var async = require('async');
var des = require('../../common/des');
var proxy = require("../../proxy/index");
var rankey = require('../../common/fn').rankey;
var resp_status_builder = require('../../common/response_status_builder.js');
var createEmailSubject = require('../../common/email_subject');
var reg = require('../../common/utils/reg');


exports.resumeDelivery = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid, resumeone = req.insert_data.resumes[0];
    if (!option.det_id) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    if (!req.insert_data.rid.length) {
        return res.json(resp_status_builder.build(10006, "当前没有简历"));
    }
    async.parallel([
        function (callback) {
            proxy.resume_job_rel.getDeliveryTimes(uid, function (err, times) {
                callback(err, times);
            });
        },
        function (callback) {
            proxy.resume_det_rel.isDelivery(uid, option.det_id, function (err, score) {
                callback(err, score);
            });
        }, function (callback) {
            proxy.det.findOneById(option.det_id, function (err, det) {
                callback(err, det);
            });
        }], function (err, results) {
        if (err) {
            logger.error(err);
        }
        if (err || !results || !results[2]) {
            return res.json(resp_status_builder.build(10005));
        }
        if (results[2] && reg.url.test(results[2].redirect_uri)) {
            return res.json(resp_status_builder.build(10008,'此链接为外网地址'));
        }
        if (results[0] >= config.resume.delivery_limits) {
            return res.json(resp_status_builder.build(10013, '简历投递每日上限15次'));
        }
        if (results[1]) {
            return res.json(resp_status_builder.build(10007, '不要重复投递'));
        }
        if (!results[1]) {
            var timestamp = +new Date;
            var rel_option = {
                resume_id: req.insert_data.rid[0],
                resume_user_id: uid,
                det_id: option.det_id,
                recruit_type: results[2].channel_type || 2,
                create_time: timestamp,
                update_time: timestamp,
                version: resumeone.version
            };
            var det = results[2];
            return proxy.resume_det_rel.create(rel_option, function (err) {
                if (err) {
                    return res.json(resp_status_builder.build(10005, '服务器错误'));
                }
                //增加该用户的一条投递统计记录
                proxy.quick_recruit_user_info.increFieldValue(uid, 'deliveries', 1);

                //增加一个包打听职位的简历投递数
                proxy.stats_det.incrResumeNum(option.det_id);

                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
                //给对应职位的企业hr发送邮件通知
                var subject = createEmailSubject(resumeone, det.name, det.email_subject_template) || (det.name + '岗位实习生:' + resumeone.name + '的简历');
                var code = rankey(100000, 999999), encode = {
                    rid: resumeone.rid,
                    det_id: det.id,
                    code: code,
                    time: +new Date
                }, shareKey = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(encode));
                email_template.detDelivery({
                    det_id: det.id,
                    job_name: det.name,
                    hr_name: 'hr',
                    resume: resumeone,
                    shareKey: shareKey,
                    code: code
                }, function (err, str) {
                    if (!err)  validate.sendMail({
                        name: det.notice_email.split('@')[0],
                        address: det.notice_email,
                        subject: subject,
                        html: str
                    });
                });
            });
        }
        res.json(resp_status_builder.build(10005, "服务器错误"));
    });
};

exports.listPage = function (req, res) {
    res.render("manage/detCondition");
};
exports.list = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    var channel_type = req.query.ct || 0;
    proxy.resume_det_rel.list(res.locals.uid, page, channel_type, timestamp, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, "服务器错误"));
        }
        if (data.dets.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};