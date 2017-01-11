var md5 = require("md5");
var des = require('../../common/des');
var proxy = require('../../proxy/index');
var config = require("../../config_default").config;
var base64 = require("js-base64").Base64;
var resp_status_builder = require('../../common/response_status_builder.js');
var logger = require("../../common/log").logger("index");

function setAuthCookie(count, res) {
    var auth_token = base64.encode(count);
    res.cookie('$internbird_admin', auth_token, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        signed: true,
        httpOnly: true
    });
}
exports.setAuthCookie = setAuthCookie;

exports.loginPage = function (req, res) {
    res.render("sign/login");
};

exports.login = function (req, res) {
    var option = req.body.option ||{};
    if ( !option.password ||!option.user) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.admin.findOneByName(option.user, function (e, admin) {
        if (e) {//服务器错误
            logger.error(e);
            return res.json(resp_status_builder.build(10005));
        }
        if (!admin) {
            return res.json(resp_status_builder.build(10006, "user not exists"));
        }
        if (admin.pwd != md5(md5(option.password + config.auth.auth_token_secret))) {
            return res.json(resp_status_builder.build(10007, "wrong account or password"));
        }
        setAuthCookie(admin.account_name, res);//设置客户端cookie

        res.json(resp_status_builder.build(10000,(+new Date - req.start_time)+'ms'));
    });
};

exports.logout = function (req, res) {
    res.clearCookie(config.auth.auth_token_name, {path: "/"});
    res.json(resp_status_builder.build(10000));
};