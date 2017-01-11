var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');
var logger = require("../../common/log").logger("index");

exports.getAdList = function (req, res) {
    var channel = req.headers['app_channel'],platform = req.headers['app_platform'],category_id = req.query.category_id;
    if(!channel){
        return res.json(resp_status_builder.build(10002,'app_channel参数错误'));
    }
    if(!platform){
        return res.json(resp_status_builder.build(10002,'app_platform参数错误'));
    }
    if(category_id!=4){
        return res.json(resp_status_builder.build(10002,'category_id参数错误'));
    }
    proxy.ad.findOnShowList(4, function (err, ads) {
        if (err) {
            logger.error(err);
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time)+'ms',{
            ads: !err && ads ? ads : []
        }));
    });
};