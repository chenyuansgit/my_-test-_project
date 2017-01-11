var async = require('async');
var sequelize = require('../model/connect').sequelize;
var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var config = require('../config_default').config;
var job_stats = require('./stats_job');
var employer = require('./employer');
var company = require('./company');
var resume_job_rel = require('./resume_job_rel');
var stats_company = require('./stats_company');
var favorite = require('./favorite');
var solr = require("../solr/index").models;

var redis_key_job_jid = "job_jid_";
var redis_key_job_expire = 3600 * 24 * 30;//过期时间一个月

var redis_key_job_user_pubtimes = "job_user_pubtimes_";
var redis_key_job_refresh = "job_refresh_";
var redis_key_employer_job_rel = "employer_job_rel_";


exports.singleJobDisplay = function (jid, uid, cb) {
    async.parallel([
        function (callback) {
            findOneById(jid, function (err, job) {
                callback(err, job || {});
            });
        },
        function (callback) {
            if (!uid) {
                return callback(null, null);
            }
            employer.getOneById(uid, function (err, employer) {
                callback(err, employer);
            });
        },
        function (callback) {
            if (!uid) {
                return callback(null, null);
            }
            resume_job_rel.checkUserRepeatDelivering(uid, jid, function (err, flag) {
                callback(err, flag);
            });
        }, function (callback) {
            if (!uid) {
                return callback(null, 0);
            }
            favorite.isFavorite(uid, 'job', jid, function (err, score) {
                callback(err, score > 1 ? 1 : 0);
            });
        }
    ], function (e, results) {
        if (e) {
            return cb(e);
        }
        if (!results[0] || !results[0].jid) {
            return cb(null, {}, {}, {}, 0, 0);
        }
        company.findOne(results[0].company_id, function (err, company) {
            if (results[0].user_id != uid) {
                job_stats.incrViewNum(results[0].jid);
            }
            if (err) {
                return cb(err);
            }
            cb(null, results[0] || {}, company || {}, results[1] || {}, results[2] ? 1 : 0, results[3] || 0);
        });
    });
};


function findOneById(jid, callback) {
    cache.get(redis_key_job_jid + jid, function (err, job) {
        if (err) {
            return callback(err);
        }
        if (job) {
            var rst = JSON.parse(job);
            return job_stats.getJobStats(jid, function (err, stats) {
                if (err) {
                    return callback(err);
                }
                if (stats) {
                    for (var i in stats) {
                        rst[i] = stats[i];
                    }
                }
                callback(null, rst);
            });
        }
        db.job.findOne({
            where: {
                jid: jid
            }
        }).then(function (job1) {
            if (job1) {
                insertCache(job1);
                return job_stats.getJobStats(jid, function (err, stats) {
                    if (!err && stats) {
                        for (var i in stats) {
                            job1[i] = stats[i];
                        }
                    }
                    callback(null, job1);
                });
            }
            callback(null, {});
        }).catch(function (e) {
            callback(e);
        });

    });
}

exports.create = function (option, callback) {
    db.job.create(option).then(function (job) {
        //更新redis数据
        insertCache(job);
        //更新solr职位信息
        solr.job.updateJob(job.jid);
        //更新对应公司的发布职位信息
        stats_company.lpush(job.company_id);
        solr.company.update(job.company_id);
        //更新发布者的今日发布职位个数
        incrLimit(option.user_id);
        callback(null, job);
    }).catch(function (e) {
        callback(e);
    });
};


exports.update = function (option, jid, user_id, company_id, callback) {
    db.job.update(option, {
        where: {
            jid: jid,
            user_id: user_id,
            company_id: company_id
        }
    }).then(function (job) {
        if (!job[0]) {
            return callback(null, job);
        }
        cache.del(redis_key_job_jid + jid);
        if (option.state && option.state == 9) {
            cache.zrem(redis_key_employer_job_rel + user_id, jid);
        }
        if (option.state) {
            solr.company.update(company_id);
            stats_company.lpush(company_id);
        }
        solr.job.updateJob(jid);
        callback(null, job);
    }).catch(function (err) {
        callback(err);
    });
};

