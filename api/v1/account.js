var md5 = require("md5");
var logger = require("../../common/log").logger("index");
var config = require("../../config_default").config;
var proxy = require('../../proxy/index');
var validate = require('../../common/validate');
var resp_status_builder = require('../../common/response_status_builder.js');
var des = require('../../common/des');
var reg = require('../../common/utils/reg');

/**
 *  登录
 * @param req
 * @param res
 * @returns {*}
 */
exports.login = function (req, res) {
    var option = req.body.option || {}, app_device_id = req.headers['app_device_id'] || option.app_device_id, app_channel = req.headers['app_channel'] || option.app_channel, app_platform = req.headers['app_platform'] || option.app_platform;
    if (!option.password || (!reg.mobile_phone.test(option.user) && !reg.email.test(option.user)) || !reg.password.test(option.password) || !app_device_id || !app_platform || !app_channel) {//暂时只支持两种格式登陆
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    proxy.account.getOneByName(option.user, function (e, account) {
        if (e) {//服务器错误
            logger.error(e);
            return res.json(resp_status_builder.build(10005, "服务器错误"));
        }
        if (!account) {
            return res.json(resp_status_builder.build(10006, "用户不存在"));
        }
        if (account.pwd != md5(md5(option.password + config.auth.auth_token_secret))) {
            return res.json(resp_status_builder.build(10007, "用户名或密码错误"));
        }
        var auth_token = md5(account.uid + app_device_id + app_platform + app_channel + (+new Date));
        //存储auth_token
        proxy.auth_token.set(account.uid, auth_token);
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            uid: account.uid,
            auth_token: auth_token
        }));
    });
};

/**
 * 登出
 * @param req
 * @param res
 */

exports.quitLogin = function (req, res) {
    var auth = req.auth;
    proxy.auth_token.del(auth.uid, auth.auth_token);
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + "ms"));
};
/**
 * 注册
 * @param req
 * @param res
 * @returns {*}
 */
exports.register = function (req, res) {
    var option = req.body.option, time = +new Date;
    if (!option.phone || !option.password || !reg.mobile_phone.test(option.phone) || !reg.password.test(option.password)) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    proxy.validate.get(option.phone, function (e, code) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10005, '服务器错误'));
        }
        if (!code) {//验证码过期
            return res.json(resp_status_builder.build(10011, '验证码过期'));
        }
        if (code != option.code) {//验证码不正确
            return res.json(resp_status_builder.build(10012, '验证码错误'));
        }
        proxy.account.getOneByName(option.phone, function (e0, account) {
            if (e0) {
                logger.error(e0);
                return res.json(resp_status_builder.build(10005, '服务器错误'));
            }
            if (!!account) {
                return res.json(resp_status_builder.build(10001, "手机号码已经被注册"));
            }
            var pwd = md5(md5(option.password + config.auth.auth_token_secret));
            proxy.account.createUid(function (e1, uid) {
                if (e1) {
                    logger.error(e1);
                    return res.json(resp_status_builder.build(10005, '服务器错误'));
                }
                proxy.account.create({//注册账户信息
                    account_name: option.phone,
                    uid: uid,
                    pwd: pwd,
                    account_type: 1,
                    create_time: time,
                    update_time: time
                }, function (error) {
                    if (error) {
                        logger.error(error);
                        return res.json(resp_status_builder.build(10005, '服务器错误'));
                    }
                    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + "ms"));
                });

            });
        });
    });
};
exports.updatePass = function (req, res) {
    var option = req.body.option || {}, uid = req.auth.uid;
    if (!option.old_pass || !option.new_pass) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    proxy.account.updatePwd(uid, option.old_pass, option.new_pass, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003, '服务器错误'));
        }
        if (!row[0]) {
            return res.json(resp_status_builder.build(10006, "原密码错误"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
//找回密码
exports.findPwd = function (req, res) {
    var option = req.body.option || {};
    var isPhone = reg.mobile_phone.test(option.account_name), isEmail = reg.email.test(option.account_name);
    if ((!isEmail && !isPhone) || !option.code || !reg.password.test(option.password)) {
        return res.json(resp_status_builder.build(10002, "请求参数错误"));
    }
    var getCode = isPhone ? proxy.validate.get : proxy.emailCode.get, delCode = isPhone ? proxy.validate.del : proxy.emailCode.del;
    getCode(option.account_name, function (err, code) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, "服务器错误"));
        }
        if (!code) {//验证码过期
            return res.json(resp_status_builder.build(10011, "验证码已过期"));
        }
        if (code != option.code) {//验证码不正确
            return res.json(resp_status_builder.build(10012, "验证码不正确"));
        }
        proxy.account.getOneByName(option.account_name, function (err, account) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003, "服务器错误"));
            }
            if (!account) {//没有此用户
                return res.json(resp_status_builder.build(10006, "用户不存在"));
            }
            proxy.account.findPwd(account.uid, option.password, function (err, row) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10003, "服务器错误"));
                }
                if (!row[0]) {//更新失败
                    return res.json(resp_status_builder.build(10003, "服务器错误"));
                }
                delCode(option.account_name);
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        });
    });
};