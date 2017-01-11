var cache = require('../cache/index').cache;

var TOKEN_NAME = '_account_bind_token_';
var TOKEN_EXPIRE = 2 * 60 * 60;//两个小时

exports.get = function (platform, token, callback) {
    cache.get(platform + TOKEN_NAME + token, function (e, userInfo) {
        callback(e, userInfo ? JSON.parse(userInfo) : null);
    });
};

exports.set = function (platform, token, userInfo, callback) {
    cache.set(platform + TOKEN_NAME + token, JSON.stringify(userInfo), function (e) {
        if (!e) {
            cache.expire(platform + TOKEN_NAME + token, TOKEN_EXPIRE);
        }
        callback && callback(e);
    });
};

exports.del = function (platform, token, callback) {
    cache.del(platform + TOKEN_NAME + token, function (e) {
        callback && callback(e);
    });
};