var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');
var solr = require("../../solr/index").models;
var loginStatusValidate = require("../../middlewares/login").loginStatusValidate;
var job_type = require('../../common/job_type');
var hotWords = require('../../common/hotWords');
var id_reg = require("../../common/utils/reg").number;

//获取单个职位的投递收藏情况
exports.getStatus = function (req, res) {
    var jid = req.params.jid, uid = req.headers['uid'], auth_token = req.headers['auth_token'], jobDetail;
    if (!id_reg.test(jid)) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    loginStatusValidate(uid, auth_token, function (code) {
        async.parallel([
            function (callback) {
                if (code) {
                    return callback(null, 0);
                }
                proxy.resume_job_rel.getOneByOption({
                    job_id: jid,
                    resume_user_id: uid
                }, function (e, resume_job_rel) {
                    callback(null, resume_job_rel ? 1 : 0);
                });
            }, function (callback) {
                if (code) {
                    return callback(null, 0);
                }
                proxy.favorite.isFavorite(uid, 'job', jid, function (e, score) {
                    callback(e, score >= 1 ? 1 : 0);
                });
            }, function (callback) {
                proxy.job.findOneById(jid, function (e, job) {
                    if (e || !job) {
                        return callback(e, null);
                    }
                    jobDetail = {
                        jid: job.jid,
                        state: job.state,
                        name: job.name,
                        user_id: job.user_id,
                        company_id: job.company_id,
                        address: job.address,
                        remarks: job.remarks
                    };
                    proxy.company.findOne(job.company_id, function (e1, company) {
                        jobDetail.company_name = company && company.name ? company.name : '';
                        jobDetail.company_avatar = company && company.avatar ? company.avatar : '';
                        callback(null, jobDetail);
                    });
                });
            }
        ], function (err, results) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10005, '服务器错误'));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                isDelivered: results[0],
                isFavorite: results[1],
                job: results[2]
            }));
        });
    });
};


//mysql查询
exports.allList = function (req, res) {
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    var option = {
        pt: req.query.pt >= 1 && req.query.pt <= 5 ? req.query.pt : 0,
        wk: req.query.wk >= 1 && req.query.wk <= 7 ? req.query.wk : 0,
        lt: req.query.lt ? req.query.lt : 'time',
        et: req.query.et >= 1 && req.query.et <= 4 ? req.query.et : 0,
        jt: req.query.jt || 0,
        cid: req.query.cid || 0,
        k: req.query.k,
        rec: req.query.rec,
        page: req.query.page > 1 ? req.query.page : 1,
        timestamp: timestamp
    };
    proxy.job.search(option, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003, '服务器错误'));
        }
        if (data.jobs.length && (!req.query.page || req.query.page <= 1)) {
            data.timestamp = timestamp;
        }
        data.option = option;
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};

//solr查询
exports.jobSearch = function (req, res) {
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    var option = {
        pt: req.query.pt >= 1 && req.query.pt <= 5 ? req.query.pt : 0,
        wk: req.query.wk >= 1 && req.query.wk <= 7 ? req.query.wk : 0,
        lt: req.query.lt ? req.query.lt : 'hot',
        et: req.query.et >= 1 && req.query.et <= 4 ? req.query.et : 0,
        jt: req.query.jt || 0,
        cid: req.query.cid || 0,
        k: req.query.k
    };
    solr.job.queryJobs(req.query.page > 1 ? req.query.page : 1, // 页数
        10, // 每页数量
        option.k, // 关键词
        option.cid, // 城市id
        option.jt, // 职位类型id
        getPayment(option.pt), // 最低薪水
        option.wk, // 每周工作天数
        option.et, //学历要求的类型
        0,//是否转正
        1,//来源类型,普通职位或者包打听
        option.lt, // 指定排序字段名
        timestamp,
        function (err, data) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003, '服务器错误'));
            }
            if (data.jobs.length && (!req.query.page || req.query.page <= 1)) {
                data.timestamp = timestamp;
            }
            data.option = option;
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
        }
    );

};
//搜索关键词提示
exports.searchSuggest = function (req, res) {
    var key = req.query.key;
    if (!key) {
        return res.json(resp_status_builder.build(10002));
    }
    solr.job.suggest(key, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            suggestion: data
        }));
    });
};


//获取职位类型
exports.getJobType = function (req, res) {
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {job_type: job_type}));
};

exports.getHotWords = function (req, res) {
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {hotWords: hotWords}));
};


function getPayment(payment_type) {
    var min_payment = 0;
    payment_type = parseInt(payment_type);
    switch (payment_type) {
        case 1:
            min_payment = 0;
            break;
        case 2:
            min_payment = 50;
            break;
        case 3:
            min_payment = 100;
            break;
        case 4:
            min_payment = 200;
            break;
        case 5:
            min_payment = 500;
            break;
        default:
            min_payment = 0;
    }
    return min_payment;
}