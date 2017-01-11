var solr = require("./solr").client;
var logger = require("../common/log").logger("index");
var sequelize = require('../model/connect').sequelize;
var async = require('async');

var INTERN_CHANNEL_TYPE = 1;//普通实习
var INTERN_DET_CHANNEL_TYPE = 2;//普通实习包打听
//var CAMPUS_RECRUIT_CHANNEL_TYPE = 3;//校招
//var CAMPUS_RECRUIT_DET_CHANNEL_TYPE = 4;//校招包打听


//根据jid或者cid更新solr职位
exports.updateJob = function (jid, cid) {
    var sql = "SELECT a.state,a.jid,a.type,a.type_id,a.parent_type,a.parent_type_id, a.name,a.channel_type,a.min_payment,a.max_payment,a.workdays,a.regular,a.city,a.city_id,a.education,a.company_id,a.user_id,a.refresh_time,b.`name` AS `company_name`, b.`type` AS `company_type`, b.`avatar` AS `company_avatar` FROM `job` a, `company` b WHERE  a.`company_id` = b.`cid` AND";
    if (jid) {
        sql += "  a.`jid` = " + jid;
    } else {
        sql += "  a.`company_id` = " + cid;
    }
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            timestamp: +new Date
        }
    }).then(function (jobs) {
        if (jobs && jobs.length) {
            for (var i = 0, len = jobs.length; i < len; ++i) {
                //填充信息
                jobs[i].regular = jobs[i].regular || 0;
                jobs[i].channel_type = jobs[i].channel_type || INTERN_CHANNEL_TYPE;
                jobs[i].primary_key = jobs[i].jid + "-" + jobs[i].channel_type;
                if (jobs[i].city_id) {
                    jobs[i].city_id = jobs[i].city_id.toString().split(',');
                }else{
                    jobs[i].city_id = [0];
                }
                console.log('jobbbbbbbbbbbb:', jobs[i]);
                console.log('jobbbbbbbbbbbb:', jobs[i].state);
                if (jobs[i].state == 1) {
                    delete jobs[i].state;
                    console.log('adddddd');
                    addOrUpdate(jobs[i]);
                } else {
                    deleteJobById(jobs[i].jid, jobs[i].channel_type);
                }
            }
        }
    }).catch(function (err) {
        logger.error(err);
    });
};


exports.updateDet = function (det_id, cid) {
    var sql = "SELECT id as jid,state,type,type_id,parent_type,parent_type_id,name,channel_type,min_payment,max_payment,workdays,regular,city,city_id,education,refresh_time,company_name,company_avatar,company_type,company_id from detective_job where ";
    if (det_id) {
        sql += " id = :det_id";
    } else {
        sql += " company_id = :cid";
    }
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            det_id: det_id,
            cid: cid
        }
    }).then(function (dets) {
        if (dets && dets.length) {
            for (var i = 0, len = dets.length; i < len; ++i) {
                //填充信息
                dets[i].user_id = 0;
                dets[i].company_id = dets[i].company_id || 0;
                dets[i].company_type = dets[i].company_type || '';
                dets[i].channel_type = dets[i].channel_type || INTERN_DET_CHANNEL_TYPE;
                dets[i].primary_key = dets[i].jid + "-" + dets[i].channel_type;
                if (dets[i].city_id) {
                    dets[i].city_id = dets[i].city_id.toString().split(',');
                }else{
                    dets[i].city_id = [0];
                }
                if (dets[i].state == 1) {
                    delete dets[i].state;
                    addOrUpdate(dets[i]);
                } else {
                    deleteJobById(dets[i].jid, dets[i].channel_type);
                }
            }
        }
    }).catch(function (err) {
        logger.error(err);
    });
};

exports.addOrUpdate = addOrUpdate;

function addOrUpdate(jobs) {
    solr.job.add(jobs, function (err, obj) {
        if (err) {
            logger.error(err);
        } else {
            logger.info(obj);
        }
    });
}

exports.deleteJobById = deleteJobById;

function deleteJobById(jid, channel_type) {
    solr.job.deleteByID(jid + '-' + channel_type, function (err, obj) {
        if (err) {
            logger.error(err);
        } else {
            logger.info(obj);
        }
    });
}

/**
 * 职位搜索
 * @param page_index
 * @param page_size
 * @param key
 * @param city_id
 * @param type_id
 * @param min_payment
 * @param workdays
 * @param education
 * @param sort
 * @param timestamp
 * @param callback
 */
