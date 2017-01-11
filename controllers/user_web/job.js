var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var async = require('async');
var hotCity = require('../../common/hot_city.json');
var resp_status_builder = require('../../common/response_status_builder.js');
var solr = require("../../solr/index").models;

var id_reg = require("../../common/utils/reg").number;

//job信息页面展示
exports.detailPage = function (req, res) {
    var jid = req.params.jid, uid = res.locals.uid;
    if(!id_reg.test(jid)){//参数错误
        return res.render('error/404');
    }
    proxy.job.singleJobDisplay(jid, uid, function (err, job, company, employer, isDelivered, isFavorite) {
        if (err) {
            logger.error(err);
            return res.render("position", {
                job: {},
                company: {},
                employer: {},
                isDelivered: 0,
                isFavorite: 0
            });
        }
        if (employer.user_id && employer.company_id == job.company_id) {
            return res.redirect("http://" + res.locals.host.hr + '/job/detail/' + jid);
        }
        res.render("position", {
            job: job,
            company: company,
            employer: employer,
            isDelivered: isDelivered,
            isFavorite: isFavorite
        });
    });
};

/**
 * job搜索
 * @param req
 * @param res
 */
exports.search = function (req, res) {
    var type = req.query.type || '';
    if (type == "campus") {
        return campusSearch(req, res);
    }
    return internSearch(req, res);
};

function internSearch(req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        pt: req.query.pt >= 1 && req.query.pt <= 5 ? req.query.pt : 0,
        wk: req.query.wk >= 1 && req.query.wk <= 7 ? req.query.wk : 0,
        lt: req.query.lt ? req.query.lt : 'time',
        et: req.query.et >= 1 && req.query.et <= 4 ? req.query.et : 0,
        jt: req.query.jt || 0,
        cid: req.query.cid || 0,
        k: req.query.k,
        reg: req.query.reg,
        ct: "1,2"
    };
    var page_size = 10;
    async.parallel([function (callback) {
        proxy.ad.findOnShowList(3, function (e, ads) {
            callback(e, ads);
        });
    }, function (callback) {
        solr.job.queryJobs(page, // 页数
            page_size, // 每页数量
            option.k, //关键词
            option.cid, // 城市id
            option.jt, // 职位类型id
            getPayment(option.pt, "intern"), // 最低薪水
            option.wk, // 每周工作天数
            option.et, //学历要求的类型
            option.reg,//是否转正
            option.ct,//来源类型,普通职位或者包打听
            option.lt, // 指定排序字段名
            timestamp,
            function (e, data) {
                callback(e, data);
            }
        );
    }], function (error, results) {
        var data = results[1] || {}, ads = results[0] || [];
        if (error) {
            logger.error(error);
            return res.render('internSearch', {
                jobs: [],
                option: option,
                hotCity: hotCity,
                pages: 0,
                page: page,
                count: 0,
                ads: ads
            });
        }
        if (data.jobs.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.option = option;
        data.hotCity = hotCity;
        data.ads = ads;
        res.render('internSearch', data);
    });
}
function campusSearch(req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        pt: req.query.pt >= 1 && req.query.pt <= 5 ? req.query.pt : 0,
        wk: req.query.wk >= 1 && req.query.wk <= 7 ? req.query.wk : 0,
        lt: req.query.lt ? req.query.lt : 'time',
        et: req.query.et >= 1 && req.query.et <= 4 ? req.query.et : 0,
        jt: req.query.jt || 0,
        cid: req.query.cid || 0,
        k: req.query.k,
        reg: req.query.reg,
        ct: "3,4"
    };
    var page_size = 10;
    async.parallel([function (callback) {
        proxy.ad.findOnShowList(6, function (e, ads) {
            callback(e, ads);
        });
    }, function (callback) {
        solr.job.queryJobs(page, // 页数
            page_size, // 每页数量
            option.k, //关键词
            option.cid, // 城市id
            option.jt, // 职位类型id
            getPayment(option.pt, "campus"), // 最低薪水
            option.wk, // 每周工作天数
            option.et, //学历要求的类型
            option.reg,//是否转正
            option.ct,//来源类型,普通职位或者包打听
            option.lt, // 指定排序字段名
            timestamp,
            function (e, data) {
                callback(e, data);
            }
        );
    }], function (error, results) {
        var data = results[1] || {}, ads = results[0] || [];
        if (error) {
            logger.error(error);
            return res.render('campusSearch', {
                jobs: [],
                option: option,
                hotCity: hotCity,
                pages: 0,
                page: page,
                count: 0,
                ads: ads
            });
        }
        if (data.jobs.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.option = option;
        data.hotCity = hotCity;
        data.ads = ads;
        res.render('campusSearch', data);
    });
}

function getPayment(payment_type, channel_type) {
    var min_payment = 0;
    payment_type = parseInt(payment_type);
    if (channel_type == "campus") {
        switch (payment_type) {
            case 1:
                min_payment = 0;
                break;
            case 2:
                min_payment = 30000;
                break;
            case 3:
                min_payment = 60000;
                break;
            case 4:
                min_payment = 100000;
                break;
            case 5:
                min_payment = 200000;
                break;
            default:
                min_payment = 0;
        }
    } else {
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
    }
    return min_payment;
}

exports.searchSuggest = function (req, res) {
    var key = req.query.key;
    if (!key) {
        return res.json([]);
    }
    solr.job.suggest(key, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};

