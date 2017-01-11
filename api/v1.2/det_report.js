var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');

exports.add = function (req, res) {
    var option = req.body.option || {}, uid = req.auth.uid,det_id = req.params.det_id;
    if(!det_id || !option.title){
        return res.json(resp_status_builder.build(10002));
    }
    option.create_time = option.update_time = +new Date;
    option.user_id = uid;
    option.det_id = det_id;
    proxy.det_report.create(option, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003, '服务器错误'));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
