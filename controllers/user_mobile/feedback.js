var logger = require("../../common/log").logger("index");
var db = require('../../model/index').models;
var resp_status_builder = require('../../common/response_status_builder.js');

exports.post = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid;
    if (!option.content || option.content.indexOf('<') > -1) {
        return res.json(resp_status_builder.build(10002));
    }
    option.uid = uid || '';
    option.create_time = option.update_time = +new Date;
    option.device_info = req.headers['user-agent'];
    db.feedback.create(option).then(function () {
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    }).catch(function (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10005));
    });
};