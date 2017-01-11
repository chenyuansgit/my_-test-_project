var proxy = require("../../../proxy/index");
var logger = require("../../../common/log").logger("schedule");
var push_template = require('../../../common/push_template');


//获取2小时后之前的所有的面试通知队列名单
function getRecentList(callback) {
    var time = +new Date + 2 * 60 * 60 * 1000;
    proxy.push.interviewNotification.getList(0, time, function (err, ids) {
        callback(err, ids, time);
    });
}

exports.doBgService = function (callback) {
    getRecentList(function (err, ids, time) {
        if (err) {
            logger.error(err);
            return callback && callback(err);
        }
        if (ids && ids.length) {
            var idArray = ids;
            proxy.push.interviewNotification.deleteList(0,time);
            for(var i = 0,len = idArray.length;i<len;++i){
                var uid = idArray[i].split('_')[0];
                //发送客户端推送通知
                proxy.push.toSingleByUid(uid,push_template.toBeInterview());
            }
        }
        callback && callback(null);
    });
};



