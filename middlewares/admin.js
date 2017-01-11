var logger = require("../common/log").logger("index");
var express = require("express");
var base64 = require("js-base64").Base64;
var proxy = require('../proxy/index');
var resp_status_builder = require('../common/response_status_builder.js');
var allPermissionList = ['admin', 'data', 'company', 'student', 'employer', 'job', 'det', 'ad', 'quick_recruit', 'message', 'activity', 'article', 'other'];
require('../common/fn');


exports.account = function (req, res, next) {
    req.start_time = +new Date;
    try {
        res.locals = {};
        var auth_token = req.signedCookies['$internbird_admin'], account_name = base64.decode(auth_token);
    } catch (e) {
        logger.error(e);
        return next();
    }
    if (!account_name) {
        return next();
    }
    proxy.admin.findOneByName(account_name, function (err, admin) {
        if (err) {
            logger.error(err);
        }
        if (!err && admin) {
            res.locals.admin = account_name;
            res.locals.permissionList = admin.permission ? JSON.parse(admin.permission) : [];
        }
        next();
    });
};
exports.admin = function (req, res, next) {
    if (res.locals && res.locals.admin) {
        return next();
    }
    if (req.method.toLowerCase() === 'post') {
        return res.json(resp_status_builder.build(10004));
    }
    res.redirect('/login');
};

exports.permissionCheck = function (permission) {
    return function (req, res, next) {
        var permissionList = res.locals.permissionList || [];
        if (!permissionList || permissionList.constructor !== Array || !permissionList.length || permissionList.indexOf(permission) === -1) {
            if (req.method.toLowerCase() === 'get') {
                return res.render('error/noPermissions');
            }
            return res.json(resp_status_builder.build(10007));
        }
        next();
    };
};