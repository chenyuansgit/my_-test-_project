var db = require('../model/index').models;
var cache = require('../cache/index').cache;

var redis_key_user_uid = "user_uid_";
var redis_key_user_expire = 3600 * 24 * 30;//过期时间一个月


var getOneById = function (uid, callback) {
    cache.get(redis_key_user_uid + uid, function (err, user) {
        if (!err && user && user !== 'undefined') {
            return callback(null, JSON.parse(user));
        }
        db.user.findOne({
            where: {
                user_id: uid
            }
        }).then(function (user1) {
            if (user1 && user1.dataValues) {
                cache.set(redis_key_user_uid + uid, JSON.stringify(user1.dataValues), function (e) {
                    if (!e) {
                        cache.expire(redis_key_user_uid + uid, redis_key_user_expire);
                    }
                });
            }
            callback(null, user1);
        }).catch(function (err) {
            callback(err);
        });
    });
};
var create = function (option, callback) {
    db.user.create(option).then(function (user) {
        if (user && user.dataValues) {
            cache.set(redis_key_user_uid + user.user_id, JSON.stringify(user.dataValues), function (e) {
                if (!e) {
                    cache.expire(redis_key_user_uid + user.user_id, redis_key_user_expire);
                }
            });
        }
        callback(null, user);
    }).catch(function (e) {
        callback(e);
    });
};
var updateOneById = function (uid, user, option, callback) {
    db.user.update(option, {
        where: {
            user_id: uid
        }
    }).then(function (row) {
        if (!row[0]) {
            return callback('update error');
        }
        for (var i in option) {
            user[i] = option[i];
        }
        cache.set(redis_key_user_uid + uid, JSON.stringify(user.dataValues || user), function (e) {
            if (!e) {
                cache.expire(redis_key_user_uid + uid, redis_key_user_expire);
                return callback(null, user);
            }
            cache.del(redis_key_user_uid + uid, function (e1) {
                if (e1) {
                    return cache.del(redis_key_user_uid + uid, function () {
                        callback(null, user);
                    });
                }
                callback(null, user);
            });
        });
    }).catch(function (e) {
        callback(e);
    });
};

function delCache(uid) {
    cache.del(redis_key_user_uid + uid);
}

module.exports = {
    getOneById: getOneById,
    create: create,
    updateOneById: updateOneById,
    delCache: delCache
};

