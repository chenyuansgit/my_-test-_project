var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var sequelize = require('../../model/connect').sequelize;
var config = require('../../config_default').config;

require('../../common/fn');


exports.list = function (req, res) {
    var status = req.params.status || req.query.status || 1;
    var category_id = req.param.category_id || req.query.category_id || 1;
    var pageIndex = req.params.page || req.query.page || 1;
    var pageSize = 10;

    if (pageIndex < 0) {
        pageIndex = 1;
    }

    async.parallel([
        function (callback) {
            var query = "SELECT * FROM `ad` WHERE `status` = " + status + " AND `category_id` = " + category_id + " ORDER BY `update_time` DESC LIMIT " + (pageIndex - 1) * pageSize + "," + pageSize;
            sequelize.query(query, {
                type: sequelize.QueryTypes.SELECT
            }).then(function (ads) {
                callback(null, ads);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            var count = "SELECT COUNT(*) AS `count` FROM `ad` WHERE `status` = " + status + " AND `category_id` = " + category_id;
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
        res.render("ad/list", {
            ads: results[0],
            page: pageIndex,
            total: total,
            status: status,
            category_id: category_id
        });
    });
};

exports.addPage = function (req, res) {
    var category_id = req.param.category_id || req.query.category_id || 1;
    res.render('ad/add', {
        category_id: category_id
    });
};

exports.add = function (req, res) {
    var option = req.body.option || {}, now = +new Date;
    console.log(config.ad["category_" + option.category_id].max_length);
    console.log(option);
    if (!option.order || !(option.order <= config.ad["category_" + option.category_id].max_length && option.order >= 1) || !option.start_time || !option.end_time || !option.image || !option.url || !option.category_id || option.id) {
        return res.json(resp_status_builder.build(10002));
    }
    //检测是否已经存在相应的广告,广告在线时间是否冲突
    proxy.ad.findOneByOption({
        where: {
            status: 1,
            order: option.order,
            category_id: option.category_id,
            $or: [{
                start_time: {
                    $between: [option.start_time, option.end_time]
                }
            }, {
                end_time: {
                    $between: [option.start_time, option.end_time]
                }
            }]

        }
    }, function (e, ad0) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10003));
        }
        if (ad0) {
            return res.json(resp_status_builder.build(10002, 'On-line time conflict'));
        }
        option.create_time = option.update_time = now;
        option.status = 1;

        proxy.ad.create(option, function (err, ad) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            if (now <= option.end_time && now >= option.start_time) {
                proxy.ad.updateOnShowOne(option.category_id, option.order, ad, function (e0) {
                    if (e0) {
                        logger.error(e0);
                    }
                });
            }
            return res.json(resp_status_builder.build(10000));
        });
    });
};

exports.editPage = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }

    proxy.ad.findOneById(id, function (err, ad) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!ad) {
            return res.json(resp_status_builder.build(10006, "ad not exists"));
        }
        res.render('ad/edit', {
            ad: ad.dataValues
        });
    });

};

exports.edit = function (req, res) {
    var option = req.body.option || {}, now = +new Date;
    var id = req.params.id;
    if (!option.order || !(option.order <= config.ad["category_" + option.category_id].max_length && option.order >= 1) || !option.start_time || !option.end_time || !option.image || !option.url || !option.category_id || option.id) {
        return res.json(resp_status_builder.build(10002));
    }
    option.update_time = now;
    if (option.status == 1) {
        if (option.end_time <= now) {
            return res.json(resp_status_builder.build(10002, 'wrong ad ending time!'));
        }
        //检测是否已经存在相应的广告,广告在线时间是否冲突
        return proxy.ad.findOneByOption({
            where: {
                status: 1,
                order: option.order,
                category_id: option.category_id,
                $or: [{
                    start_time: {
                        $between: [option.start_time, option.end_time]
                    }
                }, {
                    end_time: {
                        $between: [option.start_time, option.end_time]
                    }
                }]

            }
        }, function (e, ad0) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10003));
            }
            if (ad0 && ad0.id != id) {
                return res.json(resp_status_builder.build(10002, 'On-line time conflict'));
            }

            proxy.ad.updateOneById(option, id, function (err, row) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10003));
                }
                if (!row || !row[0] || row[0] <= 0) {
                    return res.json(resp_status_builder.build(10006, "ad not exists"));
                }
                if (now <= option.end_time && now >= option.start_time) {
                    proxy.ad.findOneById(id, function (e1, ad) {
                        if (e1) {
                            return logger.error(e1);
                        }
                        proxy.ad.updateOnShowOne(option.category_id, option.order, ad, function (e2) {
                            if (e2) {
                                logger.error(e2);
                            }
                        });
                    });
                }
                return res.json(resp_status_builder.build(10000));
            });
        });
    }
    proxy.ad.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "ad not exists"));
        }
        proxy.ad.deleteOnShowOne(option.category_id, option.order);
        return res.json(resp_status_builder.build(10000));
    });
};

exports.del = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    proxy.ad.del(id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "ad not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};


/**
 * 广告发布
 * @param req
 * @param res
 */
exports.online = function (req, res) {
    var id = req.params.id || req.query.id, option = req.body.option || {}, now = +new Date;
    if (!id || !option.start_time || !option.end_time || option.id || !option.category_id) {
        return res.json(resp_status_builder.build(10002));
    }
    if (option.end_time <= now) {
        return res.json(resp_status_builder.build(10002, 'wrong ad ending time!'));
    }
    var opt = {
        status: 1,
        update_time: now
    };
    proxy.ad.findOneByOption({
        where: {
            status: 1,
            order: option.order,
            category_id: option.category_id,
            $or: [{
                start_time: {
                    $between: [option.start_time, option.end_time]
                }
            }, {
                end_time: {
                    $between: [option.start_time, option.end_time]
                }
            }]

        }
    }, function (e, ad0) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10003));
        }
        if (ad0 && ad0.id != id) {
            return res.json(resp_status_builder.build(10002, 'On-line time conflict'));
        }

        proxy.ad.updateOneById(opt, id, function (err, row) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            if (!row || !row[0] || row[0] <= 0) {
                return res.json(resp_status_builder.build(10006, "ad not exists"));
            }
            if (now <= option.end_time && now >= option.start_time) {
                proxy.ad.findOneById(id, function (e1, ad) {
                    if (e1) {
                        return logger.error(e1);
                    }
                    proxy.ad.updateOnShowOne(option.category_id, option.order, ad, function (e2) {
                        if (e2) {
                            logger.error(e2);
                        }
                    });
                });
            }
            res.json(resp_status_builder.build(10000));
        });
    });
};
/**
 * 广告下线
 * @param req
 * @param res
 */
exports.offline = function (req, res) {
    var id = req.params.id || req.query.id;
    if (!id) {
        return res.json(resp_status_builder.build(10002));
    }
    var option = {
        status: 2,
        update_time: +new Date
    };
    proxy.ad.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "ad not exists"));
        }
        //删除redis数据
        proxy.ad.findOneById(id, function (e, ad) {
            if (e) {
                return logger.error(e);
            }
            if (ad && ad.dataValues) {
                proxy.ad.deleteOnShowOne(ad.category_id, ad.order);
            }
        });
        return res.json(resp_status_builder.build(10000));
    });
};