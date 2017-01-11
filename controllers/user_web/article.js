var logger = require("../../common/log").logger("index");
var proxy = require('../../proxy/index');
var async = require('async');


exports.listPage = function (req, res) { //鸟巢主页面
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.article.list({
        category_id: req.query.category_id,
        status: 1,
        page: page,
        timestamp: timestamp
    }, function (err, data) {
        if (err) {
            logger.error(err);
            data = {};
        }
        if (data.articles && data.articles.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.category_id = req.query.category_id;
        res.render("nest/list", data);
    });
};
exports.detailPage = function (req, res) { //鸟巢文章页面
    var id = req.params.id;
    async.parallel([function (callback) {
        proxy.article.findOneById(id, function (e, article) {
            callback(e, article);
        });
    }, function (callback) {
        proxy.article.findNextOneById(id, function (e, article) {
            callback(e, article);
        });
    }, function (callback) {
        proxy.article.findPrevOneById(id, function (e, article) {
            callback(e, article);
        });
    }], function (err, results) {
        if (err) {
            logger.error(err);
        }
        res.render("nest/detail", {
            article: results[0] || {},
            next: results[1] || {},
            prev: results[2] || {}
        });
    });
};