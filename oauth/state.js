var cache = require('../cache/index').cache;

var STATE_NAME = 'oauth_redirect_state_';
var STATE_EXPIRE = 10 * 60;//10分钟

exports.get = function (state, callback) {
    cache.get(STATE_NAME + state, function (e, info) {
        callback(e, info);
    });
};

exports.set = function (state, callback) {
    cache.set(STATE_NAME + state, 1, function (e) {
        if (!e) {
            cache.expire(STATE_NAME + state, STATE_EXPIRE);
        }
        callback && callback(e);
    });
};

exports.del = function (state, callback) {
    cache.del(STATE_NAME + state, function (e) {
        callback && callback(e);
    });
};