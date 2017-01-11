var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var sequelize = require('../model/connect').sequelize;
var async = require('async');


var redis_key_qr_content = "qr_content_";


/**
 * 快招软文推荐
 * @param option
 * @param callback
 */
exports.recommend = function (option, callback) {
    db.quick_recruit.findOne({
        where: {
            status: 1
        }
    }).then(function (quick_recruit) {
        callback(null, quick_recruit);
    }).catch(function (e) {
        callback(e);
    });

};

/**
 * 创建快招软文
 * @param option
 * @param callback
 */
exports.create = function (option, callback) {
    db.quick_recruit.create(option).then(function (content) {
        if (content) {
            cache.set(redis_key_qr_content + content.dataValues.id, JSON.stringify(content.dataValues), function (e) {
                if (!e) {
                    cache.expire(redis_key_qr_content + content.dataValues.id, 3600 * 24 * 7); // 7天过期
                }
            });
        }
        callback(null, content);
    }).catch(function (e) {
        callback(e);
    });

};

/**
 * 根据id查询快招软文
 * @param id
 * @param callback
 */
exports.findOneById = function (id, callback) {
    cache.get(redis_key_qr_content + id, function (err, content) {
        if (!err && content && content.id) {
            return callback(null, JSON.parse(content));
        }
        db.quick_recruit.findOne({
            where: {
                id: id
            }
        }).then(function (content_db) {
            if (content_db) {
                cache.set(redis_key_qr_content + content_db.dataValues.id, JSON.stringify(content_db.dataValues), function (e) {
                    if (!e) {
                        cache.expire(redis_key_qr_content + content_db.dataValues.id, 3600 * 24 * 7); // 7天过期
                    }
                });
            }
            callback(null, content_db);
        }).catch(function (err) {
            callback(err);
        });

    });
};

exports.findListByTime = function (option, cb) {
    var timestamp = option.timestamp,
        page = option.page || 1;
    async.parallel([
        function (callback) {
            sequelize.query("select quick_recruit.id,quick_recruit.title,quick_recruit.release_time,quick_recruit.title,quick_recruit.summary,quick_recruit.img,quick_recruit.status, quick_recruit.resume_id,quick_recruit.version ,resume.rid,resume.version,resume.name,resume.education_detail from quick_recruit,resume where resume.rid =quick_recruit.resume_id and resume.version = quick_recruit.version and  release_time < :timestamp and quick_recruit.status = 1 order by release_time desc limit :offset,10", {
                replacements: {
                    offset: (page - 1) * 10,
                    timestamp: timestamp
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (quick_recruits) {
                callback(null, quick_recruits || []);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            if (option.no_count) {
                return callback(null,1);
            }
            sequelize.query("select count(*) from quick_recruit,resume where resume.rid =quick_recruit.resume_id and resume.version = quick_recruit.version and  release_time < :timestamp and quick_recruit.status = 1", {
                replacements: {
                    timestamp: timestamp
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (count) {
                callback(null, count[0]['count(*)']);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (e, results) {
        if (e) {
            return cb(e);
        }
        if (option.no_count) {
            return cb(null, {
                quick_recruits: results[0],
                page: option.page > 1 ? option.page : 1
            });
        }
        cb(null, {
            quick_recruits: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};

exports.update = function (option, callback) {
    db.quick_recruit.update(option, {
        where: {
            id: option.id
        }
    }).then(function (rows) {
        cache.del(redis_key_qr_content + option.id);
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};


exports.findByUid = function (uid, callback) {
    db.quick_recruit.findOne({
        where: {
            user_id: uid
        }
    }).then(function (quick_recruit) {
        callback(null, quick_recruit);
    }).catch(function (e) {
        callback(e);
    });
};