exports.getPubTimes = function (uid, callback) {
    cache.get(redis_key_job_user_pubtimes + uid, function (e, times) {
        if (e) {
            return callback(e);
        }
        callback(null, times || 0);
    });
};

exports.refresh = function (jid, user_id, company_id, callback) {
    cache.get(redis_key_job_refresh + jid, function (err, mark) {
        if (err) {
            return callback(err);
        }
        if (mark) {
            return callback(null, 1); // 刷新标志位还在，刷新间隔在24小时以内，不能刷新
        }
        db.job.update({refresh_time: +new Date}, {
            where: {
                jid: jid,
                user_id: user_id,
                company_id: company_id
            }
        }).then(function (job) {
            if (!job[0]) {
                return callback(null, 2);
            }
            cache.set(redis_key_job_refresh + jid, 1, function (err1) {
                if (!err1) {
                    cache.expire(redis_key_job_refresh + jid, 3600 * 24 * config.company.job_refresh_time);
                }
            });
            solr.job.updateJob(jid);
            return callback(null, 3);
        }).catch(function (e) {
            callback(e);
        });
    });

};

/**
 * 后台刷新job，此方法仅供后台调用
 * @param jid
 * @param callback
 */
exports.refreshByAdmin = function (jid, callback) {
    cache.get(redis_key_job_refresh + jid, function (err, mark) {
        if (err) {
            return callback(err);
        }
        if (mark) {
            return callback(null, 1); // 刷新标志位还在，刷新间隔在24小时以内，不能刷新
        }
        db.job.update({refresh_time: +new Date}, {
            where: {
                jid: jid
            }
        }).then(function (job) {
            if (!job[0]) {
                return callback(null, 2);
            }
            cache.set(redis_key_job_refresh + jid, 1, function (err1) {
                if (!err1) {
                    cache.expire(redis_key_job_refresh + jid, 3600 * 24);
                }
            });
            solr.job.updateJob(jid);
            return callback(null, 3);
        }).catch(function (e) {
            callback(e);
        });
    });
};

/**
 * 后台删除job，此方法无权限验证，仅供后台调用
 * @param jid
 * @param callback
 */
exports.del = function (jid, callback) {
    var opt = {
        state: 9
    };
    db.job.update(opt, {
        where: {
            jid: jid
        }
    }).then(function (row) {
        cache.del(redis_key_job_jid + jid);
        //更新公司的发布职位数
        findOneById(jid, function (err, job) {
            if (!err && job) {
                solr.job.deleteJobById(jid, job.channel_type || 1);
                solr.company.update(job.company_id);
                stats_company.lpush(job.company_id);
            }
        });
        callback(null, row);
    }).catch(function (err) {
        callback(err);
    });
};
/**
 *     删除的job，此方法无权限验证，仅供后台调用
 * @param jid
 * @param callback
 */
exports.recover = function (jid, callback) {
    var opt = {
        state: 2
    };
    db.job.update(opt, {
        where: {
            jid: jid
        }
    }).then(function (row) {
        cache.del(redis_key_job_jid + jid);
        //更新公司的发布职位数
        findOneById(jid, function (err, job) {
            if (!err && job) {
                solr.company.update(job.company_id);
                stats_company.lpush(job.company_id);
            }
        });
        callback(null, row);
    }).catch(function (err) {
        callback(err);
    });
};
/**
 * 后台下线job，此方法无权限验证，仅供后台调用
 * @param jid
 * @param callback
 */
exports.offline = function (jid, callback) {
    var opt = {
        state: 2
    };
    db.job.update(opt, {
        where: {
            jid: jid
        }
    }).then(function (row) {
        cache.del(redis_key_job_jid + jid);
        //更新公司的发布职位数
        findOneById(jid, function (err, job) {
            if (!err && job) {
                solr.job.deleteJobById(jid, job.channel_type || 1);
                solr.company.update(job.company_id);
                stats_company.lpush(job.company_id);
            }
        });
        callback(null, row);
    }).catch(function (err) {
        callback(err);
    });
};
/**
 * 后台重新上线job，此方法无权限验证，仅供后台调用
 * @param jid
 * @param callback
 */
