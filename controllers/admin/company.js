var logger = require("../../common/log").logger("index");
var db = require('../../model/index').models;
var proxy = require('../../proxy/index');
var async = require('async');
var des = require('../../common/des');
var company_type = require('../../common/company_type.json');
var sequelize = require('../../model/connect').sequelize;
var config = require('../../config_default').config;
var resp_status_builder = require('../../common/response_status_builder.js');
require('../../common/fn');


/**
 * 公司列表页面
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    var pageIndex = req.params.page || req.query.page || 1;
    var status = req.params.status || req.query.status || 1;
    var key = req.query.k;
    var pageSize = 10;
    if (pageIndex < 0) {
        pageIndex = 1;
    }
    var sql = "select a.*, b.`job_online_num`,b.`resume_treat_percent`, b.`resume_treat_delay`, c.count as deliveries from `company` a left join `stats_company` b on a.`cid`=b.`cid` left join (select job_company_id,count(*) as count from resume_job_rel group by job_company_id) c on c.job_company_id = a.cid where `status`= :status";
    var countSql = "select count(*) as count from company a where a.status = :status";
    if (key) {
        sql += " and a.name like :key";
        countSql += " and a.name like :key";
    }
    sql += " order by `create_time` desc limit :offset,:size";
    async.parallel([
        function (callback) {
            sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    offset: (pageIndex - 1) * pageSize,
                    size: pageSize,
                    status: status,
                    key: "%" + key + "%"
                }
            }).then(function (companys) {
                logger.info(companys);
                callback(null, companys || []);
            }).catch(function (err) {
                callback(err);
            });
        },
        function (callback) {
            sequelize.query(countSql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
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
        res.render("recruit/company/company_list", {
            companies: results[0],
            count: count,
            page: pageIndex,
            total: total,
            status: status,
            flag: 0,
            env: config.env
        });
    });
};
/**
 * 搜索公司
 * @param req
 * @param res
 */
exports.search = function (req, res) {
    sequelize.query("select cid,name,type,avatar from company where name like :key limit 10", {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            key: "%" + req.query.key + "%"
        }
    }).then(function (companies) {
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            company: companies
        }));
    }).catch(function (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10003));
    });
};

/**
 * 屏蔽公司
 * @param req
 * @param res
 */
exports.del = function (req, res) {
    var cid = req.params.cid || req.query.cid;
    if (!cid) {
        return res.json(resp_status_builder.build(10002, "invalid cid"));
    }
    proxy.company.update(cid, {
        status: 9
    }, function (err, rows) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (rows && rows[0] > 0) {
            res.json(resp_status_builder.build(10000));
        } else {
            res.json(resp_status_builder.build(10002, "delete failed, not exists"));
        }
    });
};

/**
 * 恢复公司
 * @param req
 * @param res
 */
exports.recover = function (req, res) {
    var cid = req.params.cid || req.query.cid;
    if (!cid) {
        return res.json(resp_status_builder.build(10002, "invalid cid"));
    }
    proxy.company.update(cid, {
        status: 1
    }, function (err, rows) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (rows && rows[0] > 0) {
            res.json(resp_status_builder.build(10000));
        } else {
            res.json(resp_status_builder.build(10002, "delete failed, not exists"));
        }
    });
};

/**
 * 屏蔽公司及职位
 * @param req
 * @param res
 */
exports.delWithJobs = function (req, res) {
    var cid = req.params.page || req.query.page;
    if (!cid) {
        return res.json(resp_status_builder.build(10002, "invalid cid"));
    }
    var option = {
        status: 9
    };
    proxy.company.update(cid, option, function (err, rows) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!rows || rows[0] <= 0) {
            return res.json(resp_status_builder.build(10002, "delete failed, not exists"));
        } else {
            db.job.findAll({
                where: {
                    cid: cid,
                    state: {$ne: 9}
                }
            }).then(function (jobs) {
                if (jobs && jobs.length > 0) {
                    var job_option = {
                        state: 9
                    };
                    async.forEach(jobs, function (item, callback) {
                        proxy.job.update(job_option, item.jid, item.company_id, item.user_id, function (err, row) {
                            if (err) {
                                callback(err);
                            }
                            callback();
                        });
                    }, function (err) {
                        if (err) {
                            logger.error(err);
                            return res.json(resp_status_builder.build(10003));
                        }
                        res.json(resp_status_builder.build(10000));
                    });
                }
            }).catch(function (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            });
        }
    });
};


/**
 * 更新公司信息
 * @param req
 * @param res
 */
exports.updateInfo = function (req, res) {
    var cid = req.params.cid;
    var option = req.body.option || {};
    var black = ['cid', 'authenticated', 'create_time', 'last_login_time'];
    for (var i = 0, len = black.length; i < len; ++i) {
        if (typeof option[black[i]] !== 'undefined') delete option[black[i]];
    }
    proxy.company.update(cid, option, function (err, com) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!com[0]) {
            return res.json(resp_status_builder.build(10006, "no this company or phone,email validate error"));
        }
        res.json(resp_status_builder.build(10000, +new Date - req.start_time));

    });
};

/**
 * 公司信息修改页
 * @param req
 * @param res
 */
exports.updateInfoPage = function (req, res) {
    var cid = req.params.cid;
    proxy.company.findOne(cid, function (err, company) {
        if (err) {
            logger.error(err);
        }
        res.render("recruit/company/edit", {
            company: company || {}
        });
    });
};