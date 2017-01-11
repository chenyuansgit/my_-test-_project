var db = require('./model/index').models;
var cache = require('./cache/index').cache;
var logger = require("./common/log").logger("index");
var async = require('async');
var proxy = require("./proxy/index");
var sequelize = require('./model/connect').sequelize;


/*   loading employer_job_rel */
function loadEmployerJobRel(callback) {
    logger.info("loading employer_job_rel started ......");

    var start_time = +new Date;
    var redis_key_employer_job_rel = "employer_job_rel_";
    db.job.findAll().then(function (jobs) {
        logger.info("total job size：" + jobs.length);
        for (var i = 0; i < jobs.length; i++) {
            cache.zadd(redis_key_employer_job_rel + jobs[i].user_id, jobs[i].create_time, jobs[i].jid);
        }
        logger.info("loading employer_job_rel end , use time " + (+new Date - start_time) + "ms");
        callback(null);
    }).catch(function (e) {
        callback(e);
    });
}


function loadResumeJobRels(callback) {
    logger.info("loading resume_job_rel started ......");
    var redis_key_resume_job_rel = "resume_job_rel_";
    var redis_key_user_job_rel = "user_job_rel_";
    var redis_key_job_resume_rel = "job_resume_rel_";
    var start_time = +new Date;
    db.resume_job_rel.findAll().then(function (relations) {
        logger.info("total relations size：" + relations.length);
        for (var i = 0; i < relations.length; i++) {
            cache.zadd(redis_key_user_job_rel + relations[i].resume_user_id, relations[i].create_time, relations[i].job_id);
            cache.zadd(redis_key_job_resume_rel + relations[i].job_id, relations[i].create_time, relations[i].resume_id);
            cache.zadd(redis_key_resume_job_rel + relations[i].resume_id, relations[i].create_time, relations[i].job_id);
        }
        logger.info("loading employer_job_rel end , use time " + (+new Date - start_time) + "ms");
        callback(null);
    }).catch(function (e) {
        callback(e);
    });
}

function loadAccount(callback) {
    logger.info("loading account started ......");
    var redis_key_account_uid = "account_uid_";
    var start_time = +new Date;
    db.account.findAll().then(function (accounts) {
        logger.info("total accounts size：" + accounts.length);
        for (var i = 0; i < accounts.length; i++) {
            cache.hset(redis_key_account_uid, accounts[i].account_type, accounts[i].account_name);
        }
        logger.info("loading accounts end , use time " + (+new Date - start_time) + "ms");
        callback(null);
    }).catch(function (e) {
        callback(e);
    });
}

function loadJobStats(callback) {
    logger.info("loading JobStats started ......");
    db.stats_job.findAll().then(function (stats_array) {
        if (stats_array && stats_array.length > 0) {
            async.forEach(stats_array, function (stats, cb) {
                stats = stats.dataValues;
                var option = {
                    resume_num: stats.resume_num,
                    view_num: stats.view_num,
                    resume_treat_percent: stats.resume_treat_percent,
                    resume_treat_delay: stats.resume_treat_delay,
                    resume_treat_num: stats.resume_treat_num
                };
                cache.hmset("job_stats_" + stats.jid, option);
                cb(null);
            }, function (err) {
                if (err) {
                    return callback(err);
                }
                logger.info("loading JobStats end ! " + stats_array.length + " job stats loaded to redis");
                callback(null);
            });
        } else {
            callback(null);
        }
    }).catch(function (e) {
        callback(e);
    });
}

function loadCompanyStats(callback) {
    logger.info("loading CompanyStats started ......");
    db.stats_company.findAll().then(function (stats_array) {
        if (stats_array && stats_array.length > 0) {
            async.forEach(stats_array, function (stats, cb) {
                stats = stats.dataValues;
                var option = {
                    job_online_num: stats.job_online_num,
                    resume_treat_percent: stats.resume_treat_percent,
                    resume_treat_delay: stats.resume_treat_delay,
                    last_login_time: stats.last_login_time
                };
                cache.hmset("company_stats_" + stats.cid, option);
                cb(null);
            }, function (err) {
                if (err) {
                    return callback(err);
                }
                logger.info("loading CompanyStats end !" + stats_array.length + " company stats loaded to redis");
                callback(null);
            });
        } else {
            callback(null);
        }
    }).catch(function (e) {
        callback(e);
    });
}