exports.online = function (jid, deadline, callback) {
    var opt = {
        state: 1,
        deadline: deadline
    };
    db.job.update(opt, {
        where: {
            jid: jid
        }
    }).then(function (row) {
        cache.del(redis_key_job_jid + jid);
        solr.job.updateJob(jid);
        //更新公司的发布职位数
        findOneById(jid, function (err, job) {
            if (!err && job) {
                solr.company.update(job.company_id);
                stats_company.lpush(job.company_id);
            }
        });
        callback(null, row);
    }).catch(function (err) {
        callback(err);
    });
};
/**
 * 加入推荐
 * @param jid
 * @param recommend_id
 * @param callback
 */
exports.recommend = function (jid, recommend_id, callback) {
    var opt = {
        recommend_id: recommend_id
    };
    db.job.update(opt, {
        where: {
            jid: jid
        }
    }).then(function (rows) {
        if (rows && rows[0] > 0) {
            cache.del(redis_key_job_jid + jid);
            callback(null, rows);
        } else {
            callback(null, rows);
        }
    }).catch(function (e) {
        callback(e);
    });
};

/**
 * 取消推荐
 * @param jid
 * @param recommend_id
 * @param callback
 */
exports.recommend_cancel = function (jid, callback) {
    var opt = {
        recommend_id: 0
    };
    db.job.update(opt, {
        where: {
            jid: jid
        }
    }).then(function (rows) {
        if (rows && rows[0] > 0) {
            cache.del(redis_key_job_jid + jid);
            callback(null, rows);
        } else {
            callback(null, rows);
        }
    }).catch(function (e) {
        callback(e);
    });
};


//获取现在时间到今晚24:00的秒数
function getLastTime(now_time) {
    var date = new Date(now_time);
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);
    return parseInt((date.getTime() - now_time + 1) / 1000);
}

function incrLimit(uid) {
    cache.incr(redis_key_job_user_pubtimes + uid, function (e) {
        if (!e) {
            cache.expire(redis_key_job_user_pubtimes + uid, getLastTime(+new Date));
        }
    });
}


function insertCache(job) {
    cache.set(redis_key_job_jid + job.jid, JSON.stringify(job.dataValues), function (e) {
        if (!e) {
            cache.expire(redis_key_job_jid + job.jid, redis_key_job_expire);
            cache.zadd(redis_key_employer_job_rel + job.user_id, job.create_time, job.jid);
        }
    });
}


