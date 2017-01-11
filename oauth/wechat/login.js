var request = require('request');
var cache = require('../../cache/index').cache;
var fn = require('../../common/fn');
var querystring = require('querystring');
var md5 = require('md5');
var state = require('../state');


var redis_key_wx_access_token = 'wx_access_token_';
var redis_key_wx_token_expire = 6000;

var API_HOST = 'api.weixin.qq.com';
var ACCESS_TOKEN_PATH = "/sns/oauth2/access_token";
var USER_INFO_PATH = "/sns/userinfo";
var MOBILE_REDIRECT_URL = "https://open.weixin.qq.com/connect/oauth2/authorize";
var WEB_REDIRECT_URL = "https://open.weixin.qq.com/connect/qrconnect";

function WxLogin(option) {
    option = option || {};
    option.api_host = API_HOST;
    option.access_token_path = ACCESS_TOKEN_PATH;
    option.user_info_path = USER_INFO_PATH;
    this.option = option;
}


function insertCache(AppID, access_token, callback) {
    cache.set(redis_key_wx_access_token + AppID, access_token, function (err) {
        if (err) {
            cache.expire(redis_key_wx_access_token + AppID, redis_key_wx_token_expire);
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
        if (_body.errcode > 0) {
            return callback(_body.errmsg);
        }
        callback(null, _body);
    });
}

function getUserInfoByOpenId(access_token, openid, callback) {
    get(API_HOST, USER_INFO_PATH, {
        access_token: access_token,
        openid: openid
    }, function (e, user) {
        callback(e, user);
    });
}

WxLogin.prototype.redirect = function (redirect_uri, platform, callback) {
    var AppID = this.option.AppID, _state = md5(fn.ranStr(15) + (+new Date)), _redirect_uri = platform !== 'web' ? MOBILE_REDIRECT_URL : WEB_REDIRECT_URL;
    state.set(_state, function (e) {
        callback(e, _redirect_uri + "?appid=" + AppID + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_login&state=" + _state + "#wechat_redirect");
    });
};

WxLogin.prototype.checkState = function (_state, callback) {
    state.get(_state, function (e, info) {
        callback(e, info);
    });
};

WxLogin.prototype.getTokenByCode = function (code, state, callback) {
    var _this = this, AppID = _this.option.AppID, AppSecret = _this.option.AppSecret;
    this.checkState(state, function (err, info) {
        if (err || info != 1) {
            return callback(err || 'invalid state');
        }
        get(API_HOST, ACCESS_TOKEN_PATH, {
            grant_type: 'authorization_code',
            appid: AppID,
            secret: AppSecret,
            code: code
        }, function (e, data) {
            if (e) {
                return callback(e);
            }
            console.log('access_token:' + data.access_token);
            insertCache(AppID, data.access_token);
            return callback(null, data.access_token, data.openid);
        });
    });
};

WxLogin.prototype.getUserInfoByCode = function (code, state, callback) {
    this.getTokenByCode(code, state, function (err, access_token, openid) {
        if (err) {
            return callback(err);
        }
        getUserInfoByOpenId(access_token, openid, function (err, user) {
            callback(err, user);
        });
    });
};

WxLogin.prototype.getUserInfoByOpenId = getUserInfoByOpenId;


module.exports = WxLogin;
