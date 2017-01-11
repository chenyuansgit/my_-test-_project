var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
require('../../common/fn');


exports.list = function (req, res) {
    var page = req.query.page > 1 ? req.query.page : 1, status = req.query.status, now_time = +new Date, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.det_report.list({
        page: page,
        timestamp: timestamp,
        status: status
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.articles && data.articles.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.status = status;
        data.total = data.pages;
        res.render("det/report_list", data);
    });
};

/**
 * 处理举报(成功)
 * @param req
 * @param res
 */
exports.success = function (req, res) {
    var id = req.params.id || req.query.id;
    var option = {
        status: 2,
        update_time: +new Date
    };
    proxy.det_report.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006));
        }
        res.json(resp_status_builder.build(10000));
    });
};
/**
 * 处理举报(成功)
 * @param req
 * @param res
 */
exports.failed = function (req, res) {
    var id = req.params.id || req.query.id;
    var option = {
        status: 3,
        update_time: +new Date
    };
    proxy.det_report.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006));
        }
        res.json(resp_status_builder.build(10000));
    });
};
