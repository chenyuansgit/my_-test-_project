var async = require('async');
var sequelize = require('../model/connect').sequelize;
var db = require('../model/index').models;
var solr = require("../solr/index").models;
var cache = require('../cache/index').cache;
var stats_company = require('./stats_company');

var redis_key_det = "det_";
var redis_key_det_expire = 3600 * 24 * 30;//过期时间一个月

function inertCache(det, callback) {
    cache.set(redis_key_det + det.id, JSON.stringify(det), function (err) {
        if (!err) {
            cache.expire(redis_key_det + det.id, redis_key_det_expire);
        }
        callback && callback(err);
    });
}

function delCache(id, callback) {
    cache.del(redis_key_det + id, function (err) {
        callback && callback(err);
    });
}

exports.delCache = delCache;

function getCache(id, callback) {
    cache.get(redis_key_det + id, function (err, det) {
        if (!err && det) {
            return callback(null, JSON.parse(det));
        }
        callback(err, null);
    });
}


exports.create = function (option, callback) {
    db.det.create(option).then(function (det) {
        if (det && det.dataValues) {
            inertCache(det.dataValues);
            solr.job.updateDet(det.id);
            if (option.company_id) {
                solr.company.update(option.company_id);
                stats_company.lpush(option.company_id);
            }
            return callback(null, det.dataValues);
        }
        callback(null, {});
    }).catch(function (e) {
        callback(e);
    });
};

exports.updateOneById = function (option, id, callback) {
    db.det.update(option, {
        where: {
            id: id
        }
    }).then(function (rows) {
        solr.job.updateDet(id);
        delCache(id);
        if (option.company_id || option.state) {
            findOneById(id, function (err, det) {
                if (!err && det) {
                    solr.company.update(det.company_id);
                    stats_company.lpush(det.company_id);
                }
            });
        }
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

exports.findOneById = findOneById;

function findOneById(id, callback) {
    getCache(id, function (e, det) {
        if (!e && det) {
            return callback(null, det);
        }
        db.det.findOne({
            where: {
                id: id
            }
        }).then(function (det) {
            if (det && det.dataValues) {
                inertCache(det.dataValues);
                return callback(null, det.dataValues);
            }
            callback(null, {});
        }).catch(function (e) {
            callback(e);
        });
    });
}

//mysql搜索(供后台查询)
exports.list = function (option, callback) {
    var timestamp = option.timestamp, page = option.page, key = option.key, cid = option.cid, state = option.state || 1, lt = option.lt || "";
    var channel_type = option.channel_type || 0;
    var pageSize = 10;
    var sql = "from detective_job a left join stats_det b on a.id = b.det_id where a.create_time < :timestamp";
    var countSql = "select count(*) as count from detective_job where create_time < :timestamp";
    if (cid > 0) {
        sql += " and city_id = :cid";
        countSql += " and city_id = :cid";
    }
    if (state) {
        sql += " and state = :state";
        countSql += " and state = :state";
    }
    if (key) {
        sql += " and (name like :key or company_name like :key) ";
        countSql += " and state = :state";
    }
    if (channel_type) {
        sql += " and a.channel_type in (" + channel_type + ") ";
        countSql += " and channel_type in ("+ channel_type +") ";
    }
    switch (lt) {
        case 'views':
            sql = sql + " order by b.`view_num` desc limit :offset,:size";
            break;
        case 'resumes':
            sql = sql + " order by b.`resume_num` desc limit :offset,:size";
            break;
        default :
            sql = sql + " order by a.`create_time` desc limit :offset,:size";
            break;
    }
    async.parallel([
        function (_callback) {

            sequelize.query("select a.*,b.view_num,b.resume_num,b.resume_check_num " + sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    key: '%' + key + '%',
                    cid: cid,
                    state: state,
                    offset: (page - 1) * 10,
                    size: pageSize
                }
            }).then(function (det_reports) {
                _callback(null, det_reports);
            }).catch(function (e) {
                _callback(e);
            });
        }, function (_callback) {
            sequelize.query(countSql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    key: '%' + key + '%',
                    cid: cid,
                    state: state
                }
            }).then(function (count) {
                _callback(null, count[0].count);
            }).catch(function (e) {
                _callback(e);
            });
        }
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            dets: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: page,
            count: results[1]
        });
    });
};

exports.getListByIds = function (ids, callback) {
    if (!ids || !ids.length) {
        return callback(null, []);
    }
    sequelize.query("SELECT id as jid,redirect_uri,state,type,type_id,parent_type,parent_type_id,name,min_payment,max_payment,workdays,channel_type,regular,city,city_id,education,refresh_time,company_name,company_avatar,company_id,company_type from detective_job where id  in (" + ids.join(',') + ")", {
        type: sequelize.QueryTypes.SELECT
    }).then(function (dets) {
        callback(null, dets);
    }).catch(function (err) {
        callback(err);
    });
};






