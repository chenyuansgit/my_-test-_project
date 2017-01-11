var resp_status_builder = require('../../common/response_status_builder.js');
var proxy = require("../../proxy/index");
var logger = require("../../common/log").logger("index");
var job_type = require('../../common/job_type');

exports.conditionListPage = function (req, res) {
    res.render("manage/resumeCondition");
};

exports.manageList = function (req, res) {
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time, uid = res.locals.uid;
    proxy.resume.getListByCompany({
        status: req.query.status >= 1 && req.query.status <= 4 ? req.query.status : 1,
        job_user_id: uid,
        timestamp: timestamp,
        page: req.query.page,
        read_type: req.query.read_type,
        transmitted: req.query.transmitted,
        marked: req.query.marked,
        interviewed: req.query.interviewed || '',
        no_count: true
    }, function (err, data) {
        if (err) {
            logger.error(err);
            data = {};
        }
        if (data.resumes && data.resumes.length && (!req.query.page || req.query.page <= 1)) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.status = req.query.status >= 2 ? req.query.status : 1;
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + "ms", data));
    });
};
exports.talentPoolList = function (req, res) {
    var uid = res.locals.uid, cid = req.query.cid, key = req.query.k, jt = req.query.jt, dt = req.query.dt, mp = req.query.mp, wk = req.query.wk, ws = req.query.ws, et = req.query.et, now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
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
        if (data.resumes && data.resumes.length && page == 1) {
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
//简历预览
exports.deliveryResumePreview = function (req, res) {
    res.render("manage/resumePreview", {
        resume: req.insert_data.resumes[0] || {},
        job: req.insert_data.job,
        status: req.status,
        job_type: job_type
    });
};