//公司管理发布的职位
exports.getListByState = function (option, cb) {
    if (!option || !option.timestamp) {
        return cb(new Error('no timestamp'));
    }

    var state = option.state == 2 ? 2 : 1,
        page = option.page,
        timestamp = option.timestamp,
        sql = " from `job` where `user_id`=" + option.uid + " and job.`state` = '" + state + "' and job.`create_time` <= '" + timestamp + "'";

    var countSql = "select COUNT(*) AS `count`" + sql;

    if (page > 1) {
        sql += " order by `job`.`create_time` desc limit " + (page - 1) * 10 + ",10";
    } else {
        sql += " order by `job`.`create_time` desc limit 0,10";
    }
    async.parallel([
        function (callback) {
            sequelize.query("select * " + sql, {type: sequelize.QueryTypes.SELECT}).then(function (job) {
                callback(null, job);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            sequelize.query(countSql, {type: sequelize.QueryTypes.SELECT}).then(function (count) {
                callback(null, count[0]['count']);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (err, results) {
        if (err) {
            return cb(err);
        }
        if (results[0].length > 0) {
            countResumeByJob(results[0], function (err, jobs) {
                if (err) {
                    return cb(err);
                }
                cb(null, {
                    jobs: jobs,
                    pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
                    page: option.page > 1 ? option.page : 1,
                    count: results[1]
                });
            });
        } else {
            cb(null, {
                jobs: results[0],
                pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
                page: option.page > 1 ? option.page : 1,
                count: results[1]
            });
        }
    });
};

function countResumeByJob(jobs, cb) {
    async.map(jobs, function (item, callback) {
        job_stats.getResumeNum(item.jid, function (e, resume_num) {
            if (!e && resume_num) {
                item.resumes = resume_num;
            }
            callback(e, item);
        });
    }, function (err, results) {
        if (err) {
            return cb(err);
        }
        cb(null, results);
    });
}


//个人用户管理职位列表
//根据简历状态查询相应的job列表
exports.getListByUser = function (option, cb) {
    if (!option || !option.timestamp) {
        return cb('no timestamp');
    }
    var page = option.page,
        timestamp = option.timestamp,
        status = option.status,
        interviewed = option.interviewed,
        recruit_type = option.recruit_type,
        term_id = option.term_id,
        channel_type = option.channel_type || 0,
        sql = "";
    if (status >= 1 && status <= 4) {
        if (status == 3) {
            sql = " from resume_job_rel,job,company,employer where " + (channel_type ? 'job.channel_type=' + channel_type + ' and' : '') + " resume_job_rel.job_user_id = employer.user_id and resume_job_rel.resume_user_id = '" + option.uid + "' and resume_job_rel.job_id = job.jid and resume_job_rel.job_company_id = company.cid and job.state != 9 and resume_job_rel.status ='" + status + "' and resume_job_rel.create_time<='" + timestamp + "'";
        } else {
            sql = " from resume_job_rel,job,company where " + (channel_type ? 'job.channel_type=' + channel_type + ' and' : '') + "  resume_job_rel.resume_user_id = '" + option.uid + "' and resume_job_rel.job_id = job.jid and resume_job_rel.job_company_id = company.cid and job.state != 9 and resume_job_rel.status ='" + status + "' and resume_job_rel.create_time<='" + timestamp + "'";
        }
    } else {
        sql = " from resume_job_rel,job,company where " + (channel_type ? 'job.channel_type=' + channel_type + ' and' : '') + "  resume_job_rel.resume_user_id = '" + option.uid + "' and resume_job_rel.job_id = job.jid and resume_job_rel.job_company_id = company.cid and job.state != 9 and resume_job_rel.create_time<='" + timestamp + "'";
    }
    if (status == 3 && (interviewed == '0' || interviewed == '1')) {
        if (interviewed == '0') {
            sql += " and resume_job_rel.interview_time >= '" + (+new Date) + "'";
        } else {
            sql += " and resume_job_rel.interview_time < '" + (+new Date) + "'";
        }
    }
    if (recruit_type) {
        sql += " and resume_job_rel.recruit_type=" + recruit_type;
    }
    //else {
    //sql += " and resume_job_rel.recruit_type=1";
    //}
    var countSql = "select count(*) " + sql;
    if (term_id > 1) {
        sql += " and resume_job_rel.term_id = " + term_id;
    }
    if (page > 1) {
        sql += " order by `delivery_time` desc limit " + (page - 1) * 10 + ",10";
    } else {
        sql += " order by `delivery_time` desc limit 0,10";
    }
    async.parallel([
        function (callback) {
            sequelize.query("select resume_job_rel.resume_id," + (status == 3 ? 'employer.notice_email as hr_email,employer.phone as hr_phone,' : '') + "resume_job_rel.status,resume_job_rel.create_time as delivery_time,resume_job_rel.update_time,resume_job_rel.interview_time,resume_job_rel.job_id,resume_job_rel.term_id,resume_job_rel.recruit_type,job.*,company.cid,company.name as company_name,company.type as company_type,company.avatar as company_avatar" + sql, {type: sequelize.QueryTypes.SELECT}).then(function (job) {
                callback(null, job);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            sequelize.query(countSql, {type: sequelize.QueryTypes.SELECT}).then(function (count) {
                callback(null, count[0]['count(*)']);
            }).catch(function (err) {
                callback(err);
            });
        }], function (err, results) {
        if (err) {
            return cb(err);
        }
        cb(null, {
            jobs: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};

/**
 * hr账号查询自己发布的所有职位
 * @param uid
 * @param callback
 */
exports.findJobsByEmployer = function (uid, callback) {
    db.job.findAll({
        where: {
            user_id: uid,
            state: 1
        }
    }).then(function (jobs) {
        callback(null, jobs);
    }).catch(function (err) {
        callback(err);
    });
};

/**
 * 后台任务调用
 * @param jids
 */
exports.delJobCacheBatch = function (jids) {
    if (jids && jids.length > 0) {
        var keys = [];
        for (var i = 0; i < jids.length; i++) {
            keys.push(redis_key_job_jid + jids[i]);
        }
        cache.del(keys);
    }
};


//公共职位列表查询
exports.getHottestList = function (option, cb) {
    sequelize.query("select job.*,company.`tag` as `company_tag`,company.`avatar` as `company_avatar`,company.`cid`,company.`name` as `company_name`,company.`type` as `company_type`,company.`avatar` as `company_avatar` " +
        "from company,job where `job`.`company_id` = company.`cid` and `job`.`state` = '1' and job.recommend_id = 1   order by `job`.`refresh_time` desc limit 10", {type: sequelize.QueryTypes.SELECT}).then(function (job) {
        cb(null, job);
    }).catch(function (err) {
        cb(err);
    });
};
exports.getNewestList = function (option, cb) {
    sequelize.query("select job.*,company.`tag` as `company_tag`,company.`avatar` as `company_avatar`,company.`cid`,company.`name` as `company_name`,company.`type` as `company_type`,company.`avatar` as `company_avatar` " +
        "from job,company where `job`.`company_id` = company.`cid` and `job`.`state` = '1'  order by `job`.`refresh_time` desc limit 10", {type: sequelize.QueryTypes.SELECT}).then(function (job) {
        cb(null, job);
    }).catch(function (err) {
        cb(err);
    });
};
//mysql查询
exports.search = function (option, cb) {
    var now = +new Date;
    if (!option || !option.timestamp) {
        return cb('no timestamp');
    }
    var jt = option.jt,//职位类型
        pt = option.pt,//薪水类型0-5
        cid = option.cid,//工作地点
        workdays = option.wk,//每周工作天数,
        et = option.et,//学历要求的类型
        page = option.page,//页面
        timestamp = option.timestamp,//分页时间戳
        lt = option.lt,//排序方式
        rec = option.rec,//是否推荐
        cids = option.cids,//公司id集合
        start_time = option.start_time,//职位的最低发布时间
        sql = "";
    if (lt == 'time') {
        sql += "from company,job  where `job`.`company_id` = company.`cid` and `job`.`state` = '1'  and `job`.`refresh_time`<= :timestamp";
    } else {
        sql += "from company,job left join (select stats_job.jid as stats_job_id,stats_job.view_num from stats_job)a on a.stats_job_id = job.jid where  `job`.`company_id` = company.`cid` and `job`.`state` = '1'  and job.deadline > '" + now + "' and `job`.`refresh_time`<= :timestamp";
    }
    if (start_time) {//职位刷新时间
        sql += " and `job`.`refresh_time` > :start_time";
    }
    if (jt) {
        sql += " and `job`.`type_id` = :jt";
    }
    if (cid >= 1) {
        sql += " and `job`.`city_id` = :cid";
    }
    //某些特定情况下值查询特定公司职位
    if (cids && cids.length) {
        sql += " and `job`.`company_id` in (" + cids.join(',') + ")";
    }
    if (rec >= 1) {
        sql += " and `job`.`recommend_id` = :rec";
    }
    if (pt >= 1 && pt <= 5) {
        switch (pt) {
            case '1':
                sql += " and `job`.`min_payment`>=0 and `job`.`min_payment`<50";
                break;
            case '2':
                sql += " and `job`.`min_payment`>=50 and `job`.`min_payment`<100";
                break;
            case '3':
                sql += " and `job`.`min_payment`>=100 and `job`.`min_payment`<200";
                break;
            case '4':
                sql += " and `job`.`min_payment`>=200 and `job`.`min_payment`<500";
                break;
            case '5':
                sql += " and `job`.`min_payment`>=500";
                break;
        }
    }
    if (workdays) {
        sql += " and `job`.`workdays` >= :workdays";
    }
    if (et) {
        sql += " and `job`.`education` >= :et";
    }
    /*    if (key) {
     if (cid && jt) {
     sql += " and ( `job`.`name` like :key or `company`.`name` like :key)";
     }
     if (cid && !jt) {
     sql += " and (`job`.`type` like :key or  `job`.`name` like :key or `company`.`name` like :key)";
     }
     if (!cid && !jt) {
     sql += " and (`job`.`type` like :key or `job`.`city` like :key or `job`.`name` like :key or `company`.`name` like :key)";
     }
     if (!cid && jt) {
     sql += " and (`job`.`city` like :key or `job`.`name` like :key or `company`.`name` like :key)";
     }
     }*/
    var countSql = "select count(*) " + sql;
    if (lt == 'time') {
        sql += " order by `job`.`refresh_time` desc";
    } else {
        sql += " order by view_num desc";
    }
    if (page > 1) {
        sql += " limit " + (page - 1) * 10 + ",10";
    } else {
        sql += " limit 0,10";
    }
    async.parallel([
        function (callback) {
            sequelize.query("select job.*,company.`tag` as `company_tag`,company.`avatar` as `company_avatar`,company.`cid`,company.`name` as `company_name`,company.`type` as `company_type`,company.`avatar` as `company_avatar` " + sql,
                {
                    replacements: {
                        /* key: "%" + key + "%",*/
                        jt: jt,
                        cid: cid,
                        et: et,
                        workdays: workdays,
                        rec: rec,
                        timestamp: timestamp,
                        start_time: start_time
                    },
                    type: sequelize.QueryTypes.SELECT
                }
            ).then(function (job) {
                callback(null, job);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            sequelize.query(countSql, {
                replacements: {
                    /*key: "%" + key + "%",*/
                    jt: jt,
                    cid: cid,
                    et: et,
                    rec: rec,
                    workdays: workdays,
                    timestamp: timestamp,
                    start_time: start_time
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (count) {
                callback(null, count[0]['count(*)']);
            }).catch(function (err) {
                callback(err);
            });
        }], function (err, results) {
        if (err) {
            return cb(err);
        }
        cb(null, {
            jobs: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};

exports.findOneById = findOneById;

//查询对应jid的职位部分信息(供收藏列表接口使用)
exports.getListByIds = function (ids, callback) {
    if (!ids || !ids.length) {
        return callback(null, []);
    }
    sequelize.query("select a.jid,a.company_id,a.user_id,a.name,a.city,a.city_id,a.workdays,a.channel_type,a.min_payment,a.max_payment,a.refresh_time,b.name as company_name,b.avatar as company_avatar from job a,company b where a.company_id = b.cid and a.jid in (" + ids.join(',') + ")", {
        type: sequelize.QueryTypes.SELECT
    }).then(function (jobs) {
        callback(null, jobs);
    }).catch(function (err) {
        callback(err);
    });
};

//黑白校园mysql查询
exports.heiBaiSearch = function (option, cb) {
    var jt = option.jt,//职位类型
        city_id = option.city_id,//城市
        page = option.page,//页面
        timestamp = option.timestamp,//分页时间戳,
        sql = "";

    sql += "from company,job  where `job`.`company_id` = company.`cid` and `job`.`state` = '1'  and `job`.`refresh_time`<= :timestamp";

    if (jt != 0) {
        sql += " and `job`.`type_id` = :jt";
    }
    if (city_id > 0) {
        sql += " and `job`.`city_id` = :city_id";
    }
    sql += " order by refresh_time desc limit :offset,10";
    sequelize.query("select job.*,company.`name` as `company_name` " + sql, {
            replacements: {
                timestamp: timestamp,
                jt: jt,
                city_id: city_id,
                offset: (page - 1) * 10
            },
            type: sequelize.QueryTypes.SELECT
        }
    ).then(function (job) {
        cb(null, job);
    }).catch(function (err) {
        cb(err);
    });
};



