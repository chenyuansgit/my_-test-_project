var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');


exports.createOrUpdate = function(req,res){
    var auth = req.auth;
    var option = req.body.option;
    if(!option){
        return res.json(resp_status_builder.build(10002,'请求参数错误'));
    }
    proxy.job_subscription.getOneById(auth.uid,function(err,job_subscription){
        if(err){
            logger.error(err);
            return res.json(resp_status_builder.build(10003,'服务器错误'));
        }
        option.user_id = auth.uid;
        if(!job_subscription){
            option.create_time= option.update_time = +new Date;
            return proxy.job_subscription.create(option,function(e1){
                if(e1){
                    logger.error(e1);
                    return res.json(resp_status_builder.build(10003,'服务器错误'));
                }
                res.json(resp_status_builder.build(10000,(+new Date - req.start_time)+"ms"));
            });
        }
        option.update_time = +new Date;
        proxy.job_subscription.updateOneById(auth.uid,job_subscription,option,function(e2){
            if(e2){
                logger.error(e2);
                return res.json(resp_status_builder.build(10003,'服务器错误'));
            }
            res.json(resp_status_builder.build(10000,(+new Date - req.start_time)+"ms"));
        });
    });
};
exports.getInfo = function(req,res){
    var uid = req.auth.uid;
    proxy.job_subscription.getOneById(uid,function(err,job_subscription){
        if(err){
            logger.error(err);
            return res.json(resp_status_builder.build(10005,"服务器错误"));
        }
        res.json(resp_status_builder.build(10000,(+new Date - req.start_time)+"ms",{
            sub:job_subscription || {},
            isSub:job_subscription && !err?true:false
        }));
    });
};







