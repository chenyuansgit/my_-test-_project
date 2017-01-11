var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');
var logger = require("../../common/log").logger("index");
var async = require("async");
require('../../common/fn');


var type_arr = ['company', 'job', 'det'];

//判断是否是对的收藏类型
function isCorrectType(type) {
    return type_arr.indexOf(type) > -1 ? 1 : 0;
}
exports.add = function (req, res) {
    var option = req.body.option || {}, type = option.type, uid = res.locals.uid, id = option.id;
    if (!isCorrectType(type) || !id) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    proxy.favorite.isFavorite(uid, type, id, function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, '服务器错误'));
        }
        if (score > 1) {
            return res.json(resp_status_builder.build(10006, '已经收藏过了'));
        }
        proxy.favorite.add(uid, type, id, function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005, '服务器错误'));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};
exports.cancel = function (req, res) {
    var option = req.body.option || {}, type = option.type, uid = res.locals.uid, id = option.id;
    if (!isCorrectType(type) || !id) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    proxy.favorite.isFavorite(uid, type, id, function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, '服务器错误'));
        }
        if (!score) {
            return res.json(resp_status_builder.build(10006, '还未收藏'));
        }
        proxy.favorite.del(uid, type, id, function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005, '服务器错误'));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};

exports.list = function (req, res) {
    var page = req.query.page > 1 ? req.query.page : 1, type = req.query.type, uid = res.locals.uid, now_time = +new Date, timestamp = (page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    if (!isCorrectType(type)) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    async.parallel([
        function (callback) {
            proxy.favorite.getFavoritesLength(uid, type, 0, timestamp, function (e, length) {
                callback(e, length);
            });
        }, function (callback) {
            proxy.favorite.list(uid, type, timestamp, 0, (page - 1) * 10, 10, function (e, ids) {
                callback(e, ids);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, '服务器错误'));
        }
        var ids = results[1] || [], count = results[0] || 0, pages = count % 10 ? (parseInt(count / 10) + 1) : count / 10, data = {};
        if (!ids || !ids.length) {
            return res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                favorites: [],
                pages: pages,
                page: page,
                count: count
            }));
        }
        proxy[type].getListByIds(ids, function (e, favorites) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005, '服务器错误'));
            }
            data = {
                favorites: favorites || [],
                pages: pages,
                page: page,
                count: count
            };
            if (favorites && favorites.length && page == 1) {
                data.timestamp = timestamp;
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
        });
    });
};
exports.listPage = function (req, res) {
    res.render("favorite/list");
};


exports.empty = function (req, res) {
    var option = req.body.option || {}, type = [], uid = res.locals.uid;
    try {
        type = option.type.split(',');
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    async.each(type, function (_type, callback) {
        if (!isCorrectType(_type)) {
            return callback(null);
        }
        proxy.favorite.empty(uid, _type, function (e) {
            callback(e);
        });
    }, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005, '服务器错误'));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
