var myhttp = require('../common/myhttp');
var querystring = require('querystring');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../config_default').config;
var logger = require("../common/log").logger("index");

exports.sendCode = function (data, callback) {
    data.apikey = config.yunpian.apiKey;
    var content = querystring.stringify(data);
    var options = {
        host: 'sms.yunpian.com',
        path: '/v2/sms/single_send.json',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    };
    myhttp.post({option: options, content: content}, function (data) {
        callback(null, data);
    }, function (err) {
        callback(err);
    });
};
exports.sendMail = function (data, callback) {
    var transporter = nodemailer.createTransport(smtpTransport({
        "host": config.mail.host,
        "port": config.mail.port,
        "secureConnection": true, // use SSL
        "auth": {
            "user": config.mail.user,
            "pass": config.mail.pass
        }
    }));
    var mailOptions = {
        from: '实习鸟团队<' + config.mail.user + '>', // sender address
        to: typeof data.address === 'object' && data.address.constructor === Array ? data.address.join(';') : data.address, // list of receivers
        subject: data.subject,
        html: data.html
    };
    transporter.sendMail(mailOptions, function (e1, info) {
        if (e1) {
            return transporter.sendMail(mailOptions, function (e2, info1) {//失败重发第一次
                if (e2) {
                    return transporter.sendMail(mailOptions, function (e3, info2) {//失败重发第二次
                        if (e3) {
                            logger.error(e3);
                            return callback && callback(e3);//发送三次失败返回失败
                        }
                        callback && callback(null, info2);
                    });
                }
                callback && callback(null, info1);
            });
        }
        callback && callback(null, info);
    });
};