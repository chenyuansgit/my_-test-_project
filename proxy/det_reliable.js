var async = require('async');
var cache = require('../cache/index').cache;

//靠谱功能全部在redis中实现

var redis_key_det_support_user_list = "det_support_user_list";


//点击靠谱
exports.add = function (det_id, user_id, callback) {
    cache.zadd([redis_key_det_support_user_list + det_id, +new Date, user_id], function (err, res) {
        callback && callback(err, res);
    });
};

//判断是否点过靠谱
exports.isSupported = function (det_id, user_id, callback) {
    cache.zscore(redis_key_det_support_user_list + det_id, user_id, function (err, res) {
        callback(err, res);
    });
};


//点击靠谱的人数
exports.getSupporterLength = function (det_id, callback) {
    cache.zcard(redis_key_det_support_user_list + det_id, function (err, len) {
        callback(err, len);
    });
};

//取消靠谱
exports.del = function (det_id, user_id, callback) {
    cache.zrem(redis_key_det_support_user_list + det_id, user_id, function (err, res) {
        callback && callback(err, res);
    });
};
