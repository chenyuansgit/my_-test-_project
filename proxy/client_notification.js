var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var async = require('async');
var sequelize = require('../model/connect').sequelize;
var push = require('./push');
var push_template = require('../common/push_template');

var client_notification_uri = 'internbird://m.internbird.com/msg/notification/list';
var redis_key_client_notification_push = "client_notification_push";


exports.list = function (option, cb) {
    var timestamp = option.timestamp, page = option.page;
    async.parallel([
        function (callback) {
            sequelize.query("select * from client_notification where create_time < :timestamp order by create_time desc limit :offset,:size", {
                replacements: {
                    offset: (page - 1) * 10,
                    size: 10,
                    timestamp: timestamp
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (client_notifications) {
                callback(null, client_notifications);
            }).catch(function (e) {
                callback(e);
            });
        }, function (callback) {
            if (option.no_count) {
                return callback(null);
            }
            sequelize.query("select count(*) as count from  client_notification where create_time < :timestamp", {
                replacements: {
                    timestamp: timestamp
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (count) {
                callback(null, count[0].count);
            }).catch(function (e) {
                callback(e);
            });
        }
    ], function (err, results) {
        if (err) {
            return cb(err);
        }
        if (option.no_count) {
            return cb(null, {
                notifications: results[0],
                page: option.page > 1 ? option.page : 1
            });
        }
        cb(null, {
            notifications: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};


exports.create = function (option, callback) {
    db.client_notification.create(option).then(function (client_notification) {
        callback(null, client_notification);
    }).catch(function (e) {
        callback(e);
    });
};
function findOneById(id, callback) {
    db.client_notification.findOne({
        where: {
            id: id
        }
    }).then(function (client_notification) {
        callback(null, client_notification);
    }).catch(function (e) {
        callback(e);
    });
}
exports.findOneById = findOneById;
exports.updateOneById = function (id, option, callback) {
    db.client_notification.update(option, {
        where: {
            id: id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

//将该通知推送给客户端
function checkNotePush(key, id, callback) {
    cache.hget(key, id, function (err, mark) {
        if (err) {
            return callback(err);
        }
        if (mark) {
            return callback(null, 1); // 消息已经推送,无法再次推送
        }
        findOneById(id, function (err, client_notification) {
            callback(err, 0 , client_notification);
        });
    });
}
exports.push = function (id, option, callback) {
    checkNotePush(redis_key_client_notification_push, id, function (err, isPush ,client_notification) {
        if (err) {
            return callback(err);
        }
        if (isPush) {
            return callback(null, 1); // 消息已经推送,无法再次推送
        }
        var transmission = push_template.notification(true, client_notification.title, 1004, client_notification_uri);
        push.toApp(transmission, function (e, info) {
            if (e) {
                return callback(e);
            }
            cache.hset([redis_key_client_notification_push, id, option.user_name], function (err1) {
                if (!err1) {
                    callback(e, isPush);
                }
            });
        });
    });
};