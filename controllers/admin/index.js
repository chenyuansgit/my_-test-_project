var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var sequelize = require('../../model/connect').sequelize;
require('../../common/fn');


exports.home = function (req, res) {// 主页渲染
    async.parallel([
        function (callback) {
            proxy.stats_job.getQueueSize(function (e, size) {
                callback(e, size);
            });
        },
        function (callback) {
            proxy.stats_company.getQueueSize(function (e, size) {
                callback(e, size);
            });
        },
        function (callback) {
            proxy.quick_recruit_user_info.getQueueSize(function (e, size) {
                callback(e, size);
            });
        },
        function (callback) {
            proxy.quick_recruit_user_history.getQueueSize(function (e, size) {
                callback(e, size);
            });
        },
        function (callback) {
            sequelize.query("select * from stats_system order by date desc limit 0,31",{type: sequelize.QueryTypes.SELECT}).then(function (stats_systems) {
                callback(null, stats_systems);
            }).catch(function (e) {
                callback(e);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            res.render('home', {});
        }
        var stats = results[4] && results[4][0] ? results[4][0]: {};
        stats.job_update_queue_size = results[0];
        stats.company_update_queue_size = results[1];
        stats.qr_user_info_update_queue_size = results[2];
        stats.qr_user_history_update_queue_size = results[3];
        stats.incres = JSON.stringify(results[4]||[]);
        res.render('home', stats);
    });
};

