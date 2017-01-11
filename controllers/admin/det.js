var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var async = require('async');
var sequelize = require('../../model/connect').sequelize;
var reg = require('../../common/utils/reg');

require('../../common/fn');


var email_reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;


function checkEmail(email, callback) {
    if (!email_reg.test(email)) {
        return callback(null, null);
    }
    proxy.employer.getOneByOption({
        enterprise_email: email
    }, function (err, employer) {
        callback(err, employer ? 0 : 1);
    });
}

exports.checkEmail = function (req, res) {
    var option = req.body.option || {}, email = option.email;
    checkEmail(email, function (err, ok) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!ok) {
            return res.json(resp_status_builder.build(10002));
        }
        res.json(resp_status_builder.build(10000));
    });
};

exports.list = function (req, res) {
    var page = req.query.page > 1 ? req.query.page : 1,
        state = req.query.state || 1,
        lt = req.query.lt || "",
        now_time = +new Date,
        timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time,
        key = req.query.k || "";
        channel_type = req.query.ct || 0;

    proxy.det.list({
        channel_type:channel_type,
        page: page,
        timestamp: timestamp,
        state: state,
        key: key,
        lt: lt
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.dets && data.dets.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.state = state;
        data.total = data.pages;
        data.keyword = key;
        res.render("det/list", data);
    });
};
exports.search = function (req, res) {
    sequelize.query("select name,company_id,company_name,company_avatar,company_type from detective_job where name like :key limit 10", {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            key: "%" + req.query.key + "%"
        }
    }).then(function (jobs) {
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            jobs: jobs
        }));
    }).catch(function (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10003));
    });
};
/**
 * 搜索公司
 * @param req
 * @param res
 */
exports.companySearch = function (req, res) {
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


exports.addPage = function (req, res) {
    res.render('det/add');
};

exports.add = function (req, res) {
    var option = req.body.option || {};
    option.channel_type = option.channel_type == 2 || option.channel_type == 4 ? option.channel_type : 2;
    if (option.channel_type == 2 && option.redirect_uri) {
        return res.json(resp_status_builder.build(10002));
    }
    if (option.channel_type == 4 && option.redirect_uri && !reg.url.test(option.redirect_uri)) {
        return res.json(resp_status_builder.build(10002));
    }
    async.waterfall([
        function (callback) {
            if (!option.notice_email && option.channel_type == 4) {
                return callback(null, 1);
            }
            checkEmail(option.notice_email, function (e, ok) {
                callback(e, ok);
            });
        },
        function (ok, callback) {
            if (!option.company_id) {
                return callback(null, [ok]);
            }
            proxy.company.findOne(option.company_id, function (e, company) {
                callback(e, [ok, company.type]);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (!results[0]) {
            return res.json(resp_status_builder.build(10006, '邮箱已存在在验证企业用户中'));
        }
        if (results[1]) {
            option.company_type = results[1];
        }
        option.create_time = option.update_time = option.refresh_time = +new Date;
        proxy.det.create(option, function (error) {
            if (error) {
                logger.error(error);
                return res.json(resp_status_builder.build(10003));
            }
            res.json(resp_status_builder.build(10000));
        });
    });
};

exports.editPage = function (req, res) {
    var id = req.params.det_id;
    if (!id) {
        return res.json(resp_status_builder.build(10002, "invalid id"));
    }
    proxy.det.findOneById(id, function (err, det) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!det) {
            return res.json(resp_status_builder.build(10006, "det not exists"));
        }
        res.render('det/edit', {
            det: det
        });
    });
};

exports.edit = function (req, res) {
    var id = req.params.det_id, option = req.body.option || {};
    option.channel_type = option.channel_type == 2 || option.channel_type == 4 ? option.channel_type : 2;
    if (option.channel_type == 2 && option.redirect_uri) {
        return res.json(resp_status_builder.build(10002));
    }
    if (option.channel_type == 4 && option.redirect_uri && !reg.url.test(option.redirect_uri)) {
        return res.json(resp_status_builder.build(10002));
    }
    async.waterfall([
        function (callback) {
            if (!option.notice_email) {
                delete option.notice_email;
                return callback(null, 1);
            }
            checkEmail(option.notice_email, function (e, ok) {
                callback(e, ok);
            });
        },
        function (ok, callback) {
            if (!option.company_id) {
                return callback(null, [ok]);
            }
            proxy.company.findOne(option.company_id, function (e, company) {
                callback(e, [ok, company.type]);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (!results[0]) {
            return res.json(resp_status_builder.build(10006, '邮箱已存在在验证企业用户中'));
        }
        if (results[1]) {
            option.company_type = results[1];
        }
        option.update_time = +new Date;
        proxy.det.updateOneById(option, id, function (error, row) {
            if (error) {
                logger.error(error);
                return res.json(resp_status_builder.build(10003));
            }
            if (!row || !row[0] || row[0] <= 0) {
                return res.json(resp_status_builder.build(10006, "det not exists"));
            }
            res.json(resp_status_builder.build(10000));
        });
    });
};

/**
 * 上线
 * @param req
 * @param res
 */
exports.online = function (req, res) {
    var id = req.params.det_id;
    var option = {
        state: 1,
        update_time: +new Date
    };
    proxy.det.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "det not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};
/**
 * 下线
 * @param req
 * @param res
 */
exports.offline = function (req, res) {
    var id = req.params.det_id;
    var option = {
        state: 2,
        update_time: +new Date
    };
    proxy.det.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "det not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};

/**
 * 刷新
 * @param req
 * @param res
 */
exports.refresh = function (req, res) {
    var id = req.params.det_id;
    var option = {
        refresh_time: +new Date,
        update_time: +new Date
    };
    proxy.det.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "det not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};


exports.del = function (req, res) {
    var id = req.params.det_id;
    var option = {
        state: 9,
        update_time: +new Date
    };
    proxy.det.updateOneById(option, id, function (err, row) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!row || !row[0] || row[0] <= 0) {
            return res.json(resp_status_builder.build(10006, "det not exists"));
        }
        res.json(resp_status_builder.build(10000));
    });
};

