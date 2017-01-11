var async = require('async');
var proxy = require("../../proxy/index");
var logger = require("../../common/log").logger("index");
var resp_status_builder = require('../../common/response_status_builder.js');
var hotCity = require('../../common/hot_city.json');


//根据条件查找暑期实习的学生

exports.userListPage = function (req, res) {
    var employer = res.locals.employer, cid = req.query.cid, jt = req.query.jt, dt = req.query.dt, mp = req.query.mp, wk = req.query.wk, ws = req.query.ws, et = req.query.et, now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        timestamp: timestamp,
        page: page,
        employer_user_id: employer.user_id,
        uid: employer.user_id,
        cid: cid || 0,//城市id
        jt: jt,
        dt: dt || 0,//工作周期1-4
        mp: mp || 0,//最低日薪水0,1,50,100,200,500
        wk: wk || 0,//每周工作天数类型1-5
        ws: ws || 0,//目前的实习状态0-3
        et: et || 0,//最高学历类型1-4
        ava: req.query.ava || 0//是否有头像,
    };
    proxy.summer.list('user', 0, -1, function (e, uids) {
        if (e) {
            logger.error(e);
            return res.render('summer/userList', {
                hotCity: hotCity,
                option: option,
                resumes: []
            });
        }
        if (!uids || !uids.length) {
            return res.render('summer/userList', {
                hotCity: hotCity,
                option: option,
                resumes: []
            });
        }
        option.uids = uids;
        proxy.resume.findTalentResumesList(option, function (err, data) {
            if (err) {
                logger.error(err);
                return res.render('summer/userList', {
                    hotCity: hotCity,
                    option: option,
                    resumes: []
                });
            }
            data.option = option;
            data.hotCity = hotCity;
            res.render('summer/userList', data);
        });
    });
};

//企业暑期实习加入页面
exports.companyJoinPage = function (req, res) {
    var uid = res.locals.uid;
    if (!uid) {
        return res.render('summer/companyIndex', {
            validate: 0,
            isJoiner: 0
        });
    }
    proxy.employer.getOneById(uid, function (error, employer) {
        if (error) {
            logger.error(error);
        }
        if (!employer || !employer.company_id || error) {
            return res.render('summer/companyIndex', {
                validate: 0,
                isJoiner: 0
            });
        }
        proxy.summer.isJoiner(employer.company_id, 'company', function (err, score) {
            if (err) {
                logger.error(err);
            }
            res.render('summer/companyIndex', {
                validate: 1,
                isJoiner: !err && score > 1 ? 1 : 0
            });
        });
    });
};
//企业加入暑期实习
exports.companyJoin = function (req, res) {
    var employer = res.locals.employer;
    proxy.summer.isJoiner(employer.company_id, 'company', function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (score > 1) {
            return res.json(resp_status_builder.build(10007, 'you have join before'));
        }
        proxy.summer.join(employer.company_id, 'company', function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};


//企业退出暑期实习
exports.companyQuit = function (req, res) {
    var employer = res.locals.employer;
    proxy.summer.isJoiner(employer.company_id, 'company', function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (score > 1) {
            return res.json(resp_status_builder.build(10007, 'you have not join before'));
        }
        proxy.summer.quit(employer.company_id, 'company', function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};