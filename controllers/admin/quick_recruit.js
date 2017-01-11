var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var sequelize = require('../../model/connect').sequelize;
var db = require('../../model/index').models;
var config = require('../../config_default').config;
require('../../common/fn');

exports.list = function (req, res) {
    var status = req.params.status || req.query.status || 1;
    var pageIndex = req.params.page || req.query.page || 1;
    var pageSize = 10;

    if (pageIndex < 0) {
        pageIndex = 1;
    }

    async.parallel([
        function (callback) {
            var query = "SELECT * FROM `quick_recruit` WHERE `status` = " + status + " ORDER BY `term_id` DESC LIMIT " + (pageIndex - 1) * pageSize + "," + pageSize;
            sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            }).then(function (quick_recruits) {
                callback(null, quick_recruits);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            var count = "SELECT COUNT(*) AS `count` FROM `quick_recruit` WHERE `status` = " + status;
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
        res.render("quick_recruit/special/list", {
            quick_recruits: results[0],
            page: pageIndex,
            total: total,
            status: status,
            env: config.env
        });
    });
};

exports.addPage = function (req, res) {
    sequelize.query('select term_id from quick_recruit_term group by term_id order by term_id desc limit 0,20;', {type: sequelize.QueryTypes.SELECT}).then(function (terms) {
        logger.info(terms);
        res.render('quick_recruit/special/add', {terms: terms || []});
    }).catch(function (err) {
        logger.error(err);
        return res.json(resp_status_builder.build(10003));
    });
};

exports.add = function (req, res) {
    var option = req.body.option;
    option.create_time = option.update_time = +new Date;

    proxy.quick_recruit.create(option, function (err, quick_recruit) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        return res.json(resp_status_builder.build(10000));
    });
};

exports.editPage = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }

    db.quick_recruit.findOne({
        where: {
            id: id
        }
    }).then(function (quick_recruit) {
        if (!quick_recruit) {
            return res.json(resp_status_builder.build(10006, "quick_recruit not exists"));
        }
        res.render('quick_recruit/special/edit', {
            quick_recruit: quick_recruit.dataValues
        });
    }).catch(function (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10003));
    });

};

exports.edit = function (req, res) {
    var option = req.body.option;
    option.update_time = +new Date;
    // 档期不可修改
    if (option.term_id) {
        delete option.term_id;
    }
    proxy.quick_recruit.update(option, function (err, row) {
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

exports.del = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    var option = {
        id: id,
        update_time: +new Date,
        status: 9
    };
    proxy.quick_recruit.update(option, function (err, row) {
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


/**
 * 快招发布
 * @param req
 * @param res
 */
exports.online = function (req, res) {
    var id = req.params.id || req.query.id;
    var option = {
        id: id,
        status: 1,
        update_time: +new Date
    };
    proxy.quick_recruit.update(option, function (err, row) {
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
/**
 * 快招下线
 * @param req
 * @param res
 */
exports.offline = function (req, res) {
    var id = req.params.id || req.query.id;
    var option = {
        status: 2,
        update_time: +new Date,
        id: id
    };
    proxy.quick_recruit.update(option, function (err, row) {
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
