var rankey = require('../../common/fn').rankey;
var logger = require("../../common/log").logger("index");
var proxy = require('../../proxy/index');
var des = require('../../common/des');
var resp_status_builder = require('../../common/response_status_builder.js');
var email_template = require('../../common/email_template');
var config = require('../../config_default').config;
var validate = require('../../common/validate');
var reg = require('../../common/utils/reg');
require('../../common/fn');


exports.sendPhoneCode = function (req, res) {
    var option = req.body.option || {};
    if (!reg.mobile_phone.test(option.phone)) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    proxy.account.getOneByName(option.phone, function (err, account) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003, "服务器错误"));
        }
        if (!!account) {
            return res.json(resp_status_builder.build(10001, "此号码已经通过验证"));
        }
        var code = rankey(1000, 9999);
        logger.info(code);
        validate.sendCode({
            mobile: option.phone,
            text: "您好,您的验证码为:" + code + ",有效时间10分钟,请尽快完成验证【实习鸟】"
        }, function (err, data) {
            if (err || data.code) {
                logger.error(err || data.error);
                return res.json(resp_status_builder.build(10005, "服务器错误"));
            }
            logger.info(data);
            proxy.validate.set(option.phone, code);
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + "ms"));
        });
    });
};
exports.sendAccountValidateEmail = function (req, res) {
    var option = req.body.option || {}, uid = req.auth.uid;
    if (!option.address || !reg.email.test(option.address)) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.user.getOneById(uid, function (error, user) {
        if (error) {
            logger.error(error);
            return res.json(resp_status_builder.build(10005, "服务器错误"));
        }
        if (user.email_validated == 1 && user.email == option.address) {
            return res.json(resp_status_builder.build(10001, '该邮箱已经通过验证'));
        }
        proxy.account.getOneByName(option.address, function (err, account) {
            if (err) {
                return res.json(resp_status_builder.build(10003, "服务器错误"));
            }
            if (!!account && account.uid != user.user_id) {
                return res.json(resp_status_builder.build(10001, '该邮箱已经通过验证'));
            }
            var data = {
                name: option.name ? option.name : option.address.split('@')[0],
                address: option.address,
                subject: '邮箱注册的验证通知'
            };
            var encode = {
                user_id: user.user_id,
                email1: user.email || 0,
                email2: option.address,
                time: +new Date
            };
            var code = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(encode));
            var host = config.env === 'prod' ? 'www.internbird.com' : 'www.dev.internbird.com';
            var url = "http://" + host + "/api/mail/validate?k=" + code;
            email_template.accountValidate({url: url}, function (err, html) {
                data.html = html;
            });
            validate.sendMail(data);
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};

exports.sendFindPwdCode = function (req, res) {
    var option = req.body.option || {};
    var isPhone = reg.mobile_phone.test(option.account_name), isEmail = reg.email.test(option.account_name);
    if (!isEmail && !isPhone) {
        return res.json(resp_status_builder.build(10002, "请求参数错误"));
    }
    proxy.account.getOneByName(option.account_name, function (err, account) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003, "服务器错误"));
        }
        if (!account) {
            return res.json(resp_status_builder.build(10006, '用户不存在'));
        }
        var code = rankey(1000, 9999);
        //如果是手机号码,发送验证码
        if (isPhone) {
            return validate.sendCode({
                mobile: option.account_name,
                text: "您好,您的验证码为:" + code + ",有效时间10分钟,请尽快完成验证【实习鸟】"
            }, function (err, data) {
                if (err || data.error) {
                    logger.error(err || data.error);
                    return res.json(resp_status_builder.build(10005, "服务器错误"));
                }
                proxy.validate.set(option.account_name, code);
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        }
        //发送邮箱验证码
        var data = {
            name: option.account_name.split('@')[0],
            address: option.account_name,
            subject: '找回密码邮箱验证'
        };
        email_template.accountFindPwdCode({code: code}, function (err, html) {
            data.html = html;
        });
        validate.sendMail(data);//发送邮件
        proxy.emailCode.set(option.account_name, code);//在缓存中存储code数据
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};


exports.validateFindPwdCode = function (req, res) {
    var option = req.body.option || {};
    var isPhone = reg.mobile_phone.test(option.account_name), isEmail = reg.email.test(option.account_name);
    if ((!isEmail && !isPhone) || !option.code) {
        return res.json(resp_status_builder.build(10002, "请求参数错误"));
    }
    var getCode = isPhone ? proxy.validate.get : proxy.emailCode.get;
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
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};