var cache = require('../../cache/index').cache;
var fn = require('../../common/fn');
var querystring = require('querystring');
var md5 = require('md5');
var state = require('../state');
var request = require('request');

var redis_key_weibo_access_token = 'weibo_access_token_';
var redis_key_weibo_token_expire = 3000;

var API_HOST = 'api.weibo.com';
var ACCESS_TOKEN_PATH = "/oauth2/access_token";
var USER_ID_PATH = "/2/account/get_uid";
var USER_INFO_PATH = "/2/users/show.json";


function WeiboLogin(option) {
    this.option = option || {};
    option.api_host = API_HOST;
    option.access_token_path = ACCESS_TOKEN_PATH;
    option.user_id_path = USER_ID_PATH;
    option.user_info_path = USER_INFO_PATH;
    this.option = option;
}


function insertCache(AppKey, access_token, callback) {
    cache.set(redis_key_weibo_access_token + AppKey, access_token, function (err) {
        if (err) {
            cache.expire(redis_key_weibo_access_token + AppKey, redis_key_weibo_token_expire);
        }
        callback && callback(err);
    });
}

function get(host, path, data, callback) {
    if (typeof data === 'function') {
        callback = data;
    }
    if (data && typeof data === 'object') {
        path += "?" + querystring.stringify(data);
    }
    request('https://' + host + path, function (error, response, body) {
        if (error || response.statusCode != 200) {
            return callback(error || 'request error');
        }
        var _body = {};
        try {
            _body = typeof body === 'object' ? body : JSON.parse(body);
        } catch (e) {
            return callback(e);
        }
        if (_body.error) {
            return callback(_body.error);
        }
        callback(null, _body);
    });
}

function post(host, path, data, callback) {
    if (typeof data === 'function') {
        callback = data;
    }
    request.post({url: 'https://' + host + path, form: data}, function (error, response, body) {
        if (error || response.statusCode != 200) {
            return callback(error || 'request error');
        }
        var _body = {};
        try {
            _body = typeof body === 'object' ? body : JSON.parse(body);
        } catch (e) {
            return callback(e);
        }
        if (_body.error) {
            return callback(_body.error);
        }
        callback(null, _body);
    });
}

function getUserInfoByUid(access_token, uid, callback) {
    get(API_HOST, USER_INFO_PATH, {
        access_token: access_token,
        uid: uid
    }, function (err, user) {
        if (user) {
            user.uid = user.uid || uid;
        }
        callback(err, user);
    });
}

WeiboLogin.prototype.redirect = function (redirect_uri) {
    var AppKey = this.option.AppKey;
    return "https://api.weibo.com/oauth2/authorize?client_id=" + AppKey + "&response_type=code&redirect_uri=" + redirect_uri;
};


WeiboLogin.prototype.getTokenByCode = function (code, redirect_uri, callback) {
    var _this = this, AppKey = _this.option.AppKey, AppSecret = _this.option.AppSecret;
    post(API_HOST, ACCESS_TOKEN_PATH, {
        client_id: AppKey,
        client_secret: AppSecret,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
        code: code
    }, function (err, data) {
        if (err) {
            return callback(err);
        }
        insertCache(AppKey, data.access_token);
        callback(null, data.access_token, data.uid);
    });
};


WeiboLogin.prototype.getUserInfoByCode = function (code, redirect_uri, callback) {
    this.getTokenByCode(code, redirect_uri, function (e1, access_token, uid) {
        if (e1) {
            return callback(e1);
        }
        getUserInfoByUid(access_token, uid, function (e3, user) {
            if (user) {
                user.uid = user.uid || uid;
            }
            callback(e3, user);
        });
    });
};
WeiboLogin.prototype.getUserInfoByUid = getUserInfoByUid;


module.exports = WeiboLogin;

