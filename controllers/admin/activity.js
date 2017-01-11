/**
 * Created by dell on 2016/1/15.
 */
var express = require('express');
var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var async = require('async');
require('../../common/fn');


exports.list = function (req, res) {
    var page = req.query.page > 1 ? req.query.page : 1, status = req.query.status, now_time = +new Date, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.activity.list({page: page, timestamp: timestamp, status: status}, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.activities && data.activities.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.status = status;
        data.total = data.pages;
        res.render("activity/list", data);
    });
};

exports.addPage = function (req, res) {
    res.render('activity/add', {
       // activity_type: activity_type
    });
};

exports.add = function (req, res) {
    var option = req.body.option;
    option.create_time = option.update_time = +new Date;

    proxy.activity.create(option, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000));
    });
};

exports.editPage = function (req, res) {
    var id = req.params.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    proxy.activity.findOneById(id, function (err, activity) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!activity) {
            return res.json(resp_status_builder.build(10006, "activity not exists"));
        }
        res.render('activity/edit', {
            activity: activity
        });
    });
};

exports.edit = function (req, res) {
    var id = req.params.id;
    var option = req.body.option;
    option.id = id;
    option.update_time = +new Date;
    proxy.activity.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "activity not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};

/**
 * 活动发布
 * @param req
 * @param res
 */
exports.publish = function (req, res) {
    var id = req.params.id;
    var option = {
        id: id,
        status: 1,
        update_time: +new Date
    };
    proxy.activity.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "activity not exists"));
        }
        return res.json(resp_status_builder.build(10000));
    });
};
/**
 * 活动下线
 * @param req
 * @param res
 */
exports.offline = function (req, res) {
    var id = req.params.id;
    var option = {
        status: 2,
        update_time: +new Date,
        id: id
    };
    proxy.activity.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "activity not exists"));
        }
        return res.json(resp_status_builder.build(10000));
    });
};

exports.del = function (req, res) {
    var id = req.params.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    proxy.activity.del(id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "activity not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};

//活动详情页面
exports.detailPage = function (req, res) {
    var id = req.params.id;
    proxy.activity.findOneById(id, function (err, activity) {
        if (err) {
            logger.error(err);
        }
        if (err || !activity) {
            return res.render("activity/preview", {
                account: account,
                activity: {},
                next: {},
                prev: {}
            });
        }
        async.parallel([function (callback) {
            proxy.activity.findNextOneByTime(activity.start_time, function (e, act) {
                callback(e, act);
            });
        }, function (callback) {
            proxy.activity.findPrevOneByTime(activity.start_time, function (e, act) {
                callback(e, act);
            });
        }], function (error, results) {
            if (error) {
                logger.error(error);
            }
            res.render("activity/preview", {
                activity: activity
            });
        });
    });
};

exports.previewPage = function (req, res) {
    res.render("activity/advancedPreview");
};