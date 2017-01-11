var proxy = require('../proxy/index');

var client_auth_token_expires = 30;//客户端登录凭证过期时间(天数)


exports.loginStatusValidate = function(uid, auth_token, callback) {
    if (!uid || uid === 'null' || uid === 'undefined') {
        return callback(10023, 'uid参数错误');
    }
    if (!auth_token || auth_token === 'null' || auth_token === 'undefined') {
        return callback(10024, 'auth_token参数错误');
    }
    proxy.auth_token.get(uid, auth_token, function (err, timestamp) {
        if (err) {
            return callback(10005, "服务器错误");
        }
        if (!timestamp) {
            return callback(10025, '登录状态已过期');
        }
        if ((+new Date - timestamp) > client_auth_token_expires * 24 * 60 * 60 * 1000) {
            proxy.auth_token.del(uid, auth_token);
            return callback(10025, '登录状态已过期');
        }
        callback(null);
    });
};