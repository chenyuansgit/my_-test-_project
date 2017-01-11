var db = require('../model/index').models;
var cache = require('../cache/index').cache;


var redis_key_employer_uid = "employer_uid_";
var expire = 3600 * 24 * 60;

var getOneById = function (uid, callback) {
    cache.get(redis_key_employer_uid + uid, function (err, employer) {
        if (!err && employer) {
            return callback(null, JSON.parse(employer));
        }
        db.employer.findOne({
            where: {
                user_id: uid
            }
        }).then(function (employer1) {
            if (employer1) {
                cache.set(redis_key_employer_uid + uid, JSON.stringify(employer1.dataValues), function (err) {
                    if (!err) {
                        cache.expire(redis_key_employer_uid + uid, expire);
                    }
                });
            }
            callback(null, employer1);
        }).catch(function (err) {
            callback(err);
        });
    });
};
var create = function (option, callback) {
    db.employer.create(option).then(function (employer) {
        if (employer) {
            cache.set(redis_key_employer_uid + employer.user_id, JSON.stringify(employer.dataValues), function (err) {
                if (!err) {
                    cache.expire(redis_key_employer_uid + employer.user_id, expire);
                }
            });
        }
        callback(null, employer);
    }).catch(function (e) {
        callback(e);
    });
};
var updateOneById = function (uid, option, callback) {
    db.employer.update(option, {
        where: {
            user_id: uid
        }
    }).then(function (row) {
        if (!row[0]) {
            return callback('update error,employer not exists');
        }
        cache.del(redis_key_employer_uid + uid);
        callback(null, row);
    }).catch(function (e) {
        callback(e);
    });
};
var getOneByOption = function (option, callback) {
    db.employer.findOne({
        where: option
    }).then(function (employer) {
        callback(null, employer ? employer.dataValues : null);
    }).catch(function (e) {
        callback(e);
    });
};
module.exports = {
    getOneById: getOneById,
    create: create,
    updateOneById: updateOneById,
    getOneByOption: getOneByOption
};

