var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var sequelize = require('../../model/connect').sequelize;
var config = require('../../config_default').config;
var validate = require('../../common/validate');
var email_template = require('../../common/email_template');

exports.list = function(req, res) {
    var status = req.params.status || req.query.status || 1;
    var pageIndex = req.params.page || req.query.page || 1;
    var pageSize = 10;

    if (pageIndex < 0) {
        pageIndex = 1;
    }
    async.parallel([
        function (callback) {
            var query = "SELECT * FROM `quick_recruit_apply` WHERE `status` = " + status + " ORDER BY `create_time` DESC LIMIT " + (pageIndex - 1) * pageSize + "," + pageSize;
            sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            }).then(function (quick_recruit_applies) {
                callback(null, quick_recruit_applies);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            var count = "SELECT COUNT(*) AS `count` FROM `quick_recruit_apply` WHERE `status` = " + status;
            sequelize.query(count, {
                type: sequelize.QueryTypes.SELECT
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
        var total = (count % pageSize == 0) ? (count / pageSize) : (parseInt(count / pageSize) + 1);
        res.render("quick_recruit/apply/list", {
            quick_recruit_applies: results[0],
            page: pageIndex,
            total: total,
            status: status,
            env:config.env,
            host: config.baseUrl
        });
    });
};

exports.agree = function (req, res) {
    var id = req.params.id;
    var option = {
        id: id,
        status: 2,
        update_time: +new Date
    };
    proxy.quick_recruit_apply.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "quick_recruit_apply not exists"));
        }
        //发送给学生的通过邮件
        proxy.quick_recruit_apply.findOneById(id,function(e,quick_recruit_apply){
            if(e){
                return logger.error(e);
            }
            if(quick_recruit_apply){
                email_template.quickRecruitApplySuccess({
                    term_id: quick_recruit_apply.term_id,
                    resume_name : quick_recruit_apply.name
                }, function (e0, str) {
                    if (!e0)  validate.sendMail({
                        name: quick_recruit_apply.name,
                        address: quick_recruit_apply.email,
                        subject: "快招申请通过通知(来自实习鸟)",
                        html: str
                    });
                });
            }
        });
        res.json(resp_status_builder.build(10000));
    });
};


exports.refused = function (req, res) {
    var id = req.params.id;
    var opt = {
        id: id,
        status: 3,
        update_time: +new Date
    };
    proxy.quick_recruit_apply.update(opt, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "quick_recruit_apply not exists"));
        }
        //发送给学生的拒绝邮件
        proxy.quick_recruit_apply.findOneById(id,function(e,quick_recruit_apply){
            if(e){
                return logger.error(e);
            }
            if(quick_recruit_apply){
                email_template.quickRecruitApplyRefused({
                    term_id: quick_recruit_apply.term_id,
                    resume_name : quick_recruit_apply.name
                }, function (e0, str) {
                    if (!e0)  validate.sendMail({
                        name: quick_recruit_apply.name,
                        address: quick_recruit_apply.email,
                        subject: "快招申请拒绝通知(来自实习鸟)",
                        html: str
                    });
                });
            }
        });
        res.json(resp_status_builder.build(10000));
    });
};