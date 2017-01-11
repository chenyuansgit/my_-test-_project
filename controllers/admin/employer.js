var logger = require("../../common/log").logger("index");
var async = require('async');
var sequelize = require('../../model/connect').sequelize;
var config = require('../../config_default').config;
var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');


exports.list = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var lt = req.query.lt, key = req.query.k;
    var sql = "select a.*,b.cid,b.name as company_name,c.count,d.invites from employer a left join company b on a.company_id = b.cid left join (select job_user_id,count(*) as count from resume_job_rel where status > 1 group by job_user_id)c on a.user_id = c.job_user_id left join (select employer_user_id,count(*) as invites from quick_recruit_invite group by employer_user_id) d on a.user_id = d.employer_user_id where a.create_time < :timestamp";
    if (key) {
        sql += " and b.name like :key";
    }
    switch (lt) {
        case 'deals':
            sql += " order by c.count desc limit :offset,10";
            break;
        case 'invites':
            sql += " order by d.invites desc limit :offset,10";
            break;
        default:
            sql += " order by a.create_time desc limit :offset,10";
            break;
    }
    var countSql = "select count(*) as count from employer a left join company b on a.company_id = b.cid where a.create_time < :timestamp";
    if (key) {
        countSql += " and b.name like :key";
    }
    async.parallel([
        function (callback) {
            sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: now_time,
                    key: "%" + key + "%",
                    offset: (page - 1) * 10
                }
            }).then(function (employers) {
                callback(null, employers);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            sequelize.query(countSql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: now_time,
                    key: "%" + key + "%"
                }
            }).then(function (count) {
                callback(null, count[0].count);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (e, results) {
        var employers = results[0] || [], count = results[1] || 0;
        if (e) {
            logger.error(e);
        }
        if (employers.length && (page == 1)) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.render('recruit/employer_list', {
            employers: employers,
            page: page,
            total: count % 10 == 0 ? count / 10 : (parseInt(count / 10) + 1),
            env: config.env
        });
    });
};
exports.unvalidatedList = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    async.parallel([
        function (callback) {
            sequelize.query("select * from employer where create_time < :timestamp and enterprise_email_validated = 0 order by create_time desc limit :offset,10", {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: now_time,
                    offset: (page - 1) * 10
                }
            }).then(function (employers) {
                callback(null, employers);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            sequelize.query("select count(*) as count from employer where create_time < :timestamp and enterprise_email_validated = 0", {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: now_time
                }
            }).then(function (count) {
                callback(null, count[0].count);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (e, results) {
        var employers = results[0] || [], count = results[1] || 0;
        if (e) {
            logger.error(e);
        }
        if (employers.length && (page == 1)) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.render('recruit/unvalidated_employer_list', {
            employers: employers,
            page: page,
            total: count % 10 == 0 ? count / 10 : (parseInt(count / 10) + 1),
            env: config.env
        });
    });
};

//手动开通企业邮箱

exports.validated = function (req, res) {
    var uid = req.params.uid;
    if (!uid) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.employer.updateOneById(uid, {enterprise_email_validated: 1}, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};