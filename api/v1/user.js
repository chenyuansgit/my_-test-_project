var logger = require("../../common/log").logger("index");
var md5 = require("md5");
var async = require('async');
var des = require('../../common/des');
var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');
var reg = require('../../common/utils/reg');
require('../../common/fn');

var refresh_expire_time = 7 * 24 * 60 * 60 * 1000;//刷新间隔时间7天


function findAccount(accounts, field, val) {
    for (var i = 0, len = accounts.length; i < len; ++i) {
        if (accounts[i][field] == val) {
            return accounts[i];
        }
    }
    return null;
}
/*获取用户信息*/
exports.getUserInfo = function (req, res) {
    var uid = req.auth.uid, user = null;
    async.parallel([function (callback) {
        proxy.user.getOneById(uid, function (e, user) {
            callback(e, user);
        });
    }, function (callback) {
        proxy.resume.findLastResume(uid, null, function (e, resume) {
            callback(e, resume);
        });
    }, function (callback) {
        proxy.account.getAllByUid(uid, function (e, accounts) {
            callback(e, accounts);
        });
    }], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, "服务器错误"));
        }
        var _user = results[0] && results[0].dataValues ? results[0].dataValues : (results[0] || {}), phone_account = findAccount(results[2], 'account_type', 1) || {}, email_account = findAccount(results[2], 'account_type', 2) || {};
        user = {
            nick_name: _user.nick_name || '',
            avatar: _user.avatar || '',
            user_id: uid,
            isBind: phone_account.account_name || email_account.account_name ? 1 : 0,
            phone: phone_account.account_name || '',
            phone_validated: phone_account.validated || 0,
            email: email_account.account_name || '',
            email_validated: email_account.validated || 0
        };
        user.is_public = results[1] && results[1].is_public ? 1 : 0;
        user.hasRefresh = results[1] && (+new Date - refresh_expire_time) < results[1].refresh_time ? 1 : 0;
        user.hasResume = results[1] && results[1].rid ? 1 : 0;
        user.resume_id = results[1] && results[1].rid ? results[1].rid : 0;
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            user: user
        }));
    });
};
exports.getResumeInfo = function (req, res) {
    var resume = req.insert_data.resumes[0];
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
        resume: resume
    }));
};
exports.getResumesList = function (req, res) {
    var resumes = req.insert_data.resumes;
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
        resumes: resumes
    }));
};
exports.getJobConditionList = function (req, res) {
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    var uid = req.auth.uid;
    proxy.job.getListByUser({
        uid: uid,
        rid: req.insert_data.rid,
        status: req.query.status,
        timestamp: timestamp,
        page: req.query.page ? req.query.page : 1,
        interviewed: req.query.interviewed
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, "服务器错误"));
        }
        if (data.jobs.length && (!req.query.page || req.query.page <= 1)) {
            data.timestamp = timestamp;
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};

//修改用户基本资料,头像和昵称
exports.updateBase = function (req, res) {
    var option = req.body.option || {}, uid = req.auth.uid;
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
//修改手机号码
exports.updatePhone = function (req, res) {
    var option = req.body.option || {}, uid = req.auth.uid;
    if (!reg.mobile_phone.test(option.phone) || !option.code) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    proxy.validate.get(option.phone, function (err, code) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10011, '验证码已过期'));
        }
        if (!code) {//验证码过期
            return res.json(resp_status_builder.build(10011, '验证码已过期'));
        }
        if (code != option.code) {//验证码不正确
            return res.json(resp_status_builder.build(10012, '验证码不正确'));
        }
        proxy.account.updatePhone(uid, option.phone, function (err) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003, '服务器错误'));
            }
            proxy.validate.del(option.phone);
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};
/*普通用户个人 end*/
