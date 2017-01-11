var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var proxy = require("../proxy/index");
var logger = require("../common/log").logger("schedule");
var sequelize = require('../model/connect').sequelize;
var async = require('async');
require('../common/fn');


function getQueue(size, callback) {
    proxy.stats_company.rpop(size, function (err, cid_array) {
        callback(err, cid_array);
    });
}

function getAllJid(cid, callback) {
    sequelize.query("SELECT `jid` FROM `job` WHERE `company_id` = " + cid, {type: sequelize.QueryTypes.SELECT}).then(function (jobs) {
        var jid_array = [];
        for (var j = 0; j < jobs.length; j++) {
            jid_array[j] = jobs[j].jid;
        }
        callback(null, jid_array);
    }).catch(function (err) {
        callback(err);
    });
}
function getJobStats(jid_array, callback) {
    var sql = "select a.*,b.resume_treat_percent,b.resume_treat_delay from (SELECT job_id,count(*) as count from resume_job_rel WHERE `job_id` IN(" + jid_array.join(",") + ") group by job_id)a left join stats_job b on a.job_id = b.jid";
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT
    }).then(function (jobs) {
        var resume_treat_percent = 0, resume_treat_delay = 0, percent_expect_len = 0, delay_expect_len = 0;
        for (var i = 0, len = jobs.length; i < len; ++i) {
            //对所有职位的简历处理率进行加权
            if (jobs[i].resume_treat_percent && jobs[i].resume_treat_delay) {
                resume_treat_delay += jobs[i].resume_treat_delay * jobs[i].count;
                delay_expect_len += jobs[i].count;
            }
            //对所有已处理过简历的职位进行加权计算
            resume_treat_percent += jobs[i].resume_treat_percent * jobs[i].count;
            percent_expect_len += jobs[i].count;
        }
        callback(null, {
            resume_treat_percent: !percent_expect_len ? 0 : Math.ceil(resume_treat_percent / percent_expect_len),
            resume_treat_delay: !delay_expect_len ? 0 : Math.ceil(resume_treat_delay / delay_expect_len)
        });
    }).catch(function (err) {
        callback(err);
    });
}
function getOnlineJobs(cid, cb) {
    async.parallel([
        function (callback) {
            db.job.count({
                where: {
                    company_id: cid,
                    state: 1
                }
            }).then(function (num) {
                callback(null, num || 0);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            db.det.count({
                where: {
                    company_id: cid,
                    state: 1
                }
            }).then(function (num) {
                callback(null, num || 0);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (e, results) {
        if (e) {
            return cb(e);
        }
        cb(null, results[0] + results[1]);
    });
}

function getCompanyStats(cid, callback) {
    async.parallel([
        function (_callback) {//获取在线职位个数
            getOnlineJobs(cid, function (e, num) {
                _callback(e, num);
            });
        },
        function (_callback) {//获取职位处理的平均统计值
            getAllJid(cid, function (e1, arr) {
                if (e1) {
                    return _callback(e1);
                }
                if (!arr || !arr.length) {
                    return _callback(null, {
                        resume_treat_percent: 0,
                        resume_treat_delay: 0
                    });
                }
                getJobStats(arr, function (e2, stats) {
                    if (e2) {
                        return _callback(e2);
                    }
                    _callback(null, {
                        resume_treat_percent: stats.resume_treat_percent,
                        resume_treat_delay: stats.resume_treat_delay
                    });
                });
            });
        }
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            job_online_num: results[0] || 0,
            resume_treat_percent: results[1].resume_treat_percent,
            resume_treat_delay: results[1].resume_treat_delay
        });
    });
}
function storeCompanyStats(cid, callback) {
    getCompanyStats(cid, function (err, stats) {
        if (err) {
            return callback(err);
        }
        var sql_update = "INSERT INTO `stats_company`(`cid`,`job_online_num`,`resume_treat_percent`,`resume_treat_delay`) VALUES("
            + cid + ","
            + stats.job_online_num + ","
            + stats.resume_treat_percent + ","
            + stats.resume_treat_delay
            + ") ON DUPLICATE KEY UPDATE "
            + "`job_online_num`=" + stats.job_online_num + ","
            + "`resume_treat_percent`=" + stats.resume_treat_percent + ","
            + "`resume_treat_delay`=" + stats.resume_treat_delay;
        sequelize.query(sql_update, {type: sequelize.QueryTypes.UPDATE}).then(function () {
            var option = {
                cid: cid,
                job_online_num: stats.job_online_num,
                resume_treat_percent: stats.resume_treat_percent,
                resume_treat_delay: stats.resume_treat_delay,
                last_login_time: 0
            };
            // 计算结果插入redis
            proxy.stats_company.insertCache(cid, option);
            callback(null);
        }).catch(function (e) {
            callback(e);
        });
    });
}
exports.doBgService = function (size, callback) {
    var start_time = +new Date;
    getQueue(size, function (e, cid_array) {
        if (e) {
            logger.error("Company stats schedule failed: {err: " + e + "}");
            return callback && callback(e);
        }
        if (!cid_array || !cid_array.length) {
            logger.info("Company stats schedule : {status: SUCCESS, size: 0" + ", cost:" + (+new Date - start_time) + "ms" + "}");
            return callback && callback(null);
        }
        async.each(cid_array, function (cid, _callback) {
            storeCompanyStats(cid, function (e1) {
                _callback(e1);
            });
        }, function (err) {
            if (err) {
                logger.error("Company stats schedule failed: {err: " + err + "}");
            } else {
                logger.info("Company stats schedule : {status: SUCCESS, size: " + cid_array.length + ", cost:" + (+new Date - start_time) + "ms" + "}");
            }
            callback && callback(err);
        });
    });
};