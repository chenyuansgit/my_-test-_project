var async = require('async');
var proxy = require("../../proxy/index");
var db = require('../../model/index').models;
var logger = require("../../common/log").logger("index");
var resp_status_builder = require('../../common/response_status_builder.js');
var hotCity = require('../../common/hot_city.json');

//学生暑期实习加入页面
exports.joinPage = function (req, res) {
    var uid = res.locals.uid;
    if (!uid) {
        return res.render('summer/userIndex', {
            isJoiner: 0
        });
    }
    proxy.summer.isJoiner(uid, 'user', function (err, score) {
        if (err) {
            logger.error(err);
        }
        res.render('summer/userIndex', {
            isJoiner: score > 1 ? 1 : 0
        });
    });
};

//学生参与暑期实习
exports.join = function (req, res) {
    var uid = res.locals.uid, resumes = req.insert_data.resumes;
    if (!resumes.length) {
        return res.json(resp_status_builder.build(10006, 'you have not one resume!'));
    }
    proxy.summer.isJoiner(uid, 'user', function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (score > 1) {
            return res.json(resp_status_builder.build(10007, 'you have join before'));
        }
        async.parallel([function (callback) {
            //加入暑期试下,默认开通快招
            db.resume.update({is_public: 1}, {
                where: {
                    user_id: uid,
                    is_public: 0
                }
            }).then(function () {
                callback(null, 1);
            }).catch(function (e0) {
                callback(e0);
            });
        }, function (callback) {
            proxy.summer.join(uid, 'user', function (e0) {
                callback(e0);
            });
        }], function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};


//学生退出暑期实习
exports.quit = function (req, res) {
    var uid = res.locals.uid;
    proxy.summer.isJoiner(uid, 'user', function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (score > 1) {
            return res.json(resp_status_builder.build(10007, 'you have not join before'));
        }
        proxy.summer.quit(uid, 'user', function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};

//所有参与暑期实习的企业的职位

exports.jobListPage = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        pt: req.query.pt >= 1 && req.query.pt <= 5 ? req.query.pt : 0,
        wk: req.query.wk >= 1 && req.query.wk <= 7 ? req.query.wk : 0,
        lt: req.query.lt ? req.query.lt : 'time',
        et: req.query.et >= 1 && req.query.et <= 4 ? req.query.et : 0,
        jt: req.query.jt || 0,
        cid: req.query.cid || 0,
        k: req.query.k,
        rec: req.query.rec,
        page: page,
        start_time: 1458439163572,//显示3月20日以后的职位
        timestamp: timestamp
    };
    proxy.summer.list('company', 0, -1, function (e, cids) {
        if (e) {
            logger.error(e);
            return res.render('summer/jobList', {
                option: option,
                jobs: [],
                pages: 0,
                page: page,
                count: 0,
                hotCity: hotCity
            });
        }
        if (!cids.length) {
            return res.render('summer/jobList', {
                option: option,
                jobs: [],
                pages: 0,
                page: page,
                count: 0,
                hotCity: hotCity
            });
        }
        option.cids = cids;
        proxy.job.search(option, function (err, data) {
            if (err) {
                logger.error(err);
                return res.render('summer/jobList', {
                    option: option,
                    jobs: [],
                    pages: 0,
                    page: page,
                    count: 0,
                    hotCity: hotCity
                });
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
            data.hotCity = hotCity;
            res.render('summer/jobList', data);
        });
    });
};

//暑期实习高估值互联网公司专题

exports.topic = function (req, res) {
    var uid = res.locals.uid;
    if (!uid) {
        return res.render('summer/topic/startup', {
            isJoiner: 0
        });
    }
    proxy.summer.isJoiner(uid, 'user', function (err, score) {
        if (err) {
            logger.error(err);
        }
        res.render('summer/topic/startup', {
            isJoiner: score > 1 && !err ? 1 : 0
        });
    });
};




