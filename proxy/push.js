var push = require('./client_push/index');
var cache = require('../cache/index').cache;

var redis_key_interview_notification_list = "interview_notification_list";


//增加一条面试通知队列消息
function addInterviewNotification(id, timestamp, callback) {
    cache.zadd(redis_key_interview_notification_list, timestamp, id, function (err) {
        callback && callback(err);
    });
}
//删除一条面试通知队列消息
function deleteInterviewNotification(id, callback) {
    cache.zrem(redis_key_interview_notification_list, id, function (err) {
        callback && callback(err);
    });
}
//获取时间段内所有的面试通知队列名
function getInterviewNotificationList(min, max, callback) {
    cache.zrangebyscore(redis_key_interview_notification_list, min, max, function (err, ids) {
        callback && callback(err, ids);
    });
}
//获取时间段内所有的面试通知队列名单
function deleteInterviewNotificationList(min, max, callback) {
    cache.zremrangebyscore(redis_key_interview_notification_list, min, max, function (err, ids) {
        callback && callback(err, ids);
    });
}

exports.toSingleByUid = function (uid, transmission, callback) {
    var template = push.transmissionTemplate(transmission.APNS, transmission.transmissionContent);
    push.toSingleByUid(template, uid, function (err, res) {
        callback && callback(err, res);
    });
};
exports.toApp = function (transmission, callback) {
    var template = push.transmissionTemplate(transmission.APNS, transmission.transmissionContent);
    push.toApp(template, function (err, res) {
        callback && callback(err, res);
    });
};
exports.interviewNotification = {
    add: addInterviewNotification,
    del: deleteInterviewNotification,
    getList: getInterviewNotificationList,
    deleteList: deleteInterviewNotificationList
};