//var redis_key_qr_user_history = proxy.quick_recruit_user_history.redis_key_qr_user_history;
var redis_key_qr_support = proxy.quick_recruit_user_support.redis_key_qr_support;

function loadQuickRecruitStats(cb) {
    logger.info("loading quickRecruitStats started ......");
    async.parallel([
        function (callback) {
            proxy.quick_recruit_user_support.search(function (err, qc_user_keys) {

                if (err) {
                    return callback(err);
                }
                for (var i = 0, len = qc_user_keys.length; i < len; ++i) {
                    var uid = qc_user_keys[i].replace(redis_key_qr_support, '');
                    proxy.quick_recruit_user_support.getSupporterLength(uid, function (e1, length, user_id) {
                        if (!e1) {
                            logger.info(user_id);
                            proxy.quick_recruit_user_info.updateOneById({supported_num: length}, user_id);
                        }
                    });
                }
                callback(null);
            });
        },
        function (callback) {
            sequelize.query("select resume_user_id as uid,count(*) as count from resume_job_rel where recruit_type = 1 group by resume_user_id", {type: sequelize.QueryTypes.SELECT}).then(function (relations) {
                for (var i = 0, len = relations.length; i < len; ++i) {
                    proxy.quick_recruit_user_info.updateOneById({deliveries: relations[i].count}, relations[i].uid);
                }
                callback(null);
            }).catch(function (e) {
                callback(e);
            });
        },
        function (callback) {
            sequelize.query("select user_id as uid,count(*) as count from quick_recruit_invite group by user_id", {type: sequelize.QueryTypes.SELECT}).then(function (relations) {
                for (var i = 0, len = relations.length; i < len; ++i) {
                    proxy.quick_recruit_user_info.updateOneById({invited_num: relations[i].count}, relations[i].uid);
                }
                callback(null);
            }).catch(function (e) {
                callback(e);
            });
        },
        function (callback) {
            sequelize.query("select user_id as uid,count(*) as count from quick_recruit_invite where status = 2 group by user_id", {type: sequelize.QueryTypes.SELECT}).then(function (relations) {
                for (var i = 0, len = relations.length; i < len; ++i) {
                    proxy.quick_recruit_user_info.updateOneById({accepted_num: relations[i].count}, relations[i].uid);
                }
                callback(null);
            }).catch(function (e) {
                callback(e);
            });
        },
        function (callback) {
            sequelize.query("select user_id from stats_user_qr_history group by user_id", {type: sequelize.QueryTypes.SELECT}).then(function (uids) {
                logger.info(uids);
                for (var i = 0, len = uids.length; i < len; ++i) {

                    proxy.quick_recruit_user_history.updateInfo(uids[i].user_id, function (err, data, user_id) {

                        logger.info(data);
                        if (!err) {
                            proxy.quick_recruit_user_info.updateOneById({
                                today_visitor_num: data.today_visitor_num,
                                recent_visitor: data.recent_visitor && data.recent_visitor.length ? JSON.stringify(data.recent_visitor) : '',
                                views: data.views
                            }, user_id);
                        }
                    });
                }
                callback(null);
            }).catch(function (e) {
                callback(e);
            });
        }
    ], function (err, results) {
        cb(err, results);
    });
}

async.series([
    function (callback) {
        loadEmployerJobRel(function (err) {
            callback(err);
        });
    },
    function (callback) {
        loadResumeJobRels(function (err) {
            callback(err);
        });
    },
    function (callback) {
        loadAccount(function (err) {
            callback(err);
        });
    },
    function (callback) {
        loadJobStats(function (err) {
            callback(err);
        });
    },
    function (callback) {
        loadCompanyStats(function (err) {
            callback(err);
        });
    },
    function (callback) {
        loadQuickRecruitStats(function (err) {
            callback(err);
        });
    }
], function (err, results) {
    if (err) {
        logger.error(err);
    }
    logger.info("loading all end ...........");
});

