var config = require('../../config_default').config;
var logger = require("../../common/log").logger("index");
var des = require('../../common/des');
var proxy = require('../../proxy/index');
var email_template = require('../../common/email_template');
var resp_status_builder = require('../../common/response_status_builder.js');
var validate = require('../../common/validate');
var reg = require('../../common/utils/reg');

require('../../common/fn');


exports.companyValidateStep = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid, time = +new Date, host = res.locals.host;
    if (!reg.email.test(option.address) || (!reg.mobile_phone.test(option.phone) && !reg.tel.test(option.phone))) {
        return res.json(resp_status_builder.build(10002));
    }
    var data = {
        name: option.name ? option.name : option.address.split('@')[0],
        address: option.address,
        subject: '来自实习鸟的企业邮箱验证通知'
    };
    var encode = {
        user_id: uid,
        email: option.address,
        time: +new Date
    };
    var code = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(encode));
    var url = "http://" + host.hr + "/api/c/mailValidate?k=" + code;
    email_template.companyValidate({url: url}, function (e, html) {
        data.html = html;
    });
    if (config.company.email_validate_black.indexOf(option.address.split('@')[1].toLowerCase()) > -1) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.employer.getOneById(uid, function (err, employer) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (employer) {
            if (employer.company_id) {
                return res.json(resp_status_builder.build(10009, 'company information has been set'));
            }
            if (employer.enterprise_email_validated) {
                return res.json(resp_status_builder.build(10001, 'this email has been validated!'));
            }
            return proxy.employer.updateOneById(uid, {
                enterprise_email: option.address,
                update_time: time,
                phone: option.phone
            }, function (err, employer1) {
                if (err || !employer1) {
                    return res.json(resp_status_builder.build(10003));
                }
                res.cookie('intern_company_validate_mail', option.address, {
                    path: '/',
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                    signed: true,
                    httpOnly: true
                });
                validate.sendMail(data);
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        }
        proxy.employer.create({
            user_id: uid,
            nick_name: 'hr',
            notice_email: option.address,
            enterprise_email: option.address,
            phone: option.phone,
            create_time: time,
            update_time: time
        }, function (err, employer2) {
            if (err || !employer2) {
                if (err) {
                    logger.error(err);
                }
                return res.json(resp_status_builder.build(10003));
            }
            res.cookie('intern_company_validate_mail', option.address, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 30,
                signed: true,
                httpOnly: true
            });
            validate.sendMail(data);
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};