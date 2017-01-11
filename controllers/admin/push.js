var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');

//推送页面
exports.testPage = function (req, res) {
    res.render('notification/test');
};

exports.test = function (req, res) {
    var option = req.body.option || {};
    if (!option.uid || !option.transmissionContent || !option.transmissionContent.msg || (!option.transmissionContent.code && !option.transmissionContent.uri)) {
        return res.json(resp_status_builder.build(10002));
    }
    var transmission = {
        APNS: option.APNS ? true : false,
        transmissionContent: option.transmissionContent
    };
    proxy.push.toSingleByUid(option.uid, transmission, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};