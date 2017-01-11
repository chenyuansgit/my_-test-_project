var logger = require("../../common/log").logger("index");
var sequelize = require('../../model/connect').sequelize;
var resp_status_builder = require('../../common/response_status_builder.js');
var async = require('async');
var config = require('../../config_default').config;

exports.getListByUid = function (req, res) {
    var uid = req.query.uid, page = req.query.page > 1 ? req.query.page : 1, now_time = +new Date, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    async.parallel([
        function (callback) {
            var query = "SELECT a.user_id,a.status,b.name as job_name,b.jid,c.name as company_name,c.cid FROM `quick_recruit_invite` a,job b,company c where a.job_id = b.jid and a.company_id = c.cid and a.user_id = :uid and a.create_time <:timestamp order by a.create_time desc limit :offset,:size";
            sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    uid: uid,
                    offset: (page - 1) * 10,
                    size: 10,
                    timestamp: timestamp
                }
            }).then(function (quick_recruit_applies) {
                callback(null, quick_recruit_applies);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            var count = "SELECT COUNT(*) AS `count` FROM `quick_recruit_invite` WHERE `user_id` = :uid and create_time < :timestamp";
            sequelize.query(count, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    uid: uid,
                    timestamp: timestamp
                }
            }).then(function (count) {
                callback(null, count[0]["count"]);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        var count = results[1];
        var total = (count % 10 == 0) ? (count / 10) : (parseInt(count / 10) + 1);
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            quick_recruit_applies: results[0],
            page: page,
            total: total,
            env: config.env,
            host: config.baseUrl
        }));
    });
};


