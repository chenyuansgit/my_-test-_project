var des = require('../../common/des');
var logger = require("../../common/log").logger("index");
var config = require("../../config_default").config;
var proxy = require('../../proxy/index');
var reg = require('../../common/utils/reg');
var validate = require('../../common/validate');
var resp_status_builder = require('../../common/response_status_builder.js');
require('../../common/fn');


/*修改密码*/
exports.updatePass = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid;
    if (!reg.password.test(option.old_pass) || !reg.password.test(option.new_pass)) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.account.updatePwd(uid, option.old_pass, option.new_pass, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row[0]) {
            return res.json(resp_status_builder.build(10006, "原密码错误"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};

/*找回密码*/
exports.findPwdPage = function(req, res){
    var platform = res.locals.platform, forward = res.locals.forward, type = req.query.type;
    var step = req.query.step || '';
    if (res.locals.uid) {
        return res.redirect(forward);
    }
    if (platform === 'web') {
        if(step == 2){
            return res.render('web/setting/findPwdByEmail');
        }
        return res.render('web/setting/findPwd');
    }
    if (type === 'companyMobile') {
        return res.render('i/setting/findPwd');
    }
    res.render('m/setting/findPwd');
};
exports.findPwd = function (req, res) {
    var by = req.query.by;
    if(by == 'email'){
        return findPwdByEmail(req, res);
    }
    if(by == 'phone'){
        return findPwdByPhone(req, res);
    }
    return findPwdByCode(req, res);
};
function findPwdByPhone(req, res) {
    var option = req.body.option;
    if (!option || !reg.mobile_phone.test(option.phone) || !option.code || !reg.password.test(option.password)) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.validate.get(option.phone, function (err, code) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (!code) {//验证码过期
            return res.json(resp_status_builder.build(10011));
        }
        if (code != option.code) {//验证码不正确
            return res.json(resp_status_builder.build(10012));
        }
        proxy.account.getOneByName(option.phone, function (err, account) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            if (!account) {//没有此用户
                return res.json(resp_status_builder.build(10006, "account not exists"));
            }
            proxy.account.findPwd(account.uid, option.password, function (err, row) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10003));
                }
                if (!row[0]) {//更新失败
                    return res.json(resp_status_builder.build(10003));
                }
                proxy.validate.del(option.phone);
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        });
    });
}
function findPwdByEmail(req, res) {
    var option = req.body.option, now = +new Date, key = option.key, decode, email, time;
    if (!option || !reg.password.test(option.password)) {
        return res.json(resp_status_builder.build(10002));
    }
    try {
        decode = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, key));
        email = decode.email;
        time = decode.time;
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002));
    }
    if (now - time >= 60 * 60 * 1000) {
        return res.json(resp_status_builder.build(10011, "key may be expired"));
    }
    proxy.account.getOneByName(email, function (err, account) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!account) {//没有此用户
            return res.json(resp_status_builder.build(10006, "account not exists"));
        }
        proxy.account.findPwd(account.uid, option.password, function (err, row) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            if (!row[0]) {//更新失败
                return res.json(resp_status_builder.build(10003));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
}
function findPwdByCode(req, res) {
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
}