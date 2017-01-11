var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var async = require('async');
var sequelize = require('../model/connect').sequelize;
var company_stats = require('./stats_company');
var resume_job_rel = require('./resume_job_rel');
var favorite = require('./favorite');
var solr = require("../solr/index").models;

var redis_key_company_cid = "company_cid_";
var redis_key_company_expire = 30 * 24 * 3600;//过期时间1个月


/*exports.search = function (option, cb) {
 if (!option) {
 return cb('no option');
 }
 var key = option.key ? decodeURIComponent(option.key) : '',//关键词
 ct = option.ct,//公司类型
 st = option.st,//公司规模
 cid = option.cid,//公司地址
 //lt = option.lt,
 page = option.page,
 timestamp = option.timestamp,
 sql = "from company left join (select count(*),`company_id` from `job` where state = '1' and deadline > :deadline group by `company_id`)a on a.`company_id` = `company`.`cid` where `company`.`create_time`<= :timestamp";
 if (ct) {
 sql += " and `company`.`type_id` = :ct";
 }
 if (cid) {
 sql += " and `company`.`city_id` = :cid";
 }
 if (st) {
 sql += " and `company`.`scale_type` = :st";
 }
 if (key) {
 if (ct && cid) {
 sql += " and (`company`.`name` like :key or `company`.`full_name` like :key)";
 }
 if (!ct && cid) {
 sql += " and (`company`.`type` like :key  or `company`.`name` like :key or `company`.`full_name` like :key)";
 }
 if (ct && !cid) {
 sql += " and (`company`.`city` like :key or `company`.`name` like :key or `company`.`full_name` like :key)";
 }
 if (!ct && !cid) {
 sql += " and (`company`.`city` like :key or `company`.`type` like :key or `company`.`name` like :key or `company`.`full_name` like :key)";
 }
 }
 var selectSql = "select * " + sql, countSql = "select count(*) " + sql;
 selectSql += " order by `count(*)` desc";
 if (page > 1) {
 selectSql += " limit " + (page - 1) * 10 + ",10";
 } else {
 selectSql += " limit 0,10";
 }
 async.parallel([
 function (callback) {
 sequelize.query(selectSql, {
 replacements: {
 deadline: +new Date,
 timestamp: timestamp,
 ct: ct,
 cid: cid,
 st: st,
 key: '%' + key + '%'
 },
 type: sequelize.QueryTypes.SELECT
 }).then(function (companies) {
 callback(null, companies);
 }).catch(function (err) {
 callback(err);
 });
 }, function (callback) {
 sequelize.query(countSql, {
 replacements: {
 deadline: +new Date,
 timestamp: timestamp,
 ct: ct,
 cid: cid,
 st: st,
 key: '%' + key + '%'
 },
 type: sequelize.QueryTypes.SELECT
 }).then(function (count) {
 callback(null, count[0]['count(*)']);
 }).catch(function (err) {
 callback(err);
 });
 }], function (err, results) {
 if (err) {
 return cb(err);
 }
 cb(null, {
 companies: results[0],
 pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
 page: option.page > 1 ? option.page : 1,
 count: results[1]
 });
 });
 };*/
exports.search = function (option, callback) {
    var key = option.key ? decodeURIComponent(option.key) : '',//关键词
        ct = option.ct,//公司类型
        st = option.st,//公司规模
        cid = option.cid,//公司所在城市
        page = option.page,
        timestamp = option.timestamp;
    solr.company.queryCompany({
        key: key,
        type_id: ct,
        scale_type: st,
        timestamp: timestamp,
        page: page,
        city_id: cid,
        size: 10
    }, function (err, data) {
        callback(err, data);
    });
};


exports.companyDetails = function (uid, cid, isMyCompany, isJobClassify, cb) {
    async.parallel([
        function (callback) {
            findOne(cid, function (err, company) {
                callback(err, company);
            });
        },
        function (callback) {
            solr.job.queryJobsByCompanyId(cid, isJobClassify, function (err, jobs) {
                callback(err, jobs || []);
            });
        },
        function (callback) {
            if (isMyCompany || !uid) {
                return callback(null, 0);
            }
            favorite.isFavorite(uid, 'company', cid, function (err, score) {
                callback(err, score > 1 ? 1 : 0);
            });
        }
    ], function (err, results) {
        if (err) {
            return cb(err);
        }
        var company = results[0];
        var jobs = results[1];
        cb(null, company, jobs, results[2] || 0);
    });
};


function insertCache(cid, company) {
    if (cid > 0) {
        cache.set(redis_key_company_cid + cid, JSON.stringify(company.dataValues), function (err) {
            if (!err) {
                return cache.expire(redis_key_company_cid + cid, redis_key_company_expire);
            }
        });
    }
}

exports.create = function (option, callback) {
    db.company.create(option).then(function (company) {
        insertCache(company.cid, company);
        solr.company.update(company.cid);
        callback(null, company);
    }).catch(function (e) {
        callback(e);
    });
};

exports.update = function (cid, option, callback) {
    db.company.update(option, {
        where: {
            cid: cid
        }
    }).then(function (company) {
        if (company[0]) {
            cache.del(redis_key_company_cid + cid);
        }
        //更新solr职位对应的公司信息
        if (option.type || option.name || option.avatar) {
            solr.job.updateJob(null, cid);
            solr.job.updateDet(null, cid);
        }
        //更新公司信息
        solr.company.update(cid);

        callback(null, company);
    }).catch(function (e) {
        callback(e);
    });
};

function findOne(cid, callback) {
    cache.get(redis_key_company_cid + cid, function (err, camp) {
        if (!err && camp) {
            var rst = JSON.parse(camp);
            return company_stats.getStats(cid, function (e, stats) {
                if (err) {
                    return callback(e);
                }
                if (stats) {
                    for (var i in stats) {
                        rst[i] = stats[i];
                    }
                }
                callback(null, rst);
            });
        }
        db.company.findOne({
            where: {
                cid: cid
            }
        }).then(function (company) {
            if (company) {
                insertCache(cid, company);
                return company_stats.getStats(cid, function (err, stats) {
                    if (!err && stats) {
                        for (var i in stats) {
                            company[i] = stats[i];
                        }
                    }
                    callback(null, company);
                });
            }
            callback(null, {});
        }).catch(function (e1) {
            callback(e1);
        });
    });
}

exports.findOne = findOne;


//查询对应cid的公司部分信息(供收藏列表接口使用)
exports.getListByIds = function (ids, callback) {
    if (!ids || !ids.length) {
        return callback(null, []);
    }
    sequelize.query("select cid,name,type_id,type,city,city_id,title,avatar,scale_type from company where cid in (" + ids.join(',') + ")", {
        type: sequelize.QueryTypes.SELECT
    }).then(function (companies) {
        callback(null, companies);
    }).catch(function (err) {
        callback(err);
    });
};

