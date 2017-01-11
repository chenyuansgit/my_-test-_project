var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');
var loginStatusValidate = require("../../middlewares/login").loginStatusValidate;
var company_type = require('../../common/company_type.json');

//获取单个公司的收藏情况
exports.getStatus = function (req, res) {
    var cid = req.params.cid, uid = req.headers['uid'], auth_token = req.headers['auth_token'];
    if (!cid) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    loginStatusValidate(uid, auth_token, function (code) {
        async.parallel([function (callback) {
            if (code) {
                return callback(null, 0);
            }
            proxy.favorite.isFavorite(uid, 'company', cid, function (e, score) {
                callback(e, score >= 1 ? 1 : 0);
            });
        }, function (callback) {
            proxy.company.findOne(cid, function (e, company) {
                if (e || !company) {
                    return callback(e, null);
                }
                callback(null, {
                    cid: cid,
                    name: company.name,
                    avatar: company.avatar,
                    title: company.title,
                    job_online_num: company.job_online_num
                });
            });
        }], function (err, results) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10005, '服务器错误'));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                isFavorite: results[0],
                company: results[1]
            }));
        });
    });
};
exports.search = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    var option = {
        ct: req.query.ct,
        st: req.query.st || 0,
        cid: req.query.cid,
        k: req.query.k
    };
    proxy.company.search({
        key: option.k,//关键词
        ct: req.query.ct,//公司类型
        st: req.query.st,//公司规模
        cid: req.query.cid,//公司地址
        timestamp: timestamp,
        page: page//页数,默认为1
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (data.companies.length && page == 1) {
            data.timestamp = timestamp;
        }
        data.option = option;
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};


exports.getCompanyType = function (req, res) {
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
        company_type: company_type
    }));
};