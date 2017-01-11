var cache = require('../cache/index').cache;


//点赞功能全部都在redis里面实现
//支持职位,公司,人才库简历,包打听职位的收藏
//type的值:company,resume,job,det,campus_job,campus_det
var redis_key_favorite = "favorite_uid_type_";

//收藏
exports.add = function (uid, type, favorite_id, callback) {
    cache.zadd([redis_key_favorite + uid + "_" + type, +new Date, favorite_id], function (err, res) {
        callback && callback(err, res);
    });
};

//判断是否收藏
exports.isFavorite = function (uid, type, favorite_id, callback) {
    cache.zscore(redis_key_favorite + uid + "_" + type, favorite_id, function (err, res) {
        callback(err, res);
    });
};

//收藏数
exports.getFavoritesLength = function (uid, type, min, max, callback) {
    cache.zcount(redis_key_favorite + uid + "_" + type, min, max, function (err, len) {
        callback(err, len);
    });
};

//取消收藏
exports.del = function (uid, type, favorite_id, callback) {
    cache.zrem(redis_key_favorite + uid + "_" + type, favorite_id, function (err, res) {
        callback(err, res);
    });
};
//清空某个类型的收藏
exports.empty = function (uid, type, callback) {
    cache.del(redis_key_favorite + uid + "_" + type, function (err, res) {
        callback(err, res);
    });
};
//查询我的单个类型的收藏列表
exports.list = function (uid, type, max_score, min_score, offset, size, callback) {
    cache.zrevrangebyscore([redis_key_favorite + uid + "_" + type, max_score, min_score, 'LIMIT', offset, size], function (err, ids) {
        callback(err, ids);
    });
};