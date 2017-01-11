var db = require('../model/index').models;
var cache = require('../cache/index').cache;


var redis_key_qr_user_info = "qr_user_info_";
var redis_key_qr_user_update_list = "qr_user_update_list";

var opt = {
    "invited_num": "invited_num",
    "accepted_num": "accepted_num",
    "supported_num": "supported_num",
    "deliveries": "deliveries",
    "views": "views",
    "recent_visitor": "recent_visitor",
    "today_visitor_num": "today_visitor_num"
};


function rpush(uid, callback) {
    cache.zadd(redis_key_qr_user_update_list, +new Date, uid, function (err) {
        callback && callback(err);
    });
}

exports.getOneById = function (uid, callback) {
    cache.hgetall(redis_key_qr_user_info + uid, function (e1, info) {
        if (e1 || !info) {
            return db.stats_user_qr_info.findOne({
                where: {
                    user_id: uid
                }
            }).then(function (information) {
                if (information && information.dataValues) {
                    var _set = [];
                    for (var i in information.dataValues) {
                        _set.push(i);
                        _set.push(information.dataValues[i]);
                    }
                    cache.hmset(redis_key_qr_user_info + uid, _set);
                    return callback(null, information.dataValues);
                }
                callback(null, {});
            }).catch(function (e2) {
                callback(e2);
            });
        }
        callback(null, info);
    });
};
exports.updateOneById = function (option, uid, callback) {
    db.stats_user_qr_info.findOne({
        where: {
            user_id: uid
        }
    }).then(function (u) {
        if (u) {
            option.update_time = +new Date;
            db.stats_user_qr_info.update(option, {
                where: {
                    user_id: uid
                }
            }).then(function (rows) {
                if (!rows[0]) {
                    return callback && callback('no this one');
                }
                var arr = [];
                for (var i in option) {
                    arr.push(i);
                    arr.push(option[i]);
                }
                cache.hmset(redis_key_qr_user_info + uid, arr);
                callback && callback(null, 1);
            }).catch(function (e) {
                callback && callback(e);
            });
        } else {
            option.user_id = uid;
            option.update_time = option.create_time = +new Date;
            db.stats_user_qr_info.create(option).then(function () {
                var arr = [];
                for (var i in option) {
                    arr.push(i);
                    arr.push(option[i]);
                }
                cache.hmset(redis_key_qr_user_info + uid, arr);
                callback && callback(null, 1);
            }).catch(function (e) {
                callback && callback(e);
            });
        }
    }).catch(function (error) {
        callback && callback(error);
    });
};


exports.getQueueSize = function (callback) {
    cache.zcard(redis_key_qr_user_update_list, function (e, len) {
        callback(e, len || 0);
    });
};
exports.rpop = function (size, cb) {
    cache.zcard(redis_key_qr_user_update_list, function (e, len) {
        if (!e && len) {
            if (len < size) {
                size = -1; // 全部取出
            }
            var args = [redis_key_qr_user_update_list, 0, +new Date, 'LIMIT', 0, size];
            cache.zrangebyscore(args, function (err, uids) {
                if (err) {
                    return cb(err);
                }
                if (uids && uids.length > 0) {
                    cache.zrem(redis_key_qr_user_update_list, uids);
                }
                cb(null, uids || []);
            });
        } else {
            cb(null, []);
        }

    });
};

exports.increFieldValue = function (uid, field, num, callback) {
    cache.hincrby(redis_key_qr_user_info + uid, field, num, function (err) {
        rpush(uid);
        callback && callback(err);
    });
};
exports.descreFieldValue = function (uid, field, num, callback) {
    cache.hget(redis_key_qr_user_info + uid, field, function (err, val) {
        if (val > 1) {
            return cache.hset(redis_key_qr_user_info + uid, field, val - 1, function (e) {
                callback(e);
            });
        }
        callback(err);
    });
};