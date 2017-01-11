var cache = require('../cache/index').cache;
var logger = require("../common/log").logger("index");

var det_stats_enum = {
    resume_num: "resume_num",
    view_num: "view_num",
    resume_check_num: "resume_check_num"
};

var redis_key_det_stats = "det_stats_";
var redis_key_det_stats_update_list = "det_stats_update_list";
var redis_key_det_checker_list = "det_checker_list_";


exports.getResumeNum = function (id, callback) {
    cache.hget(redis_key_det_stats + id, det_stats_enum.resume_num, function (e, resume_num) {
        if (e) {
            return callback(e);
        }
        callback(null, resume_num || 0);
    });
};

exports.setDetStats = function (id, option) {
    cache.hmset(redis_key_det_stats + id, option, function (e) {
        if (e) {
            logger.error(e);
        }
    });
};


exports.getDetStats = function (id, callback) {
    cache.hgetall(redis_key_det_stats + id, function (e, stats) {
        if (e) {
            return callback(e);
        }
        callback(null, stats, id);
    });
};

exports.incrResumeCheckNum = function (id, email, callback) {
    hasCheckResume(id, email, function (err, yes) {
        if (!err && !yes) {
            addResumeCheck(id, email, callback);
            cache.hincrby(redis_key_det_stats + id, det_stats_enum.resume_check_num, 1, function (e) {
                if (!e) {
                    // 把id加入待更新队列，通知后台任务更新mysql
                    cache.zadd(redis_key_det_stats_update_list, +new Date, id);
                }
                callback && callback(e);
            });
        }
        callback && callback(err);
    });
};
function hasCheckResume(id, email, callback) {
    cache.zscore(redis_key_det_checker_list + id, email, function (err, score) {
        callback(err, score > 1 ? 1 : 0);
    });
}

function addResumeCheck(id, email, callback) {
    cache.zadd(redis_key_det_checker_list + id, +new Date, email, function (e) {
        callback && callback(e);
    });
}
exports.addResumeCheck = addResumeCheck;

exports.incrResumeNum = function (id, callback) {
    cache.hincrby(redis_key_det_stats + id, det_stats_enum.resume_num, 1, function (e) {
        if (!e) {
            // 把id加入待更新队列，通知后台任务更新mysql
            cache.zadd(redis_key_det_stats_update_list, +new Date, id);
        }
        callback && callback(e);
    });
};

exports.incrViewNum = function (id) {
    cache.hincrby(redis_key_det_stats + id, det_stats_enum.view_num, 1, function (e) {
        if (!e) {
            // 把id加入待更新队列，通知后台任务更新mysql
            cache.zadd(redis_key_det_stats_update_list, +new Date, id);
        }
    });
};


exports.rpop = function (size, cb) {
    cache.zcard(redis_key_det_stats_update_list, function (e, len) {
        if (!e && len) {
            if (len < size) {
                size = -1; // 全部取出
            }
            var args = [redis_key_det_stats_update_list, 0, +new Date, 'LIMIT', 0, size];
            cache.zrangebyscore(args, function (err, ids) {
                if (err) {
                    cb(err);
                }
                if (ids && ids.length > 0) {
                    cache.zrem(redis_key_det_stats_update_list, ids);
                }
                cb(null, ids || []);
            });
        } else {
            cb(null, []);
        }

    });
};

exports.getQueueSize = function (callback) {
    cache.zcard(redis_key_det_stats_update_list, function (e, len) {
        callback(e, len || 0);
    });
};