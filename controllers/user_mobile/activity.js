var logger = require("../../common/log").logger("index");
var proxy = require('../../proxy/index');
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');


//活动主页面
exports.listPage = function (req, res) {
    res.render("activity/list");
};
exports.list = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.activity.list({
        category_id: req.query.category_id,
        status: 1,
        page: page,
        timestamp: timestamp
    }, function (err, data) {
        if (err) {
            logger.error(err);
            data = {};
        }
        if (data.activities && data.activities.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
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
            return res.render("activity/detail", {
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
            res.render("activity/detail", {
                activity: activity,
                next: results[0] || {},
                prev: results[1] || {}
            });
        });
    });
};
