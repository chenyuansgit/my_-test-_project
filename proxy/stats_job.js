var cache = require('../cache/index').cache;
var logger = require("../common/log").logger("index");

var job_stats_enum = {
    resume_num: "resume_num",
    view_num: "view_num",
    resume_treat_percent: "resume_treat_percent",
    resume_treat_delay: "resume_treat_delay", // 单位: h
    resume_treat_num: "resume_treat_num"
};

var redis_key_job_stats = "job_stats_";
var redis_key_job_stats_update_list = "job_stats_update_list";


exports.getResumeNum = function (jid, callback) {
    cache.hget(redis_key_job_stats + jid, job_stats_enum.resume_num, function (e, resume_num) {
        if (e) {
            return callback(e);
        }
        callback(null, resume_num || 0);
    });
};

exports.setJobStats = function (jid, option) {
    cache.hmset(redis_key_job_stats + jid, option, function (e) {
        if (e) {
            logger.error(e);
        }
    });
};


exports.getJobStats = function (jid, callback) {
    cache.hgetall(redis_key_job_stats + jid, function (e, stats) {
        if (e) {
            return callback(e);
        }
        callback(null, stats, jid);
    });
};

exports.incrResumeTreatNum = function (jid, delay_time) {
    // 计算简历处理平均延时
    if (delay_time <= 0) {
        logger.error("invalid delay_time when increResumeTreatNum():" + delay_time);
        delay_time = 1;
    }

    cache.hgetall(redis_key_job_stats + jid, function (e, stats) {
        if(!e) {
            var treat_num = stats.resume_treat_delay;
            var treat_delay_average = stats.resume_treat_delay;
            if (!treat_num) {
                treat_num = 0;
            }
            if (treat_delay_average) {
                treat_delay_average = Math.ceil((treat_delay_average * treat_num + delay_time) / (treat_num + 1));
            } else {
                treat_delay_average = delay_time;
            }
            cache.hset(redis_key_job_stats + jid, job_stats_enum.resume_treat_delay, treat_delay_average);
        }
    });

    cache.hincrby(redis_key_job_stats + jid, job_stats_enum.resume_treat_num, 1, function (e) {
        if (!e) {
            // 把jid加入待更新队列，通知后台任务更新mysql
            cache.zadd(redis_key_job_stats_update_list, +new Date, jid);
        }
    });
};

exports.incrResumeNum = function (jid) {
    cache.hincrby(redis_key_job_stats + jid, job_stats_enum.resume_num, 1, function (e) {
        if (!e) {
            // 把jid加入待更新队列，通知后台任务更新mysql
            cache.zadd(redis_key_job_stats_update_list, +new Date, jid);
        }
    });
};

exports.incrViewNum = function (jid) {
    cache.hincrby(redis_key_job_stats + jid, job_stats_enum.view_num, 1, function (e) {
        if (!e) {
            // 把jid加入待更新队列，通知后台任务更新mysql
            cache.zadd(redis_key_job_stats_update_list, +new Date, jid);
        }
    });
};


exports.rpop = function (size, cb) {
    cache.zcard(redis_key_job_stats_update_list, function (e, len) {
        if (!e && len) {
            if (len < size) {
                size = -1; // 全部取出
            }
            var args = [redis_key_job_stats_update_list, 0, +new Date, 'LIMIT', 0, size];
            cache.zrangebyscore(args, function (err, jids) {
                if (err) {
                    cb(err);
                }
                if (jids && jids.length > 0) {
                    cache.zrem(redis_key_job_stats_update_list, jids);
                }
                cb(null, jids || []);
            });
        } else {
            cb(null, []);
        }

    });
};

exports.getQueueSize = function (callback) {
    cache.zcard(redis_key_job_stats_update_list, function (e, len) {
        callback(e, len || 0);
    });
};