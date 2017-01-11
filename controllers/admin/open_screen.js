var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var sequelize = require('../../model/connect').sequelize;
var config = require('../../config_default').config;

require('../../common/fn');

exports.add = function (req, res) {
    var option = req.body.option || {}, now = +new Date;
    var desc = option.desc,
        img320 = option.img320 || "",
        img480 = option.img480 || "",
        img720 = option.img720 || "",
        img750 = option.img750 || "",
        img1080 = option.img1080,
        url = option.url || "";
    if (!(img320 && img480 && img720 && img750 && img1080)) {
        return res.json(resp_status_builder.build("10002", "open screen missing"));
    }
    option.create_time = option.update_time = now;
    proxy.open_screen.create(option, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build("10005"));
        }
        return res.json(resp_status_builder.build("10000"));
    })
};
exports.addPage = function (req, res) {
    res.render('open_screen/add');
};

exports.edit = function (req, res) {
    var option = req.body.option || {}, now = +new Date;
    var id = req.params.id;
    var desc = option.desc,
        img320 = option.img320 || "",
        img480 = option.img480 || "",
        img720 = option.img720 || "",
        img750 = option.img750 || "",
        img1080 = option.img1080,
        url = option.url || "";
    if (!(img320 && img480 && img720 && img750 && img1080)) {
        return res.json(resp_status_builder("10002"));
    }
    option.update_time = now;
    option.id = id;
    proxy.open_screen.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "open screen not exists"));
        }
        return res.json(resp_status_builder.build(10000));
    });
};
exports.editPage = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    proxy.open_screen.findOneById(id, function (err, open_screen) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!open_screen) {
            return res.json(resp_status_builder.build(10006, "open_screen not exists"));
        }
        res.render('open_screen/edit', {
            open_screen: open_screen.dataValues
        });
    });

};

exports.offline = function (req, res) {
    proxy.open_screen.offline();
    res.json(resp_status_builder.build(10000));
};
exports.online = function (req, res) {
    proxy.open_screen.online();
    res.json(resp_status_builder.build(10000));
};

exports.list = function (req, res) {
    var pageIndex = req.params.page || req.query.page || 1;
    var pageSize = 10;

    async.parallel([
            function (callback) {
                var query = "SELECT * FROM `open_screen`  ORDER BY `update_time` DESC LIMIT " + (pageIndex - 1) * pageSize + "," + pageSize;
                sequelize.query(query, {
                    type: sequelize.QueryTypes.SELECT
                }).then(function (ads) {
                    callback(null, ads);
                }).catch(function (err) {
                    callback(err);
                });
            }, function (callback) {
                var count = "SELECT COUNT(*) AS `count` FROM `open_screen`";
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
            res.render("open_screen/list", {
                open_screens: results[0],
                page: pageIndex,
                total: total
            });
        }
    );
};
exports.currPage = function(req, res){
    proxy.open_screen.getLatest(function(err,open_screen){
        if(err){
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.render("open_screen/curr", {
            open_screen: open_screen
        });
    });
};