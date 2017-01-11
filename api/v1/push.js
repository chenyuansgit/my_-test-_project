var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');

exports.setBadge = function(req,res){
    var uid = req.auth.uid,option = req.body.option || {},badge;
    if(!option.badge || !option.client_id){
        return res.json(resp_status_builder.build(10002,'请求参数错误'));
    }
    try{
        badge = parseInt(option.badge);
    }catch (e){
        return res.json(resp_status_builder.build(10002,'请求参数错误'));
    }
    proxy.push.setBadge(uid,option.client_id,badge,function(err){
        if(err){
            logger.error(err);
            return res.json(resp_status_builder.build(10005,'服务器错误'));
        }
        res.json(resp_status_builder.build(10000,(+new Date - req.start_time)+"ms"));
    });
};

