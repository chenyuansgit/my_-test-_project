var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var logger = require("../common/log").logger("index");
var async = require('async');

var redis_key_company_stats_update_list = "redis_key_company_stats_update_list" ;
var redis_key_company_stats = "company_stats_";

var company_stats_enum = {
    job_online_num : "job_online_num",
    resume_treat_percent : "resume_treat_percent",
    resume_treat_delay : "resume_treat_delay", // 单位: h
    last_login_time : "last_login_time"
};

exports.getStats = function(cid, callback){
    cache.hgetall(redis_key_company_stats + cid, function (e, stats) {
        if(e) {
            return callback(e);
        }
        if(stats) {
            if(!stats.job_online_num) {
                stats.job_online_num = 0;
            }
            if(!stats.resume_treat_percent) {
                stats.resume_treat_percent = 100;
            }
            if(!stats.resume_treat_delay) {
                stats.resume_treat_delay = 0;
            }
            if(!stats.last_login_time) {
                stats.last_login_time = +new Date;
            }
        }
        callback(null, stats);
    });
};




exports.insertCache = function(cid, option){
    cache.hmset(redis_key_company_stats + cid, option, function (e) {
        if(e) {
            logger.error(e);
        }
    });
};

exports.lpush = function(cid) {
    cache.zadd(redis_key_company_stats_update_list, +new Date, cid);
};

exports.rpop = function (size, cb) {
    cache.zcard(redis_key_company_stats_update_list, function (e , len) {
        if(!e && len) {
            if(len < size) {
                size = -1 ;
            }
            var args = [redis_key_company_stats_update_list, 0, +new Date, 'LIMIT', 0, size];
            cache.zrangebyscore(args, function (err, cids) {
                if(err) {
                    return cb(err);
                }
                if(cids && cids.length > 0) {
                    cache.zrem(redis_key_company_stats_update_list, cids);
                }
                cb(null, cids || []);
            });
        } else {
            cb(null, []);
        }

    });
};

exports.getQueueSize = function (callback) {
    cache.zcard(redis_key_company_stats_update_list, function (e, len) {
        if(e) {
            return callback(e);
        }
        callback(null, len || 0);
    });
};