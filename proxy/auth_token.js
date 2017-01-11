var cache = require('../cache/index').cache;

var redis_key_auth_token = "redis_key_auth_token_";
var redis_key_auth_token_expire = 30 * 24 * 3600;//过期时间1个月


exports.set = function (uid, auth_token, callback) {
    cache.hset([redis_key_auth_token + uid, auth_token, +new Date], function (err, res) {
        callback && callback(err, res);
        cache.expire(redis_key_auth_token + uid, redis_key_auth_token_expire);
    });
};

exports.get = function (uid, auth_token, callback) {
    cache.hget(redis_key_auth_token + uid, auth_token, function (err, data) {
        callback(err, data);
    });
};

exports.del = function (uid, auth_token, callback) {
    cache.hdel(redis_key_auth_token + uid, auth_token, function (err, res) {
        callback && callback(err, res);
    });
};