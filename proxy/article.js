var db = require('../model/index').models;
var sequelize = require('../model/connect').sequelize;
var async = require('async');

exports.findOneById = function (id, callback) {
    db.article.findOne({
        where: {
            id: id
        }
    }).then(function (article) {
        callback(null, article);
    }).catch(function (e) {
        callback(e);
    });
};
exports.findNextOneById = function (id, callback) {
    sequelize.query("select id,title,summary,cover from article where status = 1 and id < :id order by id desc limit 1", {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            id: id
        }
    }).then(function (articles) {
        callback(null, articles[0] || {});
    }).catch(function (e) {
        callback(e);
    });
};
exports.findPrevOneById = function (id, callback) {
    sequelize.query("select id,title,summary,cover from article where status = 1 and id > :id order by id limit 1", {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            id: id
        }
    }).then(function (articles) {
        callback(null, articles[0] || {});
    }).catch(function (e) {
        callback(e);
    });
};


exports.list = function (option, cb) {
    var status = option.status || 1, page = option.page > 1 ? option.page : 1, timestamp = option.timestamp || +new Date, category_id = option.category_id || 0;
    async.parallel([function (callback) {
        sequelize.query("select id,title,category_id,summary,author,cover,status,create_time from article where status = :status and create_time < :timestamp " + (category_id > 1 ? "and category_id = :category_id" : "") + " order by create_time desc limit :offset,10", {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                status: status,
                timestamp: timestamp,
                category_id: category_id,
                offset: (page - 1) * 10
            }
        }).then(function (articles) {
            callback(null, articles || []);
        }).catch(function (e) {
            callback(e);
        });
    }, function (callback) {
        sequelize.query("select count(*) as count from article where status = :status and create_time < :timestamp " + (category_id > 1 ? "and category_id = :category_id" : ""), {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                status: status,
                timestamp: timestamp,
                category_id: category_id
            }
        }).then(function (count) {
            callback(null, count[0].count);
        }).catch(function (e) {
            callback(e);
        });
    }], function (err, results) {
        if (err) {
            return cb(err);
        }
        cb(null, {
            articles: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: page,
            count: results[1]
        });
    });
};


exports.create = function (option, callback) {
    db.article.create(option).then(function (article) {
        callback(null, article);
    }).catch(function (e) {
        callback(e);
    });
};

exports.update = function (option, callback) {
    db.article.update(option, {
        where: {
            id: option.id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

exports.del = function (id, callback) {
    db.article.update({status: 9}, {
        where: {
            id: id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};