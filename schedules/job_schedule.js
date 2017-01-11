var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var proxy = require("../proxy/index");
var logger = require("../common/log").logger("schedule");
var sequelize = require('../model/connect').sequelize;
var solr = require("../solr/index").models;
var async = require('async');

require('../common/fn');

exports.doBgService = function (item) {
    var start_time = +new Date;
    proxy.stats_job.rpop(item, function (err, jid_array) {
        if (err) {
            logger.error(err);
            logger.info("Job stats schedule : {status: FAILED}");
        }
        if (jid_array && jid_array.length > 0) {
            jid_array = jid_array.unique();

            for (var i = 0; i < jid_array.length; i++) {

                proxy.stats_job.getJobStats(jid_array[i], function (err, stats, jid) {
                    if (err) {
                        logger.error(err);
                    } else {
                        if (stats) {
                            // 1. 校验
                            async.parallel([
                                //function (callback) {
                                //    db.resume_job_rel.count({
                                //            where :{
                                //                job_id:jid,
                                //                status:{$ne : 9 }
                                //            }
                                //    }).then(function (total_num) {
                                //        callback(null, total_num);
                                //    }).catch(function (e) {
                                //        callback(e);
                                //    });
                                //},
                                //function (callback) {
                                //    db.resume_job_rel.count({
                                //        where :{
                                //            job_id:jid ,
                                //            status:{$gt:1 ,$lt:9 }
                                //        }
                                //    }).then(function (treat_num) {
                                //        callback(null, treat_num);
                                //    }).catch(function (e) {
                                //        callback(e);
                                //    });
                                //},
                                function (callback) {
                                    db.resume_job_rel.findAll({
                                        where: {
                                            job_id: jid
                                        }
                                    }).then(function (relations) {
                                        callback(null, relations);
                                    }).catch(function (e) {
                                        callback(e);
                                    });
                                },
                                function (callback) {
                                    db.stats_job.findOne({
                                        where: {
                                            jid: jid
                                        }
                                    }).then(function (stats_db) {
                                        callback(null, stats_db);
                                    }).catch(function (e) {
                                        callback(e);
                                    });
                                }
                            ], function (err, results) {
                                if (err) {
                                    logger.error(err);
                                }

                                var all_relations = results[0];
                                var stats_db = results[1];
                                var view_num = stats.view_num || 0;
                                var resume_treat_percent = 0;
                                var resume_num = all_relations.length || 0;
                                var resume_treat_num = 0;
                                var resume_treat_delay = stats.resume_treat_delay || 0;

                                if (all_relations.length > 0) {
                                    var index = 0;
                                    var c_time = 0;
                                    var d_time = 0;
                                    for (var j = 0; j < all_relations.length; j++) {
                                        if (all_relations[j].status > 1) {
                                            resume_treat_num++;
                                        }
                                        if (all_relations[j].status > 1 && all_relations[j].contact_info) {
                                            var contact_info = JSON.parse(all_relations[j].contact_info);
                                            if (contact_info.update_time) {
                                                index++;
                                                c_time = c_time + all_relations[j].create_time;
                                                d_time = d_time + contact_info.update_time;
                                            }
                                        }
                                    }
                                    if (index > 0) {
                                        resume_treat_delay = Math.ceil((d_time - c_time) / (1000 * 60 * 60 * index));
                                    } else {
                                        if (!resume_treat_delay || resume_treat_delay == 0) {
                                            if (resume_treat_num > 0) {
                                                resume_treat_delay = 24;
                                            } else {
                                                resume_treat_delay = 0;
                                            }
                                        }
                                    }
                                }
                                if (resume_num > 0 && resume_treat_num > 0) {
                                    resume_treat_percent = Math.ceil((resume_treat_num / resume_num) * 100);
                                }
                                if (stats_db) {
                                    if (view_num < stats_db.view_num) {
                                        view_num = stats_db.view_num;
                                    }
                                }

                                //if(results[0] && results[1]) {
                                //    stats.resume_treat_percent = Math.ceil((results[1]/results[0])*100);
                                //    stats.resume_num = results[0];
                                //    stats.resume_treat_num = results[1];
                                //}
                                // 2. 更新
                                var sql = "INSERT INTO `stats_job`(`jid`,`resume_num`,`view_num`,`resume_treat_percent`,`resume_treat_delay`,`resume_treat_num`) VALUES("
                                    + jid + ","
                                    + resume_num + ","
                                    + view_num + ","
                                    + resume_treat_percent + ","
                                    + resume_treat_delay + ","
                                    + resume_treat_num
                                    + ") ON DUPLICATE KEY UPDATE "
                                    + "`resume_num`=" + resume_num + ","
                                    + "`view_num`=" + view_num + ","
                                    + "`resume_treat_percent`=" + resume_treat_percent + ","
                                    + "`resume_treat_delay`=" + resume_treat_delay + ","
                                    + "`resume_treat_num`=" + resume_treat_num + ";";

                                sequelize.query(sql, {
                                    type: sequelize.QueryTypes.UPDATE
                                }).then(function (row) {
                                    proxy.stats_job.setJobStats(jid, {
                                        resume_num: resume_num,
                                        view_num: view_num,
                                        resume_treat_percent: resume_treat_percent,
                                        resume_treat_delay: resume_treat_delay, // 单位: h
                                        resume_treat_num: resume_treat_num
                                    });
                                }).catch(function (e) {
                                    logger.error(e);
                                });

                                // 3. company_id加入待更新队列
                                proxy.job.findOneById(jid, function (err, job) {
                                    if (!err && job && job.company_id) {
                                        proxy.stats_company.lpush(job.company_id);
                                    }
                                });
                            });

                        }
                    }
                });

            }
            logger.info("Job stats schedule : {status: SUCCESS, size: " + jid_array.length + ", cost:" + (+new Date - start_time) + "ms" + "}");
        } else {
            logger.info("Job stats schedule : {status: SUCCESS, size: 0" + ", cost:" + (+new Date - start_time) + "ms" + "}");
        }


    });

};

/**
 * 批量下线过期职位
 */
exports.delExpiredJobs = function () {
    var start_time = +new Date;
    var opt = {
        where: {
            state: 1,
            deadline: {$lt: +new Date}
        }
    };

    db.job.findAll(opt).then(function (jobs) {
        if (jobs && jobs.length > 0) {
            db.job.update({state: 2}, opt).then(function (rows) {
                if (rows && rows[0] > 0) {
                    var jids = [];
                    for (var i = 0; i < jobs.length; i++) {
                        jids.push(jobs[i].jid);
                        jobs.state = 2;
                        //删除solr数据
                        solr.job.deleteJobById(jobs[i].jid,jobs[i].channel_type || 1);
                    }
                    proxy.job.delJobCacheBatch(jids);
                    logger.info("Del Expired Jobs schedule : {status: SUCCESS, size: " + jobs.length + ", cost:" + (+new Date - start_time) + "ms" + "}");
                }
            }).catch(function (e) {
                logger.error(e);
            });
        } else {
            logger.info("Del Expired Jobs schedule : {status: SUCCESS, size: 0" + ", cost:" + (+new Date - start_time) + "ms" + "}");
        }
    }).catch(function (err) {
        logger.error(err);
    });

};
