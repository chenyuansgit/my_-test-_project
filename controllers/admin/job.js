var logger = require("../../common/log").logger("index");
var sequelize = require('../../model/connect').sequelize;
var proxy = require("../../proxy/index");
var config = require('../../config_default').config;
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');

/**
 * job列表
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    var pageIndex = req.query.page > 1 ? req.query.page : 1;
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var status = req.params.status || req.query.status || 1;
    var lt = req.query.lt;
    var recommend_id = req.params.recommend_id || req.query.recommend_id || 0;
    var pageSize = 10;
    var key = req.query.k;
    var sql = "select a.*, b.`resume_num`, b.`view_num`, b.`resume_treat_percent`,b.`resume_treat_delay`,b.`resume_treat_num`, c.`cid`, c.`name` as `company_name` from `job` a left join `stats_job` b on a.`jid`=b.`jid` left join `company` c on a.`company_id`=c.`cid` where a.create_time <" + timestamp + " and a.`state`=" + status;
    var countSql = "select count(*) as count from job a left join company c on c.cid = a.company_id where  a.create_time < :timestamp and a.`state`= :status";
    if (recommend_id > 0) {
        sql += " and a.`recommend_id`= :recommend_id";
        countSql += " and a.`recommend_id`= :recommend_id";
    }
    if (key) {
        sql += " and (a.`name` like :key or c.`name` like :key)";
        countSql += " and ( a.`name` like :key or c.`name` like :key)";
    }
    async.parallel([
        function (callback) {
            switch (lt) {
                case 'views':
                    sql = sql + " order by b.`view_num` desc limit :offset,:size";
                    break;
                case 'resumes':
                    sql = sql + " order by b.`resume_num` desc limit :offset,:size";
                    break;
                default :
                    sql = sql + " order by a.`refresh_time` desc limit :offset,:size";
                    break;
            }
            sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    recommend_id: recommend_id,
                    timestamp: timestamp,
                    status: status,
                    offset: (pageIndex - 1) * pageSize,
                    size: pageSize,
                    key: "%" + key + "%"
                }
            }).then(function (jobs) {
                callback(null, jobs || []);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            sequelize.query(countSql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    recommend_id: recommend_id,
                    timestamp: timestamp,
                    status: status,
                    key: "%" + key + "%"
                }
            }).then(function (count) {
                callback(null, count[0].count || 0);
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
        if (results[0].length && pageIndex == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.render("recruit/job_list", {
            jobs: results[0],
            count: count,
            page: pageIndex,
            total: total,
            status: status,
            recommend_id: recommend_id,
            env: config.env,
            lt: lt || 'time'
        });
    });
};

/**
 * 删除job
 * @param req
 * @param res
 * @returns {*}
 */
exports.del = function (req, res) {
    var jid = req.params.jid || req.query.jid;
    if (!jid) {
        return res.json(resp_status_builder.build(10002, "invalid cid"));
    }

    proxy.job.del(jid, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });

};
/**
 * 恢复删除job
 * @param req
 * @param res
 * @returns {*}
 */
exports.recover = function (req, res) {
    var jid = req.params.jid || req.query.jid;
    if (!jid) {
        return res.json(resp_status_builder.build(10002, "invalid cid"));
    }

    proxy.job.recover(jid, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });

};
/**
 * 刷新job
 * @param req
 * @param res
 * @returns {*}
 */
exports.refresh = function (req, res) {
    var jid = req.params.jid || req.query.jid;
    if (!jid) {
        return res.json(resp_status_builder.build(10002));
    }

    proxy.job.refreshByAdmin(jid, function (err, rst) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (rst == 1) {
            return res.json(resp_status_builder.build(10013, "refresh times hit limit"));
        }
        if (rst == 2) {
            return res.json(resp_status_builder.build(10006, "job not exists"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });

};

/**
 * 职位推荐
 * @param req
 * @param res
 */
exports.recommend = function (req, res) {
    var jid = req.body.jid;
    var recommend_id = req.body.recommend_id;

    if (!jid || !recommend_id) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.job.recommend(jid, recommend_id, function (err, rows) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (rows && rows[0] > 0) {
            return res.json(resp_status_builder.build(10000));
        }
        res.json(resp_status_builder.build(10006, "job not exists"));
    });
};
/**
 * 职位下线
 * @param req
 * @param res
 */
exports.offline = function (req, res) {
    var jid = req.params.jid;
    if (!jid) {
        return res.json(resp_status_builder.build(10002, "invalid jid"));
    }
    proxy.job.offline(jid, function (err, job) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!job[0]) {
            return res.json(resp_status_builder.build(10006, "job not exists"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
/**
 * 职位上线
 * @param req
 * @param res
 */
exports.online = function (req, res) {
    var jid = req.params.jid, option = req.body.option || {};
    if (!jid || !option.deadline || option.deadline < +new Date) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.job.online(jid, option.deadline, function (err, job) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!job[0]) {
            return res.json(resp_status_builder.build(10006, "job not exists"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
/**
 * 职位推荐取消
 * @param req
 * @param res
 */
exports.recommend_cancel = function (req, res) {
    var jid = req.body.jid || req.params.jid;
    if (!jid) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.job.recommend_cancel(jid, function (err, rows) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (rows && rows[0] > 0) {
            return res.json(resp_status_builder.build(10000));
        }
        res.json(resp_status_builder.build(10006, "job not exists"));
    });
};
