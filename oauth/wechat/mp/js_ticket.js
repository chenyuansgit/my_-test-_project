var myhttps = require('../../../common/myhttps');
var sha1 = require('sha1');
var cache = require('../../../cache/index').cache;
var config = require('../../../config_default').config;
var fn = require('../../../common/fn');

var AppID = config.wechat.mp[0].AppID;
var AppSecret = config.wechat.mp[0].AppSecret;

var redis_key_wx_access_token = 'wx_access_token_' + AppID;
var redis_key_wx_jsapi_ticket = 'wx_jsapi_ticket_' + AppID;

var redis_key_wx_token_expire = 6000;


var getAccessToken = function (callback) {
    cache.get(redis_key_wx_access_token, function (e, access_token) {
        if (!e && access_token) {
            return callback(null, access_token);
        }
        myhttps.get({
            option: {
                host: 'api.weixin.qq.com',
                path: '/cgi-bin/token?grant_type=client_credential&appid=' + AppID + '&secret=' + AppSecret
            }
        }, function (data) {
            data = typeof data === 'object' ? data : JSON.parse(data);
            if (data.access_token && data.expires_in) {
                cache.set(redis_key_wx_access_token, data.access_token);
                cache.expire(redis_key_wx_access_token, redis_key_wx_token_expire);
                return callback(null, data.access_token);
            }
            callback(data.errmsg || 'error');
        }, function (e2) {
            callback(e2);
        });
    });
};


var getJsApiToken = function (callback) {
    cache.get(redis_key_wx_jsapi_ticket, function (e, jsapi_ticket) {
        if (!e && jsapi_ticket) {
            return callback(null, jsapi_ticket);
        }
        getAccessToken(function (err, access_token) {
            if (err) {
                return callback(err);
            }
            myhttps.get({
                option: {
                    host: 'api.weixin.qq.com',
                    path: '/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi'
                }
            }, function (data) {
                data = typeof data === 'object' ? data : JSON.parse(data);
                if (data.ticket && data.expires_in) {
                    cache.set(redis_key_wx_jsapi_ticket, data.ticket);
                    cache.expire(redis_key_wx_jsapi_ticket, redis_key_wx_token_expire);
                    return callback(null, data.ticket);
                }
                callback(data.errmsg || 'error');
            }, function (err1) {
                callback(err1);
            });
        });
    });
};
var authJsApi = function (option, callback) {
    if (!option || !option.url) {
        return callback('params error');
    }
    getJsApiToken(function (err, jsapi_ticket) {
        if (err) {
            return callback(err);
        }
        var nonceStr = fn.ranStr(15), timestamp = +new Date;
        var str = "jsapi_ticket=" + jsapi_ticket + "&noncestr=" + nonceStr + "&timestamp=" + timestamp + "&url=" + option.url;
        var signature = sha1(str);
        callback(null, {
            timestamp: timestamp,
            nonceStr: nonceStr,
            signature: signature
        });
    });
};
module.exports = {
    getAccessToken: getAccessToken,
    getJsApiToken: getJsApiToken,
    authJsApi: authJsApi
};