exports.queryJobs = function (page_index, page_size, key, city_id, type_id, min_payment, workdays, education, regular, channel_type, sort, timestamp, callback) {
    var q = key ? decodeURIComponent(key) : "*";

    if (page_index > 3000) {
        page_index = 1;
    }
    var sort_obj = {};
    if (sort == "time") {
        sort_obj.refresh_time = "desc";
    }
    if (min_payment && min_payment > 0) {
        sort_obj.min_payment = "asc";
    }
    var query = solr.job.createQuery()
        .q(q)
        .start((page_index - 1) * page_size)
        .rows(page_size)
        .df("key")
        .qop("AND")
        .sort(sort_obj);
    if (sort == "time") {
        query.matchFilter("refresh_time", "[0 TO " + timestamp + "]");
    }
    if (min_payment && min_payment > 0) {
        if (min_payment > 10000) {
            query.matchFilter("min_payment", "[" + min_payment + " TO 1000000]");
        } else {
            query.matchFilter("min_payment", "[" + min_payment + " TO 10000]");
        }
    }
    if (city_id && city_id > 0) {
        query.matchFilter("city_id", "(" + city_id + " OR 0)");
    }
    if (type_id && type_id > 0) {
        query.matchFilter("type_id", type_id);
    }
    if (workdays && workdays > 0 && workdays <= 7) {
        query.matchFilter("workdays", "[0 TO " + workdays + "]");
    }
    if (education && education > 0 && education <= 4) {
        query.matchFilter("education", "[0 TO " + education + "]");
    }
    if (regular >= 1) {
        query.matchFilter("regular", 1);
    }
    if (channel_type) {
        query.matchFilter("channel_type", "(" + channel_type.replace(/,/g, ' OR ') + ")");
    }
    solr.job.search(query, function (err, jobs) {
        if (err) {
            logger.error(err);
        } else {
            var data = {
                jobs: jobs.response.docs,
                count: jobs.response.numFound,
                page: page_index > 1 ? page_index : 1,
                pages: jobs.response.numFound % 10 == 0 ? jobs.response.numFound / 10 : (parseInt(jobs.response.numFound / 10) + 1)
            };
            callback(err, data);
        }
    });
};


//查看公司的在招职位
exports.queryJobsByCompanyId = function (company_id, isJobClassify, callback) {
    var query = solr.job.createQuery()
        .q("*")
        /*        .group({
         on: true,
         field: 'parent_type_id'
         })*/
        .start(0)
        .rows(1000)
        .df("key")
        .qop("AND")
        .sort({refresh_time: "desc"});
    query.matchFilter("company_id", company_id);
    if (isJobClassify) {
        async.parallel([
            function (callback) {
                query.matchFilter("channel_type", "(1 OR 2)");
                solr.job.search(query, function (err, jobs) {
                    //console.log(jobs.grouped.parent_type_id.groups);
                    if (err) {
                        logger.error(err);
                    }
                    callback(err, jobs && jobs.response && jobs.response.docs ? jobs.response.docs : []);
                });
            },
            function (callback) {
                var query_2 = solr.job.createQuery()
                    .q("*")
                    /*        .group({
                     on: true,
                     field: 'parent_type_id'
                     })*/
                    .start(0)
                    .rows(1000)
                    .df("key")
                    .qop("AND")
                    .sort({refresh_time: "desc"});
                query_2.matchFilter("company_id", company_id);
                query_2.matchFilter("channel_type", "(3 OR 4)");
                solr.job.search(query_2, function (err, jobs) {
                    //console.log(jobs.grouped.parent_type_id.groups);
                    if (err) {
                        logger.error(err);
                    }
                    callback(err, jobs && jobs.response && jobs.response.docs ? jobs.response.docs : []);
                });
            }
        ], function (err, results) {
            if (err) {
                return callback(err);
            }
            var query_jobs = {};
            query_jobs.intern = results[0];
            query_jobs.campus = results[1];
            return callback(err, query_jobs);
        });
    } else {
        solr.job.search(query, function (err, jobs) {
            //console.log(jobs.grouped.parent_type_id.groups);
            if (err) {
                logger.error(err);
            }
            callback(err, jobs && jobs.response && jobs.response.docs ? jobs.response.docs : []);
        });
    }
};

/**
 * 按推荐id查询
 * @param pageIndex
 * @param pageSize
 * @param recommendId
 * @param timestamp
 * @param callback
 */
exports.queryJobsByRecommend = function (pageIndex, pageSize, recommendId, timestamp, callback) {
    var query = solr.job.createQuery()
        .q("*")
        .start((pageIndex - 1) * pageSize)
        .rows(pageSize)
        .df("key")
        .qop("AND")
        .sort({refresh_time: "desc"})
        .matchFilter("refresh_time", "[0 TO " + timestamp + "]");

    solr.job.search(query, function (err, jobs) {
        if (err) {
            logger.error(err);
        } else {
            var data = {
                jobs: jobs.response.docs,
                count: jobs.response.numFound,
                page: pageIndex > 1 ? pageIndex : 1,
                pages: jobs.response.numFound % 10 == 0 ? jobs.response.numFound / 10 : (parseInt(jobs.response.numFound / 10) + 1),
                recommend_id: recommendId
            };
            callback(err, data);
        }
    });
};

/**
 * 搜索意见
 * @param key
 * @param callback
 */
exports.suggest = function (key, callback) {
    solr.job.get('suggest', 'q=' + encodeURI(key), function (err, data) {
        if (err) {
            logger.error(err);
            return callback(err);
        }
        if (!data) {
            return callback(null, []);
        }
        var e = null, rst = [];
        try {
            if (data.spellcheck && data.spellcheck.suggestions && data.spellcheck.suggestions[1]) {
                rst = data.spellcheck.suggestions[1].suggestion;
            }
        } catch (e1) {
            e = e1;
            logger.error(e);
        }
        callback(null, rst);
    });
};

