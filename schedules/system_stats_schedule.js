var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var proxy = require("../proxy/index");
var logger = require("../common/log").logger("schedule");
var sequelize = require('../model/connect').sequelize;
var async = require('async');

exports.doBgService = function() {
    var start_time = +new Date;
    async.parallel([
        // account
        function (callback) {
            var sql = "SELECT COUNT(DISTINCT `uid`) AS `num` FROM `account`" ;
            sequelize.query(sql, {type: sequelize.QueryTypes.SELECT}).then(function (rows) {
                callback(null, rows[0].num || 0);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            db.employer.count().then(function (num) {
                callback(null, num || 0);
            }).catch(function (e) {
                callback(e);
            });
        },
        function (callback) {
            db.company.count().then(function (num) {
                callback(null, num || 0);
            }).catch(function (e) {
                callback(e);
            });
        },
        function (callback) {
            db.job.count().then(function (num) {
                callback(null, num || 0);
            }).catch(function (e) {
                callback(e);
            });
        },
        function (callback) {
            var sql = "SELECT COUNT(DISTINCT `rid`) AS `num` FROM `resume`" ;
            sequelize.query(sql, {type: sequelize.QueryTypes.SELECT}).then(function (rows) {
                callback(null, rows[0].num || 0);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            db.det.count().then(function (num) {
                callback(null, num || 0);
            }).catch(function (e) {
                callback(e);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.info(err);
            logger.info("System stats schedule : {status: FAILED}");
        }

        var date = new Date().format("yyyyMMdd");
        var sql = "INSERT INTO `stats_system`(`date`,`user_num`,`employer_num`,`company_num`,`job_num`,`resume_num`) "
            + "VALUES('" + date +  "'," + results[0] + "," + results[1] + "," + results[2] + "," + results[3] + "," + results[4] + ") "
            + " ON DUPLICATE KEY UPDATE `user_num` = " + results[0] + ","
            + " `employer_num`=" +  results[1] + ","
            + " `company_num`=" + results[2] + ","
            + " `job_num`=" + results[3] + ","
            + " `det_num`=" + results[5] + ","
            + " `resume_num`=" + results[4];
        sequelize.query(sql, {type: sequelize.QueryTypes.UPDATE}).then(function (rows) {
            logger.info("System stats schedule : {status: SUCCESS, cost:" + (+new Date - start_time) + "ms" + "}");
        }).catch(function (err) {
            logger.info(err);
            logger.info("System stats schedule : {status: FAILED}");
        });
    });
};
