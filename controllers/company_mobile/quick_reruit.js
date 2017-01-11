var logger = require("../../common/log").logger("index");
var async = require("async");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var job_type = require('../../common/job_type.json');
var hotCity = require("../../common/hot_city.json");
require('../../common/fn');


exports.specialDetail = function (req, res) {
    var id = req.params.id;
    proxy.quick_recruit.findOneById(id, function (err, qc) {
        if (err) {
            logger.error(err);
        }
        res.render("quickRecruit/special", {
            quick_recruit: qc || {}
        });
    });
};
exports.talentPoolDetail = function (req, res) {
    var uid = req.params.uid, employer_uer_id = res.locals.uid, employer = res.locals.employer;
    async.parallel([function (callback) {
        proxy.resume.findTalentResume(uid, employer_uer_id, function (err, resume) {
            callback(err, resume);
        });
    }, function (callback) {
        proxy.quick_recruit_user_support.isSupported(uid, employer_uer_id, function (err, isSupported) {
            callback(err, isSupported);
        });
    }], function (e, results) {
        if (e) {
            logger.error(e);
        }
        //异步添加一条历史记录
        proxy.company.findOne(employer.company_id, function (e0, company) {
            if (!e0) {
                proxy.quick_recruit_user_history.add(uid, company.cid, company.name);
            }
        });
        res.render("quickRecruit/detail", {
            resume: results[0],
            supported: results[1] >= 1 ? 1 : 0,
            job_type: job_type
        });
    });
};
exports.homeListPage = function (req, res) {
    var uid = res.locals.uid;
    async.parallel([function (callback) {
        proxy.quick_recruit.findListByTime({
            page: 1,
            timestamp: +new Date,
            no_count: true
        }, function (err, data) {
            //最多返回5条数据
            if (data && data.quick_recruits && data.quick_recruits.length > 5) {
                data.quick_recruits = data.quick_recruits.slice(0, 5);
            }
            callback(err, data && data.quick_recruits ? data.quick_recruits : []);
        });
    }, function (callback) {
        proxy.resume.search({
            page: 1,
            timestamp: +new Date,
            ava: 1,
            no_count: true
        }, function (err, data) {
            callback(err, data && data.resumes ? data.resumes : []);
        });
    }, function (callback) {
        if (!uid) {
            return callback(null, 0);
        }
        proxy.employer.getOneById(uid, function (err, employer) {
            callback(err, employer && employer.company_id ? 1 : 0);
        });
    }], function (e, results) {
        if (e) {
            logger.error(e);
        }
        res.render('index', {
            validated: results[2] || 0,
            quick_recruits: results[0] || [],
            resumes: results[1],
            job_type: job_type
        });
    });
};
exports.findTalentResumesList = function (req, res) {
    var uid = res.locals.uid, cid = req.query.cid, key = req.query.k, jt = req.query.jt, dt = req.query.dt, mp = req.query.mp, wk = req.query.wk, ws = req.query.ws, et = req.query.et, now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        no_count: true,
        timestamp: timestamp,
        page: page,
        employer_user_id: uid,
        uid: uid || 0,
        jt: jt || 0,//期望职位类型
        key: key,//关键词
        cid: cid || 0,//城市id
        dt: dt || 0,//工作周期1-4
        mp: mp || 0,//最低日薪水0,1,50,100,200,500
        wk: wk || 0,//每周工作天数类型1-5
        ws: ws || 0,//目前的实习状态0-3
        et: et || 0,//最高学历类型1-4
        ava: req.query.ava || 0//是否有头像
    };
    proxy.resume.search(option, function (err, data) {
        if (err) {
            logger.error(err);
            data = {};
        }
        data.option = option;
        data.hotCity = hotCity;
        if (data.resumes.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + "ms", data));
    });
};





