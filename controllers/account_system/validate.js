var rankey = require('../../common/fn').rankey;
var config = require('../../config_default').config;
var logger = require("../../common/log").logger("index");
var des = require('../../common/des');
var proxy = require('../../proxy/index');
var email_template = require('../../common/email_template');
var resp_status_builder = require('../../common/response_status_builder.js');
var validate = require('../../common/validate');
var codeImg = require('../../common/codeImg');
var reg = require('../../common/utils/reg');
require('../../common/fn');


exports.sendPhoneCode = function (req, res) {
    var option = req.body.option || {}, sessionId = req.sessionID;
    if (!reg.mobile_phone.test(option.phone) || !sessionId || !option.vcode) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.validate.getVcode(sessionId, function (error, vcode) {
        if (error) {
            logger.error(error);
            return res.json(resp_status_builder.build(10003));
        }
        if (vcode != option.vcode.toLowerCase()) {
            return res.json(resp_status_builder.build(10007, '无效的图片验证码'));
        }
        proxy.account.getOneByName(option.phone, function (err, account) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            if (!!account) {
                return res.json(resp_status_builder.build(10001, 'this phone has been validated!'));
            }
            var code = rankey(1000, 9999);
            validate.sendCode({
                mobile: option.phone,
                text: "您好,您的验证码为:" + code + ",有效时间10分钟,请尽快完成验证【实习鸟】"
            }, function (err, data) {
                if (err || data.code) {
                    logger.error(err || data);
                    return res.json(resp_status_builder.build(10005));
                }
                console.log(data);
                proxy.validate.set(option.phone, code);
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        });
    });
};
exports.sendFindPwdCode = function (req, res) {
    var option = req.body.option || {}, sessionId = req.sessionID;
    var isPhone = reg.mobile_phone.test(option.account_name), isEmail = reg.email.test(option.account_name);
    if ((!isEmail && !isPhone) || !option.vcode || !sessionId) {
        return res.json(resp_status_builder.build(10002, "请求参数错误"));
    }
    proxy.validate.getVcode(sessionId, function (error, vcode) {
        if (error) {
            logger.error(error);
            return res.json(resp_status_builder.build(10003));
        }
        if (vcode != option.vcode.toLowerCase()) {
            return res.json(resp_status_builder.build(10007, '无效的图片验证码'));
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
                    console.log(code);
                    if (err || data.code) {
                        logger.error(err || data);
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
    });
};
//移动端验证找回密码验证码
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
exports.sendFindPwdEmail = function (req, res) {
    var option = req.body.option || {}, host = res.locals.host;
    if (!reg.email.test(option.email)) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.account.getOneByName(option.email, function (err, account) {
        if (err) {
            return res.json(resp_status_builder.build(10003));
        }
        if (!account) {
            return res.json(resp_status_builder.build(10006, 'no this account'));
        }
        var data = {
            name: option.email.split('@')[0],
            address: option.email,
            subject: '找回密码的验证通知'
        };
        var encode = {
            email: option.email,
            time: +new Date
        };
        var code = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(encode));
        var url = "http://" + host.account + "/findPwd?step=2&k=" + code;
        email_template.accountFindPwd({url: url}, function (err, html) {
            data.html = html;
        });
        validate.sendMail(data);
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
exports.sendAccountValidateEmail = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid, host = res.locals.host;
    if (!reg.email.test(option.address)) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.account.getOneByName(option.address, function (err, account) {
        if (err) {
            return res.json(resp_status_builder.build(10003));
        }
        if (!!account && (account.uid !== uid || (account.uid === uid && account.validated == 1))) {
            return res.json(resp_status_builder.build(10001, 'this email has been validated!'));
        }
        var data = {
            name: option.name ? option.name : option.address.split('@')[0],
            address: option.address,
            subject: ' 邮箱注册的验证通知'
        };
        var encode = {
            user_id: uid,
            email: option.address,
            time: +new Date
        };
        var code = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(encode));
        var url = "http://" + host.account + "/api/mail/validate?k=" + code;
        email_template.accountValidate({url: url}, function (err, html) {
            data.html = html;
        });
        validate.sendMail(data);
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
exports.codeImg = function (req, res) {
    var sessionId = req.sessionID;
    codeImg.toBuffer({}, function (err, code, buf) {
        if (err) {
            return res.json(resp_status_builder.build(10005));
        }
        if (sessionId && sessionId !== 'undefined') {
            proxy.validate.setVcode(sessionId, code.toLowerCase());
        }
        res.writeHead('200', {'Content-Type': 'image/jpeg'});
        res.end(buf, 'binary');
    });
};






