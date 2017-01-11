var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var redis_key_job_subscription = "job_subscription_uid_";
var redis_key_job_subscription_expire = 3600 * 24 * 30;

var getOneById = function (uid, callback) {
    cache.get(redis_key_job_subscription + uid, function (err, job_subscription) {
        if (!err && job_subscription) {
            return callback(null, JSON.parse(job_subscription));
        }
        db.job_subscription.findOne({
            where: {
                user_id: uid
            }
        }).then(function (job_subscription1) {
            if (job_subscription1 && job_subscription1.dataValues) {
                cache.set(redis_key_job_subscription + uid, JSON.stringify(job_subscription1.dataValues), function (e) {
                    if (!e) {
                        cache.expire(redis_key_job_subscription + uid, redis_key_job_subscription_expire);
                    }
                });
            }
            callback(null, job_subscription1 && job_subscription1.dataValues ? job_subscription1.dataValues : null);
        }).catch(function (err) {
            callback(err);
        });
    });
};
var create = function (option, callback) {
    db.job_subscription.create(option).then(function (job_subscription) {
        if (job_subscription && job_subscription.dataValues) {
            cache.set(redis_key_job_subscription + job_subscription.user_id, JSON.stringify(job_subscription.dataValues), function (e) {
                if (!e) {
                    cache.expire(redis_key_job_subscription + job_subscription.user_id, redis_key_job_subscription_expire);
                }
            });
        }
        callback(null, null);
    }).catch(function (e) {
        callback(e);
    });
};
var updateOneById = function (uid, job_subscription, option, callback) {
    db.job_subscription.update(option, {
        where: {
            user_id: uid
        }
    }).then(function (row) {
        if (!row[0]) {
            return callback('update error');
        }
        for (var i in option) {
            job_subscription[i] = option[i];
        }
        cache.set(redis_key_job_subscription + uid, JSON.stringify(job_subscription), function (e) {
            if (!e) {
                cache.expire(redis_key_job_subscription + uid, redis_key_job_subscription_expire);
                return callback(null, job_subscription);
            }
            cache.del(redis_key_job_subscription + uid, function (e1) {
                if (e1) {
                    return cache.del(redis_key_job_subscription + uid, function () {
                        callback(null, job_subscription);
                    });
                }
                callback(null, job_subscription);
            });
        });
    }).catch(function (e) {
        callback(e);
    });
};


function delCache(uid) {
    cache.del(redis_key_job_subscription + uid);
}

module.exports = {
    getOneById: getOneById,
    create: create,
    updateOneById: updateOneById,
    delCache: delCache
};
