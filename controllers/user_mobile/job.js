var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');
var solr = require("../../solr/index").models;
var hotWords = require("../../common/hotWords");
var job_type = require("../../common/job_type.json");
var city = require("../../common/city.json");
var id_reg = require("../../common/utils/reg").number;


//job信息页面展示
exports.singleJobRender = function (req, res) {
    var jid = req.params.jid, uid = res.locals.uid;
    if (!id_reg.test(jid)) {
        return res.render('error/404');
    }
    proxy.job.singleJobDisplay(jid, (uid || 0), function (err, job, company, employer, isDelivered) {
        if (err) {
            logger.error(err);
            return res.render('error/404');
        }
        return res.render("position/detail", {
            job: job,
            company: company,
            isDelivered: isDelivered,
            owner: employer.user_id && employer.company_id == job.company_id ? 2 : 1//1代表普通用户,2代表发布者或者同公司发布
        });
    });
};
exports.indexPage = function (req, res) {
    proxy.ad.findOnShowList(4, function (err, ads) {
        if (err) {
            logger.error(err);
        }
        res.render('position/recommend', {
            ads: ads || []
        });
    });
};


exports.campusPage = function (req, res) {
    res.render('position/campus', {});
};

exports.searchPage = function (req, res) {
    res.render('position/search', {
        hotWords: hotWords
    });
};
exports.jobSearch = function (req, res) {
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        pt: req.query.pt >= 1 && req.query.pt <= 5 ? req.query.pt : 0,
        wk: req.query.wk >= 1 && req.query.wk <= 7 ? req.query.wk : 0,
        lt: req.query.lt ? req.query.lt : 'hot',
        et: req.query.et >= 1 && req.query.et <= 4 ? req.query.et : 0,
        jt: req.query.jt || 0,
        cid: req.query.cid || 0,
        k: req.query.k,
        reg: req.query.reg,
        ct: req.query.ct
    };

    var page_size = 10;
    solr.job.queryJobs(req.query.page > 1 ? req.query.page : 1, // 页数
        page_size, // 每页数量
        option.k, // 关键词
        option.cid, // 城市id
        option.jt, // 职位类型id
        getPayment(option.pt), // 最低薪水
        option.wk, // 每周工作天数
        option.et, //学历要求的类型
        option.reg,//是否转正
        option.ct,//来源类型,普通职位或者包打听
        option.lt, // 指定排序字段名
        timestamp,
        function (err, data) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            if (data.jobs.length && (!req.query.page || req.query.page <= 1)) {
                res.cookie('intern_list_ts', now_time, {
                    path: '/',
                    maxAge: 1000 * 60 * 60 * 30,
                    signed: false,
                    httpOnly: true
                });
            }
            data.option = option;
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
        }
    );

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


/**
 * 黑白校园job搜索
 * @param req
 * @param res
 */
exports.heiBaiCampusSearch = function internSearch(req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {};
    var jt = parseInt(req.query.jt || 0);
    switch (jt) {
        case 1 :
            option.jt = "201,203,204,601,602,603";
            break;
        case 2 :
            option.jt = getJobIDs(4) + ",203,601";
            break;
        case 3 :
            option.jt = getJobIDs(6);
            break;
        case 4 :
            option.jt = "101,600,601,602";
            break;
        case 5 :
            option.jt = getJobIDs(7);
            break;
        case 6 :
            option.jt = getJobIDs(1);
            break;
        case 7 :
            option.jt = getJobIDs(2);
            break;
        case 8 :
            option.jt = getJobIDs(5) + "," + getJobIDs(8) + "," + getJobIDs(9);
            break;
        default :
            option.jt = "0";
            break;
    }
    option.city_id = req.query.city_id || 0;
    option.page_size = 10;
    option.page = page;
    option.channel_type = "1";
    option.timestamp = timestamp;

    proxy.job.heiBaiSearch(option, function (error, jobs) {
        if (error) {
            logger.error(error);
            res.json(resp_status_builder.build(10005, (+new Date - req.start_time) + 'ms'));
        }
        for (var i = 0, len = jobs.length; i < len; i++) {
            var job = {};
            job.id = jobs[i].jid;
            job.type = jobs[i].type;
            job.name = jobs[i].name;
            job.min_payment = jobs[i].min_payment;
            job.max_payment = jobs[i].max_payment;
            job.days_per_week = jobs[i].workdays;
            job.url = "http://" + res.locals.host.m + "/job/detail/" + jobs[i].jid + '?channel_id=ci-f0b87ed080dc13f16d90f0f92a733e50';
            job.company_name = jobs[i].company_name;
            job.city_id = jobs[i].city_id;
            job.city = jobs[i].city;
            job.address = jobs[i].address;
            job.content = jobs[i].content;
            job.welfare = JSON.parse(jobs[i].remarks).attr || {};
            job.people_needed = jobs[i].recruitment || "不限";
            job.deadline = jobs[i].deadline;
            job.refresh_time = jobs[i].refresh_time;
            jobs[i] = job;
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            jobs: jobs,
            page: page,
            timestamp: timestamp
        }));
    });
};


function getJobIDs(parent_type_id) {
    var sub_type = job_type[parent_type_id - 1].sub_types;
    var sJobID = [];
    for (var i = 0, len = sub_type.length; i < len; i++) {
        sJobID.push(sub_type[i].group_id);
    }
    return sJobID.toString();
}

exports.allCity = function (req, res) {
    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', city));
};