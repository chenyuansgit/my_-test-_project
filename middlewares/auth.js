var logger = require("../common/log").logger("index");
var proxy = require('../proxy/index');
var resp_status_builder = require('../common/response_status_builder.js');
var config = require('../config_default').config;


exports.account = function (req, res, next) {
    res.locals.account = {};
    try {
        if (req.session && req.session.uid) {
            res.locals.uid = res.locals.account.uid = req.session.uid;
        }
        next();
    } catch (e) {
        logger.error(e);
        next();
    }
};
exports.login = function (req, res, next) {
    if (!res.locals.uid) {
        return res.json(resp_status_builder.build(10004));
    }
    next();
};
exports.loginRedirect = function (req, res, next) {
    var base = "http://" + res.locals.host.account, type = config.name === 'company_mobile' ? 'companyMobile' : '';
    if (!res.locals.uid) {
        return res.redirect(base + "/login?forward=" + res.locals.encodeOriginalUrl + "&type=" + type);
    }
    next();
};
function checkEmployer(uid, callback) {
    proxy.employer.getOneById(uid, function (err, employer) {
        if (err) {
            return callback(err);
        }
        var code = 1;
        if (employer) {
            if (employer.company_id != 0) {
                code = 4;
            } else {
                if (employer.enterprise_email_validated) {
                    code = 3;
                } else {
                    code = 2;
                }
            }
        }
        callback(null, code, employer || null);
    });
}

exports.checkEmployerValidate = function (req, res, next) {
    var uid = res.locals.uid;
    checkEmployer(uid, function (err, code, employer) {
        req.auth_employer = {
            error: err,
            code: code
        };
        res.locals.employer = employer || {};
        next();
    });
};

exports.employerApi = function (req, res, next) {
    var uid = res.locals.uid;
    checkEmployer(uid, function (err, code, employer) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        switch (code) {
            case 1:
                res.json(resp_status_builder.build(10008, '找不到该企业用户'));
                break;
            case 2:
                res.json(resp_status_builder.build(10009, '该企业用户未验证'));
                break;
            case 3:
                res.json(resp_status_builder.build(10010, '该企业用户未创建公司'));
                break;
            case 4:
                res.locals.employer = employer || {};
                next();
                break;
        }
    });
};
exports.employerRender = function (req, res, next) {
    var uid = res.locals.uid;
    checkEmployer(uid, function (err, code, employer) {
        if (err) {
            logger.error(err);
            return res.redirect('/company/validate?step=1');
        }
        switch (code) {
            case 1:
                res.redirect('/company/validate?step=1');
                break;
            case 2:
                res.redirect('/company/validate?step=2');
                break;
            case 3:
                res.redirect('/company/validate?step=3');
                break;
            case 4:
                res.locals.employer = employer || {};
                next();
                break;
        }
    });
};
exports.user = function (req, res, next) {
    var uid = res.locals.uid, time = +new Date;
    proxy.user.getOneById(uid, function (err, user) {
        if (err) {
            logger.error(err);
            req.error = err;
        }
        if (!!user) {
            res.locals.user = user;
            return next();
        }
        proxy.user.create({
            user_id: uid,
            create_time: time,
            update_time: time
        }, function (e, _user) {
            if (e) {
                logger.error(e);
                req.error = e;
            }
            res.locals.user = _user || {};
            next();
        });
    });
};