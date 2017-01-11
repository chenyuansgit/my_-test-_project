var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var config = require('../config_default').config;

var redis_key_ad_list = "redis_key_ad_list_";

exports.redis_key_ad_list = redis_key_ad_list;
//var redis_key_ad_update_status = "redis_key_ad_update_status";

exports.findOneById = function (id, callback) {
    db.ad.findOne({
        where: {
            id: id
        }
    }).then(function (ad) {
        callback(null, ad);
    }).catch(function (e) {
        callback(e);
    });
};
exports.findOneByOption = function (option, callback) {
    db.ad.findOne(option).then(function (ad) {
        callback(null, ad);
    }).catch(function (e) {
        callback(e);
    });
};
exports.create = function (option, callback) {
    db.ad.create(option).then(function (ad) {
        callback(null, ad);
    }).catch(function (e) {
        callback(e);
    });
};

exports.updateOneById = function (option, id, callback) {
    db.ad.update(option, {
        where: {
            id: id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

exports.del = function (id, callback) {
    db.ad.update({status: 9}, {
        where: {
            id: id,
            status: {
                $ne: 1
            }
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};
exports.findOnShowList = function (category_id, callback) {
    var args = [redis_key_ad_list + category_id, 0, config.ad["category_" + category_id].max_length, 'LIMIT', 0, config.ad["category_" + category_id].max_length];
    cache.zrangebyscore(args, function (err, ads) {
        if (err) {
            return callback(err);
        }
        callback(null, ads || []);
    });
};
exports.updateOnShowOne = function (category_id, order, ad, callback) {
    cache.zremrangebyscore([redis_key_ad_list + category_id, order, order], function (err) {
        cache.zadd([redis_key_ad_list + category_id, order, JSON.stringify(ad)], function (e, res) {
            callback && callback(e, res);
        });
    });
};
exports.deleteOnShowOne = function (category_id, order, callback) {
    cache.zremrangebyscore([redis_key_ad_list + category_id, order, order], function (err, res) {
        callback && callback(null, res);
    });
};
exports.updateOnShowList = function (category_id, ads, callback) {

    var args = [redis_key_ad_list + category_id];
    for (var i = 0, len = ads.length; i < len; ++i) {
        args.push(ads[i].order);
        args.push(JSON.stringify(ads[i]));
    }
    cache.del(redis_key_ad_list + category_id, function (e) {
        if (e) {
            return callback(e);
        }
        if(!ads.length){
            return callback(null, 1);
        }
        cache.zadd(args, function (error) {
            if (error) {
                return callback(error);
            }
            callback(null, 1);
        });
    });
};