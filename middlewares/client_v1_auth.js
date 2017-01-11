var logger = require("../common/log").logger("index");
var express = require("express");
var config = require("../config_default").config;
var md5 = require('md5');
var proxy = require('../proxy/index');
var resp_status_builder = require('../common/response_status_builder.js');
var async = require('async');
var sequelize = require('../model/connect').sequelize;
var db = require('../model/index').models;
var loginStatusValidate = require('./login').loginStatusValidate;


//每次客户端的api请求,验证签名,防止api被恶刷
exports.apiSign = function (req, res, next) {
    req.start_time = +new Date;
    if (req.body && req.body.option && typeof req.body.option != 'object') {
        try {
            req.body.option = JSON.parse(req.body.option);
        } catch (e) {
            logger.error("option error:" + e);
        }
    }
    if (config.env === 'prod') {//生产环境校检api权限
        var app_timestamp = req.headers['app_timestamp'], app_key = req.headers['app_key'], app_sign = req.headers['app_sign'], path = "/v1" + req.path, method = req.method.toLowerCase();
        if (!app_timestamp) {
            return res.json(resp_status_builder.build(10020, 'app_timestamp参数错误'));
        }
        if (!app_key || !config.client_app_key_secret[app_key]) {
            return res.json(resp_status_builder.build(10021, 'app_key参数错误'));
        }
        //加密方式按照字母排序app_key+app_secret+app_timestamp+method+path
        var sign = md5(app_key + config.client_app_key_secret[app_key] + app_timestamp + path + method);
        if (!app_sign || sign != app_sign) {
            return res.json(resp_status_builder.build(10022, 'app_sign签名错误'));
        }
    }
    next();
};
//根据uid和auth_token验证登录状态
exports.login = function (req, res, next) {
    var option = req.body.option || {};
    var uid = req.headers['uid'] || req.query.uid || option.uid;
    var auth_token = req.headers['auth_token'] || req.query.auth_token || option.auth_token;
    req.auth = {};
    loginStatusValidate(uid, auth_token, function (code, msg) {
        if (code) {
            return res.json(resp_status_builder.build(code, msg));
        }
        req.auth.uid = uid;
        req.auth.auth_token = auth_token;
        next();
    });
};

//用户操作简历的时候对用户和简历关系校验
exports.userResumeAuth = function (req, res, next) {
    req.insert_data = req.insert_data || {};
    var option = req.body.option || {}, rid = req.params.rid || req.query.rid || option.rid || "", uid = req.auth.uid, rid_arr = [];
    try {
        rid_arr = (rid && rid.split(',')) || [];
    } catch (e) {
    }
    var ops = {
        where: {
            user_id: uid
        },
        order: "version DESC",
        limit: 1
    };
    if (!!rid_arr.length && rid) {
        ops.where.rid = rid_arr;
    }
    if (rid_arr.length == 1) {
        return db.resume.findOne(ops).then(function (resume) {
            if (!resume) {
                req.insert_data.rid = req.insert_data.resumes = [];
                return next();
            }
            req.insert_data.rid = rid_arr;
            req.insert_data.resumes = [resume];
            next();
        }).catch(function (err) {
            logger.error(err);
            res.json(resp_status_builder.build(10003, '服务器错误'));
        });
    }
    ops.group = "rid";
    sequelize.query("SELECT * FROM `resume` ,(SELECT `rid`,MAX(`version`) AS `version` FROM `resume` WHERE `user_id`= " + uid + " GROUP BY `rid`) b WHERE `resume`.rid = b.rid AND `resume`.`version` = b.`version`  ORDER BY `create_time`;", {type: sequelize.QueryTypes.SELECT}).then(function (resume) {
        if (!resume || !resume.length || resume.length < rid_arr.length) {
            req.insert_data.rid = req.insert_data.resumes = [];
            return next();
        }
        if (!rid_arr.length) {
            for (var i = 0, len = resume.length; i < len; ++i) {
                rid_arr.push(resume[i].rid);
            }
        }
        req.insert_data.rid = rid_arr;
        req.insert_data.resumes = resume;
        next();
    }).catch(function (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10003, '服务器错误'));
    });

};