var cache = require('../cache/index').cache;
var quick_recruit_user_info = require('./quick_recruit_user_info');


//点赞功能全部都在redis里面实现
var redis_key_qr_support = "qr_user_support_";

//点赞
exports.add = function (uid, support_user_id, callback) {
    cache.zadd([redis_key_qr_support + uid, +new Date, support_user_id], function (err, res) {
        quick_recruit_user_info.increFieldValue(uid, 'supported_num', 1);
        callback && callback(err, res);
    });
};

//判断是否点赞
exports.isSupported = function (uid, support_user_id, callback) {
    cache.zscore(redis_key_qr_support + uid, support_user_id, function (err, res) {
        callback(err, res);
    });
};


//点赞人数
exports.getSupporterLength = function (uid, callback) {
    cache.zcard(redis_key_qr_support + uid, function (err, len) {
        callback(err, len, uid);
    });
};

//取消点赞
exports.del = function (uid, support_user_id, callback) {
    cache.zrem(redis_key_qr_support + uid, support_user_id, function (err, res) {
        quick_recruit_user_info.descreFieldValue(uid, 'supported_num', 1);
        callback && callback(err, res);
    });
};

//查询所有的点赞用户
exports.search = function (callback) {
    cache.keys(redis_key_qr_support + '*', function (err, qc_users) {
        callback(err, qc_users);
    });
};


exports.redis_key_qr_support = redis_key_qr_support;