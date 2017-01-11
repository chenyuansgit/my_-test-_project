var ticket = require('../../../oauth/wechat/mp/js_ticket');
var resp_status_builder = require('../../../common/response_status_builder.js');
var logger = require("../../../common/log").logger("index");
exports.getJsApiTicket = function (req, res) {
    var url = req.query.url.indexOf('http:') > -1 || req.query.url.indexOf('https:') > -1 ? req.query.url : decodeURIComponent(req.query.url), callback = req.query.callback;
    ticket.authJsApi({url: url}, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (callback) {
            return res.send(callback + '(' + JSON.stringify(data) + ')');
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};