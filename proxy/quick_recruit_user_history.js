var cache = require('../cache/index').cache;
var db = require('../model/index').models;
var sequelize = require('../model/connect').sequelize;
var async = require('async');
var quick_recruit_user_info = require('./quick_recruit_user_info');

var qr_user_history = "qr_user_history_list_";
var qr_user_history_update_list = "qr_user_history_update_list";


//添加一条浏览记录
exports.add = function (uid, support_company_id, support_company_name, callback) {
    cache.rpush(qr_user_history + uid, JSON.stringify({
        uid: uid,
        cid: support_company_id,
        name: support_company_name,
        visit_time: +new Date
    }), function (err, res) {
        quick_recruit_user_info.increFieldValue(uid, 'views', 1);
        //往待更新队列添加一条数据
        cache.zadd(qr_user_history_update_list, +new Date, uid);
        callback && callback(err, res);
    });
};

//更新单个用户浏览记录各项信息
exports.updateInfo = function (uid, callback) {
    async.parallel([
        function (_callback) {
            getTodayVisitorNum(uid, function (e, num) {
                _callback(e, num);
            });
        },
        function (_callback) {
            getRecentVisitor(uid, function (e, visitors) {
                _callback(e, visitors);
            });
        },
        function (_callback) {
            getVisitorNum(uid, function (e, num) {
                _callback(e, num);
            });
        }
    ], function (err, results) {
        callback(err, {
            today_visitor_num: results[0] || 0,
            recent_visitor: results[1] || [],
            views: results[2] || 0
        }, uid);
    });
};
exports.lrange = function (uid, size, cb) {
    cache.llen(qr_user_history + uid, function (e, len) {
        if (!e && len) {
            if (len < size) {
                size = -1; // 全部取出
            }
            cache.lrange([qr_user_history + uid, 0, size], function (err, visitors) {
                if (err) {
                    return cb(err);
                }
                /*                if (visitors && visitors.length > 0) {
                 cache.lrem(qr_user_history_update_list, 0, size);
                 }*/
                cb(null, visitors || [], uid);
            });
        } else {
            cb(null, [], uid);
        }
    });
};
exports.ltrim = function (uid, size, cb) {
    cache.ltrim([qr_user_history + uid, size, -1], function (err) {
        cb && cb(err);
    });
};
exports.rpop = function (size, cb) {
    cache.zcard(qr_user_history_update_list, function (e, len) {
        if (!e && len) {
            if (len < size) {
                size = -1; // 全部取出
            }
            var args = [qr_user_history_update_list, 0, +new Date, 'LIMIT', 0, size];
            cache.zrangebyscore(args, function (err, uids) {
                if (err) {
                    return cb(err);
                }
                if (uids && uids.length > 0) {
                    cache.zrem(qr_user_history_update_list, uids);
                }
                cb(null, uids || []);
            });
        } else {
            cb(null, []);
        }

    });
};
exports.getQueueSize = function (callback) {
    cache.zcard(qr_user_history_update_list, function (e, len) {
        callback(e, len || 0);
    });
};

//单个用户的今日访客数
function getTodayVisitorNum(uid, callback) {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    sequelize.query("select count(distinct company_id) as count from stats_user_qr_history where visit_time > :timestamp and user_id = :uid;", {
        replacements: {
            timestamp: date.getTime(),
            uid: uid
        },
        type: sequelize.QueryTypes.SELECT
    }).then(function (data) {
        callback(null, data[0].count, uid);
    }).catch(function (err) {
        callback(err);
    });
}
exports.getTodayVisitorNum = getTodayVisitorNum;


//最近访问的公司(10个)
function getRecentVisitor(uid, callback) {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    sequelize.query("select company_id as cid,company_name as name,count(company_id) as count,max(visit_time) as visit_time from stats_user_qr_history where user_id = :uid group by cid order by visit_time desc limit 0,10", {
        replacements: {
            uid: uid
        },
        type: sequelize.QueryTypes.SELECT
    }).then(function (visitors) {
        callback(null, visitors, uid);
    }).catch(function (err) {
        callback(err);
    });
}


exports.getRecentVisitor = getRecentVisitor;


//总的浏览次数
function getVisitorNum(uid, callback) {
    db.stats_user_qr_history.count({
        where: {
            user_id: uid
        }
    }).then(function (count) {
        callback(null, count, uid);
    }).catch(function (err) {
        callback(err);
    });
}
//获取所有有过浏览记录的uid

exports.getVisitedOnes = function (callback) {
    sequelize.query("select user_id from stats_user_qr_history group by user_id", {
        type: sequelize.QueryTypes.SELECT
    }).then(function (uids) {
        callback(null, uids);
    }).catch(function (err) {
        callback(err);
    });
};