var md5 = require("md5");
var logger = require("../../common/log").logger("index");
var config = require("../../config_default").config;
var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');
var reg = require('../../common/utils/reg');
require('../../common/fn');


exports.loginPage = function (req, res) {
    var platform = res.locals.platform, forward = res.locals.forward, type = req.query.type;
    if (res.locals.uid) {
        return res.redirect(decodeURIComponent(forward));
    }
    if (platform === 'web') {
        return res.render('web/login');
    }
    if (type === 'companyMobile') {
        return res.render('i/login');
    }
    res.render('m/login');
};

exports.login = function (req, res) {
    var option = req.body.option;
    if (!option || !option.password || (!reg.mobile_phone.test(option.user) && !reg.email.test(option.user)) || !reg.password.test(option.password)) {//暂时只支持两种格式登陆
        return res.json(resp_status_builder.build(10002));
    }
    proxy.account.getOneByName(option.user, function (e, account) {
        if (e) {//服务器错误
            logger.error(e);
            return res.json(resp_status_builder.build(10005));
        }
        if (!account) {
            return res.json(resp_status_builder.build(10006, "user not exists"));
        }
        if (account.pwd != md5(md5(option.password + config.auth.auth_token_secret))) {
            return res.json(resp_status_builder.build(10007, "wrong account or password"));
        }
        //设置session
        req.session.uid = account.uid;

        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};

exports.quitLogin = function (req, res) {
    var callback = req.query.callback;
    try {
        req.session.destroy();
    } catch (e) {
        logger.error(e);
    }
    var json = resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms');
    if (callback) {
        return res.send(callback + '(' + JSON.stringify(json) + ')');
    }
    res.json(json);
};