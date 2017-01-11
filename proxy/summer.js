var cache = require('../cache/index').cache;

var redis_key_summer = "summer_";

//加入暑期实习
exports.join = function (id, type, callback) {
    cache.zadd([redis_key_summer + type, +new Date, id], function (err, res) {
        callback && callback(err, res);
    });
};

//判断是否已经加入
exports.isJoiner = function (id, type, callback) {
    cache.zscore(redis_key_summer + type, id, function (err, res) {
        callback(err, res);
    });
};


//已加入人数
exports.getJoinerLength = function (type, callback) {
    cache.zcard(redis_key_summer + type, function (err, len) {
        callback(err, len);
    });
};

//获取参加者id

exports.list = function (type, offset, size, callback) {
    cache.zrange(redis_key_summer + type, offset, size, function (err, ids) {
        callback && callback(err, ids);
    });
};

//退出
exports.quit = function (id, type, callback) {
    cache.zrem(redis_key_summer + type, id, function (err, res) {
        callback && callback(err, res);
    });
};