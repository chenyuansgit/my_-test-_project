var cache = require('./../cache/index').cache;

var email_code = 'emailValidate_';

exports.get = function (email, callback) {
    cache.get(email_code + email, function (err, code) {
        callback(err, code);
    });
};
exports.set = function (email, code) {
    cache.set(email_code + email, code, function (err) {
        if (!err) {
            cache.expire(email_code + email, 2 * 60 * 60);
        }
    });
};
exports.del = function (email, callback) {
    cache.del(email_code + email, function (err, num) {
        callback && callback(err, num);
    });
};