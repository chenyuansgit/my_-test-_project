var logger = require("../../common/log").logger("index");
var md5 = require("md5");
var des = require('../../common/des');
var proxy = require('../../proxy/index');
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');
require('../../common/fn');

/*普通用户个人*/
exports.centerPage = function (req, res) {
    var uid = res.locals.uid;
    if (!uid) {
        return res.render("userCenter", {user: {}});
    }
    proxy.user.getOneById(uid, function (err, user) {
        if (err) {
            logger.error(err);
            return res.render("userCenter", {user: {}});
        }
        if (!!user) {
            return res.render("userCenter", {user: user});
        }
        var timestamp = +new Date;
        proxy.user.create({
            user_id: uid,
            create_time: timestamp,
            update_time: timestamp
        }, function (e, u) {
            if (e) {
                logger.error(e);
                return res.render("userCenter", {user: {}});
            }
            res.render("userCenter", {user: u});
        });
    });
};
exports.resumeCreatePage = function (req, res) { //简历创建
    res.render("resume/add", {user: req.insert_data.user || {}});
};
exports.resumePage = function (req, res) { //我的简历页面
    var uid = res.locals.uid;
    if (!req.insert_data.rid || !req.insert_data.rid.length) {
        var referer = req.headers['referer'];
        return res.redirect("/private/resumeCreate?forward=" + encodeURIComponent(referer));
    }
    var date = new Date(), timestamp;
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    timestamp = date.getTime();
    proxy.resume_job_rel.countByUid(uid, timestamp, function (err, count) {
        if (err) {
            logger.error(err);
            return res.render('error/404');
        }
        res.render("resume/main", {
            resume: req.insert_data.resumes,
            deliveries: count
        });
    });
};
exports.jobConditionPage = function (req, res) {//我的求职动态页面
    res.render('manage/jobCondition');
};
exports.resumeConditionPage = function (req, res) {//职位投递记录页面
    var uid = res.locals.uid, jid = req.params.jid;

    proxy.resume_job_rel.getDeliveryDetail(uid, jid, function (err, data) {
        if (err) {
            logger.error(err);
            return res.render('error/404');
        }
        return res.render("manage/resumeCondition", {
            resume_condition: data
        });
    });
};
exports.getJobConditionList = function (req, res) {
    var uid = res.locals.uid, now_time = +new Date, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time,channel_type = req.query.ct || 0;
    proxy.job.getListByUser({
        uid: uid,
        rid: req.insert_data.rid,
        channel_type :channel_type,
        status: req.query.status,
        timestamp: timestamp,
        page: req.query.page ? req.query.page : 1,
        interviewed: req.query.interviewed
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.jobs.length && (!req.query.page || req.query.page <= 1)) {
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

//修改用户基本资料,头像和昵称
exports.updateBase = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid;
    if (!option.avatar && !option.nick_name) {
        return res.json(resp_status_builder.build(10002, "请求参数错误"));
    }
    var opt = {};
    if (option.avatar) {
        opt.avatar = option.avatar;
    }
    if (option.nick_name) {
        opt.nick_name = option.nick_name;
    }
    async.parallel([
        function (callback) {
            proxy.user.getOneById(uid, function (e, user) {
                callback(e, user);
            });
        }, function (callback) {
            proxy.account.getAllByUid(uid, function (e, accounts) {
                callback(e, accounts);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003, "服务器错误"));
        }
        var user = results[0], accounts = results[1];
        if (!user && (!accounts || !accounts.length)) {
            return res.json(resp_status_builder.build(10006, '用户不存在'));
        }
        if (user) {//修改用户信息
            return proxy.user.updateOneById(uid, user, opt, function (e) {
                if (e) {
                    logger.error(e);
                    return res.json(resp_status_builder.build(10003, "服务器错误"));
                }
                if (option.nick_name) {
                    //删除显示昵称信息
                    req.session.account_name = null;
                    proxy.account.display_name.del(uid);
                }
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        }
        proxy.user.create({//创建user用户
            user_id: uid,
            nick_name: option.nick_name || '',
            avatar: option.avatar || '',
            create_time: +new Date,
            update_time: +new Date
        }, function (error) {
            if (error) {
                logger.error(error);
                return res.json(resp_status_builder.build(10005, "服务器错误"));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};
/*普通用户个人 end*/

