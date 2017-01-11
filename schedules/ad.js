var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var proxy = require("../proxy/index");
var logger = require("../common/log").logger("schedule");
var async = require('async');
var sendMail = require('../common/validate').sendMail;
var config = require('../config_default').config;
require('../common/fn');

//批量下线过期的广告,上线预定的广告
exports.updateOnShowList = function (cb) {
    var now = +new Date;
    db.ad.findAll({
        where: {
            status: 1
        },
        order: '`order`'
    }).then(function (ads) {
        if (!ads.length) {
            return cb && cb(null, 1);
        }
        var online_ads = {
            category_1: [],
            category_2: [],
            category_3: [],
            category_4: [],
            category_6: []
        };
        var offline_ads_id_arr = [];
        for (var i = 0, len = ads.length; i < len; ++i) {
            if (ads[i].start_time < now && ads[i].end_time > now) {
                online_ads["category_" + ads[i].category_id].push(ads[i].dataValues || ads[i]);
                continue;
            }
            if (ads[i].end_time <= now) {
                offline_ads_id_arr.push(ads[i].id);
            }
        }
        async.parallel([
            function (callback) {
                proxy.ad.updateOnShowList(1, online_ads.category_1, function (err) {
                    callback(err);
                });
            },
            function (callback) {
                proxy.ad.updateOnShowList(2, online_ads.category_2, function (err) {
                    callback(err);
                });
            },
            function (callback) {
                proxy.ad.updateOnShowList(3, online_ads.category_3, function (err) {
                    callback(err);
                });
            },
            function (callback) {
                proxy.ad.updateOnShowList(4, online_ads.category_4, function (err) {
                    callback(err);
                });
            },
            function (callback) {
                proxy.ad.updateOnShowList(6, online_ads.category_6, function (err) {
                    callback(err);
                });
            },
            function (callback) {
                if (!offline_ads_id_arr.length) {
                    return callback(null, 0);
                }
                db.ad.update({
                    update_time: +new Date,
                    status: 2
                }, {
                    where: {
                        id: offline_ads_id_arr
                    }
                }).then(function (rows) {
                    callback(null, rows);
                }).catch(function (err) {
                    callback(err);
                });
            }
        ], function (error, results) {
            if (error) {
                logger.error(error);
                return cb && cb(error);
            }
            cb && cb(results);
            logger.info("ad schedule : {status: SUCCESS, cost:" + (+new Date - now) + "ms" + "}");
        });
    }).catch(function (e) {
        if (e) {
            logger.error(e);
        }
        cb && cb(e);
    });
};


function warningMailRender(ads) {
    var waring_html = "<h3>一天内即将下线的广告列表:</h3><table><thead><tr>\
            <th>类型ID</th>\
            <th>下线时间</th>\
            <th >广告序号</th>\
            <th>跳转</th>\
            </tr>\
            </thead><tobody>";
    for (var i = 0, len = ads.length; i < len; ++i) {
        waring_html += "<tr><td>" + ads[i].category_id + "</td><td>" + new Date(ads[i].end_time).format('yyyy-MM-dd hh:mm') + "</td><td>" + ads[i].order + "</td><td><a href='" + ads[i].url + "'>" + ads[i].url + "</a></td></tr>";
    }
    waring_html += "</tbody></table>";
    return waring_html;
}
//邮件定时通知,又即将到期的广告
exports.sendWarning = function (cb) {
    if (config.env !== 'prod') {
        return cb(null, 1);
    }
    var now = +new Date;
    async.parallel([
        function (callback) {
            proxy.ad.findOnShowList(1, function (err, ads) {
                callback(err, ads);
            });
        },
        function (callback) {
            proxy.ad.findOnShowList(2, function (err, ads) {
                callback(err, ads);
            });
        },
        function (callback) {
            proxy.ad.findOnShowList(3, function (err, ads) {
                callback(err, ads);
            });
        },
        function (callback) {
            proxy.ad.findOnShowList(4, function (err, ads) {
                callback(err, ads);
            });
        },
        function (callback) {
            proxy.ad.findOnShowList(6, function (err, ads) {
                callback(err, ads);
            });
        }
    ], function (error, results) {
        if (error) {
            logger.error(error);
            return cb && cb(error);
        }
        var warning = [];
        for (var m = 0, l = results.length; m < l; ++m) {
            for (var i = 0, len = results[m].length; i < len; ++i) {
                var ad = JSON.parse(results[m][i]);
                if (ad.end_time - now >= (24 * 60 * 60 * 1000 - 20 * 60 * 1000) && ad.end_time - now < 24 * 60 * 60 * 1000) {
                    warning.push(ad);
                }
            }
        }
        logger.info("warning================");
        logger.info(warning);
        if (!warning.length) {
            return cb && cb(null);
        }
        var html = warningMailRender(warning);
        logger.info("warning html:" + html);
        sendMail({
            address: ['zengbq@internbird.com', 'wangzp@internbird.com'],
            subject: '广告即将到期提醒',
            html: html
        }, function (e, info) {
            if (e) {
                logger.error(e);
            }
            cb && cb(e, info);
        });
    });
};

