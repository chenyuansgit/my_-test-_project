var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var sequelize = require('../../model/connect').sequelize;
var db = require('../../model/index').models;
var config = require('../../config_default').config;

exports.list = function(req, res) {
    var status = req.params.status || req.query.status || 1;
    var pageIndex = req.params.page || req.query.page || 1;
    var pageSize = 10;

    if (pageIndex < 0) {
        pageIndex = 1;
    }
    async.parallel([
        function (callback) {
            var query = "SELECT * FROM `quick_recruit_term` WHERE `status` = " + status + " ORDER BY `create_time` DESC LIMIT " + (pageIndex - 1) * pageSize + "," + pageSize;
            sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            }).then(function (quick_recruit_term) {
                callback(null, quick_recruit_term);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            var count = "SELECT COUNT(*) AS `count` FROM `quick_recruit_term` WHERE `status` = " + status;
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
        res.render("quick_recruit/term/list", {
            quick_recruit_term: results[0],
            page: pageIndex,
            total: total,
            status: status,
            env:config.env
        });
    });
};


exports.addPage = function (req, res) {
    res.render('quick_recruit/term/add');
};

exports.add = function (req, res) {
    var option = req.body.option;
    option.create_time = option.update_time = +new Date;
    option.status = 2;

    db.quick_recruit_term.create(option).then(function(quick_recruit_term){
        return res.json(resp_status_builder.build(10000));
    }).catch(function (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10003));
    });

};

exports.editPage = function (req, res) {
    var term_id = req.params.term_id || req.query.term_id;
    if (!term_id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }

    db.quick_recruit_term.findOne({
        where: {
            term_id: term_id
        }
    }).then(function (quick_recruit_term) {
        if (!quick_recruit_term) {
            return res.json(resp_status_builder.build(10006, "quick_recruit not exists"));
        }
        res.render('quick_recruit/term/edit', {
            quick_recruit_term: quick_recruit_term.dataValues
        });
    }).catch(function (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10003));
    });

};

/**
 * @param req
 * @param res
 */
exports.edit = function (req, res) {
    var option = req.body.option;
    option.update_time = +new Date;

    proxy.quick_recruit_term.update(option, function (err, rows) {
        if(err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!rows || !rows[0] || rows[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "quick_recruit_term not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};

exports.online = function (req, res) {
    var term_id = req.params.term_id || req.query.term_id;
    var option = {
        term_id: term_id,
        status: 1,
        update_time: +new Date
    };
    proxy.quick_recruit_term.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "quick_recruit not exists"));
        }
        return res.json(resp_status_builder.build(10000));
    });
}
/**
 * 下线
 * @param req
 * @param res
 */
exports.offline = function (req, res) {
    var term_id = req.params.term_id || req.query.term_id;
    var option = {
        status: 2,
        update_time: +new Date,
        term_id: term_id
    };
    proxy.quick_recruit_term.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "quick_recruit not exists"));
        }
        return res.json(resp_status_builder.build(10000));
    });
};