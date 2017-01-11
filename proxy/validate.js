var cache = require('./../cache/index').cache;

var redis_key_phone_key = 'phoneValidate_';
var redis_key_phone_code_expire = 2 * 60 * 60;//图片验证码,过期时间两个小时
var redis_key_phone_vcode_expire = 10 * 60;//手机验证码,过期时间10分钟
var redis_key_vcode_relation = 'vcode_relation_';

//获取手机验证码
exports.get = function (phone, callback) {
    cache.get(redis_key_phone_key + phone, function (err, code) {
        callback(err, code);
    });
};
//设置手机验证码
exports.set = function (phone, code) {
    cache.set(redis_key_phone_key + phone, code, function (err) {
        if (!err) {
            cache.expire(redis_key_phone_key + phone, redis_key_phone_code_expire);
        }
    });
};
exports.del = function (phone, callback) {
    cache.del(redis_key_phone_key + phone, function (err, num) {
        callback && callback(err, num);
    });
};
//获取对应session的图片验证码
exports.getVcode = function (sessionId, callback) {
    cache.get(redis_key_vcode_relation + sessionId, function (err, code) {
        callback(err, code);
    });
};
//设置对应session的图片验证码
exports.setVcode = function (sessionId, code) {
    cache.set(redis_key_vcode_relation + sessionId, code, function (err) {
        if (!err) {
            cache.expire(redis_key_phone_key + sessionId, redis_key_phone_vcode_expire);
        }
    });
};
//删除对应session的图片验证码
exports.delVcode = function (sessionId, callback) {
    cache.del(redis_key_vcode_relation + sessionId, function (err, num) {
        callback && callback(err, num);
    });
};


/*
 //查看某个号码是否有发送限制
 exports.getFrequencyLimit = function (phone, callback) {
 cache.get(redis_key_frequency_limit + phone, function (err, num) {
 callback(err, !err && num >= 1 ? 1 : 0);
 });
 };
 exports.getIpLimit = function (ip, callback) {
 cache.get(redis_key_ip_limit + ip, function (err, num) {
 callback(err, !err && num >= 100 ? 1 : 0);
 });
 };

 //限制单个ip验证码发送频率,每日最多100次
 function setIpLimit(ip, callback) {
 cache.get(redis_key_ip_limit + ip, function (err, num) {
 cache.set(redis_key_ip_limit + ip, !err && num >= 1 ? (parseInt(num) + 1) : 1, function (e) {
 if (!e && !num) {
 cache.expire(redis_key_ip_limit + ip, 24 * 60 * 60);
 }
 callback && callback(e);
 });
 });
 }

 //限制单个号码发送频率,周期30s
 function setFrequencyLimit(phone, callback) {
 cache.set(redis_key_frequency_limit + phone, 1, function (err) {
 if (!err) {
 cache.expire(redis_key_frequency_limit + phone, 30);
 }
 callback && callback(err);
 });
 }*/
