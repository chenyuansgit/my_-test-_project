var md5 = require("md5");
var logger = require("../../common/log").logger("index");
var config = require("../../config_default").config;
var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');
var reg = require('../../common/utils/reg');
require('../../common/fn');


exports.registerPage = function (req, res) {
    var platform = res.locals.platform, forward = res.locals.forward;
    if (res.locals.uid) {
        return res.redirect(decodeURIComponent(forward));
    }
    if (platform === 'web') {
        return res.render('web/register');
    }
    res.render('m/register');
};
exports.register = function (req, res) {
    return req.query.by == 'email' ? registerByEmail(req, res) : registerByPhone(req, res);
};

function registerByPhone(req, res) {
    var option = req.body.option || {}, time = +new Date;
    if (!option.password || !reg.mobile_phone.test(option.phone) || !reg.password.test(option.password)) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.validate.get(option.phone, function (e, code) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10005));
        }
        if (!code) {//验证码过期
            return res.json(resp_status_builder.build(10011));
        }
        if (code != option.code) {//验证码不正确
            return res.json(resp_status_builder.build(10012));
        }
        proxy.account.getOneByName(option.phone, function (e0, account) {
            if (e0) {
                logger.error(e0);
                return res.json(resp_status_builder.build(10005));
            }
            if (!!account) {
                return res.json(resp_status_builder.build(10001, "phone has been registered!"));
            }
            var pwd = md5(md5(option.password + config.auth.auth_token_secret));
            proxy.account.createUid(function (e1, uid) {
                if (e1) {
                    logger.error(e1);
                    return res.json(resp_status_builder.build(10005));
                }
                proxy.account.create({//注册账户信息
                    account_name: option.phone,
                    uid: uid,
                    pwd: pwd,
                    account_type: 1,
                    create_time: time,
                    update_time: time
                }, function (e2, account) {
                    if (e2) {//账户信息创建成功后返回
                        logger.error(e2);
                        return res.json(resp_status_builder.build(10005));
                    }
                    //设置session
                    req.session.uid = account.uid;

                    proxy.validate.del(option.phone);
                    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
                });

            });
        });
    });
}
function registerByEmail(req, res) {
    var option = req.body.option || {}, time = +new Date;
    if (!option.email || !option.password || !reg.email.test(option.email) || !reg.password.test(option.password)) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.account.getOneByName(option.email, function (e0, account) {
        if (e0) {
            logger.error(e0);
            return res.json(resp_status_builder.build(10005));
        }
        if (!!account) {
            return res.json(resp_status_builder.build(10001, "email has been registered!"));
        }
        var pwd = md5(md5(option.password + config.auth.auth_token_secret));
        proxy.account.createUid(function (e1, uid) {
            if (e1) {
                logger.error(e1);
                return res.json(resp_status_builder.build(10005));
            }
            proxy.account.create({//注册账户信息
                account_name: option.email,
                uid: uid,
                pwd: pwd,
                validated: 0,
                account_type: 2,
                create_time: time,
                update_time: time
            }, function (e2, account) {
                if (e2) {//账户信息创建成功后返回
                    logger.error(e2);
                    return res.json(resp_status_builder.build(10005));
                }
                //设置session
                req.session.uid = account.uid;
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });

        });
    });
}
