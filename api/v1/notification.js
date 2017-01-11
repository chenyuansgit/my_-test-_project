var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');

exports.list = function(req,res){
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    proxy.client_notification.list({
        timestamp: timestamp,
        page: page
    },function(err,data){
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.notifications.length && (page == 1)) {
            data.timestamp = timestamp;
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};