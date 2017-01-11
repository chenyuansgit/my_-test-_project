var request = require('request');
var cache = require('../../cache/index').cache;
var fn = require('../../common/fn');
var querystring = require('querystring');
var md5 = require('md5');
var state = require('../state');


var redis_key_qq_access_token = 'qq_access_token_';
var redis_key_qq_token_expire = 3000;

var MOBILE_API_HOST = 'graph.z.qq.com';
var MOBILE_ACCESS_TOKEN_PATH = "/moc2/token";
var MOBILE_OPEN_ID_PATH = "/moc2/me";
var MOBILE_USER_INFO_PATH = "/user/get_user_info";

var WEB_API_HOST = 'graph.qq.com';
var WEB_ACCESS_TOKEN_PATH = "/oauth2.0/token";
var WEB_OPEN_ID_PATH = "/oauth2.0/me";
var WEB_USER_INFO_PATH = "/user/get_user_info";

var REDIRECT_URL = "https://graph.qq.com/oauth2.0/authorize";

function QqLogin(option) {
    option = option || {};
    var platform = option.platform === 'MOBILE' ? 'MOBILE' : 'WEB';
    option.api_host = platform === 'MOBILE' ? MOBILE_API_HOST : WEB_API_HOST;
    option.access_token_path = platform === 'MOBILE' ? MOBILE_ACCESS_TOKEN_PATH : WEB_ACCESS_TOKEN_PATH;
    option.open_id_path = platform === 'MOBILE' ? MOBILE_OPEN_ID_PATH : WEB_OPEN_ID_PATH;
    option.user_info_path = platform === 'MOBILE' ? MOBILE_USER_INFO_PATH : WEB_USER_INFO_PATH;
    this.option = option;
}


function insertCache(AppID, access_token, callback) {
    cache.set(redis_key_qq_access_token + AppID, access_token, function (err) {
        if (err) {
            cache.expire(redis_key_qq_access_token + AppID, redis_key_qq_token_expire);
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
        if (_body.ret > 0) {
            return callback(_body.msg);
        }
        callback(null, _body);
    });
}


function getUserInfoByOpenId(access_token, openId, AppId, callback) {
    get(WEB_API_HOST, WEB_USER_INFO_PATH, {
        oauth_consumer_key: AppId,
        access_token: access_token,
        openid: openId
    }, function (e, user) {
        callback(e, user);
    });
}

QqLogin.prototype.redirect = function (redirect_uri, platform, callback) {
    var AppID = this.option.AppID, _state = md5(fn.ranStr(15) + (+new Date));
    state.set(_state, function (e) {
        callback(e, REDIRECT_URL + "?client_id=" + AppID + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_login&state=" + _state);
    });
};

QqLogin.prototype.checkState = function (_state, callback) {
    state.get(_state, function (e, info) {
        callback(e, info);
    });
};

QqLogin.prototype.getTokenByCode = function (code, state, redirect_uri, callback) {
    var _this = this, AppId = _this.option.AppKey, AppSecret = _this.option.AppSecret, api_host = _this.option.api_host, access_token_path = _this.option.access_token_path;
    console.log('code:' + code);
    this.checkState(state, function (e, info) {
        if (e || info != 1) {
            return callback(e || 'invalid state');
        }
        get(api_host, access_token_path, {
            client_id: AppId,
            client_secret: AppSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        }, function (err, data) {
            if (err) {
                return callback(err);
            }
            console.log('access_token:' + data.access_token);
            insertCache(AppId, data.access_token);
            callback(null, data.access_token);
        });
    });
};


QqLogin.prototype.getUOpenId = function (access_token, callback) {
    var _this = this, api_host = _this.option.api_host, open_id_path = _this.option.open_id_path;
    get(api_host, open_id_path, {
        access_token: access_token
    }, function (err, data) {
        callback(err, data && data.openid ? data.openid : null);
    });
};


QqLogin.prototype.getUserInfoByCode = function (code, state, redirect_uri, callback) {
    var _this = this, AppID = _this.option.AppID;
    _this.getTokenByCode(code, state, redirect_uri, function (e1, access_token) {
        if (e1) {
            return callback(e1);
        }
        _this.access_token = access_token;
        _this.getUOpenId(access_token, function (e2, openid) {
            if (e2) {
                return callback(e2);
            }
            _this.openid = openid;
            getUserInfoByOpenId(_this.access_token, _this.openid, AppID, function (e3, user) {
                if (user) {
                    user.openid = user.openid || openid;
                }
                callback(e3, user);
            });
        });
    });
};

QqLogin.prototype.getUserInfoByOpenId = function (access_token, openid, callback) {
    var _this = this, AppID = _this.option.AppID;
    getUserInfoByOpenId(access_token, openid, AppID, function (err, user) {
        if (user) {
            user.openid = user.openid || openid;
        }
        callback(err, user);
    });
};

module.exports = QqLogin;



