var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var hotCity = require('../../common/hot_city.json');
var job_type = require('../../common/job_type.json');
require('../../common/fn');


//hr用户快招主页
exports.indexPage = function (req, res) {
    var uid = res.locals.uid;
    async.parallel([function (callback) {
        proxy.quick_recruit.findListByTime({
            page: 1,
            timestamp: +new Date,
            no_count: true
        }, function (err, data) {
            callback(err, data && data.quick_recruits ? data.quick_recruits : []);
        });
    }, function (callback) {
        proxy.resume.findTalentResumesList({
            page: 1,
            timestamp: +new Date,
            no_count: true,
            uid: uid || 0
        }, function (err, data) {
            callback(err, data && data.resumes ? data.resumes : []);
        });
    }], function (e, results) {
        if (e) {
            logger.error(e);
        }
        res.render('quickRecruit/index', {
            quick_recruits: results[0] || [],
            resumes: results[1],
            type: 'employer'
        });
    });
};
//hr用户快招管理页面
exports.managePage = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var employer = res.locals.employer, status = req.cookies['_hr_qr_invite_status'] > 1 && req.cookies['_hr_qr_invite_status'] <= 4 ? req.cookies['_hr_qr_invite_status'] : 1;
    async.parallel([
        function (callback) {
            proxy.company.findOne(employer.company_id, function (err, company) {
                callback(err, company);
            });
        },
        function (callback) {
            proxy.quick_recruit_invite.getListByEmployer({
                employer_user_id: employer.user_id,
                status: status,
                timestamp: timestamp,
                page: 1,
                no_count: true
            }, function (err, data) {
                callback(err, data.invites || []);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
        }
        if (results[1] && results[1].length) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.render('quickRecruit/manage/employer', {
            invites: results[1] || [],
            status: status,
            company: results[0],
            path: req.path
        });
    });
};

//人才库列表页面
exports.talentResumesListPage = function (req, res) {
    var employer = res.locals.employer, uid = res.locals.uid, cid = req.query.cid, key = req.query.k, jt = req.query.jt, dt = req.query.dt, mp = req.query.mp, wk = req.query.wk, ws = req.query.ws, et = req.query.et, now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        timestamp: timestamp,
        page: page,
        employer_user_id: employer.user_id,
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
            return res.render("quickRecruit/talentPool/list", {
                hotCity: hotCity,
                option: option,
                resumes: []
            });
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
        res.render("quickRecruit/talentPool/list", data);
    });
};
//hr查看快招攻略
exports.process = function (req, res) {
    res.render("quickRecruit/process", {type: 'employer'});
};
//单个人才的详情页面
exports.talentResumePage = function (req, res) {
    var uid = req.params.uid, employer = res.locals.employer;
    async.parallel([function (callback) {
        proxy.resume.findTalentResume(uid, employer.user_id, function (err, resume) {
            callback(err, resume);
        });
    }, function (callback) {
        proxy.quick_recruit_user_info.getOneById(uid, function (err, info) {
            callback(err, info);
        });
    }, function (callback) {
        proxy.quick_recruit_user_support.isSupported(uid, employer.user_id, function (err, isSupported) {
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
        res.render("quickRecruit/talentPool/detail", {
            resume: results[0],
            stats_info: results[1],
            supported: results[2] >= 1 ? 1 : 0,
            job_type: job_type
        });
    });
};
//快招精选详情
exports.detailPage = function (req, res) {
    var id = req.params.id,uid = res.locals.uid;
    async.parallel([
        function (callback) {
            proxy.quick_recruit.findOneById(id, function (err, qc) {
                callback(err, qc);
            });
        },
        function (callback) {
            proxy.quick_recruit_term.findOneOnline(function (err, quick_recruit_term) {
                callback(err, quick_recruit_term);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
        }
        if (results[1] && uid && !err) {
            proxy.quick_recruit_apply.hasApplied(uid, results[1].term_id, function (err, apply) {
                if (err) {
                    logger.error(err);
                }
                res.render('quickRecruit/special/detail', {
                    quick_recruit: results[0] && !err ? results[0] : {},
                    quick_recruit_term: results[1],
                    path: req.path,
                    apply: apply ? 1 : 0
                });
            });
        } else {
            res.render('quickRecruit/special/detail', {
                quick_recruit: results[0] && !err ? results[0] : {},
                quick_recruit_term: results[1],
                path: req.path,
                apply: 0
            });
        }

    });
};