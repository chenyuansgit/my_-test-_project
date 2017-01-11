var logger = require("../../common/log").logger("index");
var resp_status_builder = require('../../common/response_status_builder.js');
var async = require('async');
var sequelize = require('../../model/connect').sequelize;

exports.list = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    async.parallel([
        function(callback){
            sequelize.query("select * from feedback where create_time < :timestamp order by create_time desc limit :offset,10",{
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    offset:(page-1)*10
                }
            }).then(function(feedbacks){
                callback(null,feedbacks);
            }).catch(function(e){
                callback(e);
            });
        },function(callback){
            sequelize.query("select count(*) as count from feedback where create_time < :timestamp",{
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp
                }
            }).then(function(count){
                callback(null,count[0].count);
            }).catch(function(e){
                callback(e);
            });
        }
    ],function(err,results){
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (results[0].length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.render("feedback/list",{
            feedbacks: results[0],
            total: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: page,
            count: results[1]
        });
    });
};