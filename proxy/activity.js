var db = require('../model/index').models;
var sequelize = require('../model/connect').sequelize;
var async = require('async');

exports.findOneById = function (id, callback) {
    db.activity.findOne({
        where: {
            id: id
        }
    }).then(function (article) {
        callback(null, article);
    }).catch(function (e) {
        callback(e);
    });
};
exports.findNextOneByTime = function (start_time, callback) {
    sequelize.query("select id,title,subtitle,cover from activity where status = 1 and start_time < :start_time order by start_time desc limit 1", {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            start_time: start_time
        }
    }).then(function (activities) {
        callback(null, activities[0] || {});
    }).catch(function (e) {
        callback(e);
    });
};
exports.findPrevOneByTime = function (start_time, callback) {
    sequelize.query("select id,title,subtitle,cover from activity where status = 1 and start_time > :start_time order by start_time limit 1", {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            start_time: start_time
        }
    }).then(function (activities) {
        callback(null, activities[0] || {});
    }).catch(function (e) {
        callback(e);
    });
};

exports.create = function (option, callback) {
    db.activity.create(option).then(function (article) {
        callback(null, article);
    }).catch(function (e) {
        callback(e);
    });
};

exports.update = function (option, callback) {
    db.activity.update(option, {
        where: {
            id: option.id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

exports.del = function (id, callback) {
    db.activity.update({status: 9}, {
        where: {
            id: id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

exports.list = function (option, cb) {
    var status = option.status || 1, timestamp = option.timestamp || +new Date, page = option.page > 1 ? option.page : 1;
    async.parallel([function (callback) {
        sequelize.query("select id,title,subtitle,sponsor,cover,status,start_time,end_time from activity where status = :status and create_time < :timestamp order by start_time desc limit :offset,10", {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                status: status,
                timestamp: timestamp,
                offset: (page - 1) * 10
            }
        }).then(function (articles) {
            callback(null, articles || []);
        }).catch(function (e) {
            callback(e);
        });
    }, function (callback) {
        sequelize.query("select count(*) as count from activity where status = :status and create_time < :timestamp", {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                status: status,
                timestamp: timestamp
            }
        }).then(function (count) {
            callback(null, count[0].count);
        }).catch(function (e) {
            callback(e);
        });
    }], function (err, results) {
        if (err) {
            return cb(err);
        }
        cb(null, {
            activities: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: page,
            count: results[1]
        });
    });
};
//返回三条最新活动
exports.getNewestList = function (callback) {
    sequelize.query("select id,title,subtitle,sponsor,cover,start_time,end_time from activity where status = 1 order by start_time desc limit 0,3", {
        type: sequelize.QueryTypes.SELECT
    }).then(function (articles) {
        callback(null, articles || []);
    }).catch(function (e) {
        callback(e);
    });
};
