var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var proxy = require("../proxy/index");
var logger = require("../common/log").logger("schedule");
var sequelize = require('../model/connect').sequelize;
var solr = require("../solr/index").models;
var async = require('async');

require('../common/fn');

var det_expire_time = 2 * 30 * 24 * 60 * 60 * 1000;//2个月

function updateStats(id, resume_num, view_num, resume_check_num, callback) {
    var sql = "INSERT INTO `stats_det`(`det_id`,`resume_num`,`view_num`,`resume_check_num`) VALUES("
        + id + ","
        + resume_num + ","
        + view_num + ","
        + resume_check_num
        + ") ON DUPLICATE KEY UPDATE "
        + "`resume_num`=" + resume_num + ","
        + "`view_num`=" + view_num + ","
        + "`resume_check_num`=" + resume_check_num + ";";
    sequelize.query(sql, {
        type: sequelize.QueryTypes.UPDATE
    }).then(function () {
        proxy.stats_det.setDetStats(id, {
            resume_num: resume_num,
            view_num: view_num,
            resume_check_num: resume_check_num
        });
        callback && callback(null);
    }).catch(function (e) {
        logger.error(e);
        callback && callback(e);
    });
}

exports.doBgService = function (item) {
    proxy.stats_det.rpop(item, function (err, id_array) {
        if (err) {
            logger.error(err);
            return logger.info("Det stats schedule : {status: FAILED}");
        }
        if (!id_array || !id_array.length) {
            return logger.info("no Det task");
        }
        for (var i = 0; i < id_array.length; i++) {
            proxy.stats_det.getDetStats(id_array[i], function (err, stats, id) {
                if (!err && stats) {
                    async.parallel([
                        function (callback) {
                            db.resume_det_rel.count({
                                where: {
                                    det_id: id
                                }
                            }).then(function (rel_len) {
                                callback(null, rel_len);
                            }).catch(function (e) {
                                callback(e);
                            });
                        },
                        function (callback) {
                            db.stats_det.findOne({
                                where: {
                                    det_id: id
                                }
                            }).then(function (stats_db) {
                                callback(null, stats_db);
                            }).catch(function (e) {
                                callback(e);
                            });
                        }
                    ], function (err, results) {
                        if (err) {
                            return logger.error(err);
                        }
                        //简历投递数
                        var resume_num = results[0] || 0;

                        //浏览量
                        var redis_view_num = stats.view_num || 0;
                        var db_view_num = results && results[1] && results[1].view_num ? results[1].view_num : 0;
                        var view_num = redis_view_num > db_view_num ? redis_view_num : db_view_num;

                        //简历查看量
                        var redis_resume_check_num = stats.resume_check_num || 0;
                        var db_resume_check_num = results && results[1] && results[1].resume_check_num ? results[1].resume_check_num : 0;
                        var resume_check_num = redis_resume_check_num > db_resume_check_num ? redis_resume_check_num : db_resume_check_num;

                        //更新统计数据
                        updateStats(id, resume_num, view_num, resume_check_num);

                    });
                }
            });
        }
    });
};
function expireDet(id, company_id, channel_type, callback) {
    db.det.update({
        state: 2,
        update_time: +new Date
    }, {
        where: {
            id: id
        }
    }).then(function () {
        solr.job.deleteJobById(id, channel_type);
        if (company_id) {
            solr.company.update(company_id);
            proxy.stats_company.lpush(company_id);
        }
        proxy.det.delCache(id);
        callback && callback(null);
    }).catch(function (e) {
        callback && callback(e);
    });
}
/**
 * 批量下线过期职位
 */
exports.delExpiredDet = function () {
    var opt = {
        where: {
            state: 1,
            deadline: {
                $lt: +new Date
            }
        }
    };
    db.det.findAll(opt).then(function (dets) {
        if (!dets || !dets.length) {
            return logger.info("Del Expired Dets schedule : {status: SUCCESS, size: 0}");
        }
        for (var i = 0, len = dets.length; i < len; ++i) {
            expireDet(dets[i].id, dets[i].company_id, dets[i].channel_type || 2);
        }
    }).catch(function (err) {
        logger.error(err);
    });
};
