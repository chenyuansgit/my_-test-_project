/**
 * Created by dell on 2016/1/15.
 */
var express = require('express');
var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var article_type = require('../../common/article_type.json');
var async = require('async');
require('../../common/fn');


exports.list = function (req, res) {
    var page = req.query.page > 1 ? req.query.page : 1, category_id = req.query.category_id, status = req.query.status, now_time = +new Date, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.article.list({
        page: page,
        timestamp: timestamp,
        status: status,
        category_id: category_id
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.articles && data.articles.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.status = status;
        data.total = data.pages;
        logger.info(data);
        res.render("article/list", data);
    });
};

exports.addPage = function (req, res) {
    var category_id = req.param.category_id || req.query.category_id || 1;
    res.render('article/add', {
        category_id: category_id,
        article_type: article_type
    });
};

exports.add = function (req, res) {
    var option = req.body.option;
    option.create_time = option.update_time = +new Date;

    proxy.article.create(option, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000));
    });
};

exports.editPage = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    proxy.article.findOneById(id, function (err, article) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!article) {
            return res.json(resp_status_builder.build(10006, "article not exists"));
        }
        res.render('article/edit', {
            article: article,
            article_type: article_type
        });
    });
};

exports.edit = function (req, res) {
    var id = req.params.id || req.query.id;
    var option = req.body.option;
    option.id = id;
    option.update_time = +new Date;
    proxy.article.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "article not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};

/**
 * 文章发布
 * @param req
 * @param res
 */
exports.publish = function (req, res) {
    var id = req.params.id || req.query.id;
    var option = {
        id: id,
        status: 1,
        update_time: +new Date
    };
    proxy.article.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "article not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};
/**
 * 文章下线
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
    proxy.article.update(option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "article not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};

exports.del = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    proxy.article.del(id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "article not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};


exports.detailPage = function (req, res) { //文章预览页面
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
        res.render("article/preview", {
            article: results[0] || {}
        });
    });
};

exports.previewPage = function (req, res) {
    res.render("article/advancedPreview");
};

