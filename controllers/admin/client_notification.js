var logger = require("../../common/log").logger("index");
var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');

exports.list = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.client_notification.list({timestamp: timestamp, page: page}, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        data.total = data.pages;
        res.render('notification/list', data);
    });
};
exports.addPage = function (req, res) {
    res.render('notification/add');
};
exports.add = function (req, res) {
    var option = req.body.option;
    if (!option) {
        return res.json(resp_status_builder.build(10002));
    }
    option.create_time = option.update_time = +new Date;
    proxy.client_notification.create(option, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.json(resp_status_builder.build(10000));
    });
};
exports.editPage = function (req, res) {
    var id = req.params.id;
    proxy.client_notification.findOneById(id, function (err, notification) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.render('notification/edit', {
            client_notification: notification || {}
        });
    });
};
exports.edit = function (req, res) {
    var option = req.body.option, id = req.params.id;
    if (!option || !id) {
        return res.json(resp_status_builder.build(10002));
    }
    option.update_time = +new Date;
    proxy.client_notification.updateOneById(id, option, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.json(resp_status_builder.build(10000));
    });
};

exports.push = function (req, res) {
    var option = req.body.option, id = req.params.id;
    if (!option || !id) {
        return res.json(resp_status_builder.build(10002));
    }
    option.update_time = +new Date;
    proxy.client_notification.push(id, option, function (err,isPush) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if(isPush){
            return res.json(resp_status_builder.build(10001));//已推送,不可重复推送
        }
        res.json(resp_status_builder.build(10000));
    });
};