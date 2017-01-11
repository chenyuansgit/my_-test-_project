var express = require('express');
var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var db = require('../../model/index').models;
var job_type = require('../../common/job_type.json');
require('../../common/fn');

//学生用户快招主页
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
            ava: 1,
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
            type: 'user'
        });
    });
};

//学生用户快招管理页面
exports.managePage = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var uid = res.locals.uid, status = req.cookies['_user_qr_invite_status'] > 1 && req.cookies['_user_qr_invite_status'] <= 4 ? req.cookies['_user_qr_invite_status'] : 1;
    async.parallel([
        function (callback) {
            proxy.resume.findLastResume(uid, null, function (err, resume) {
                callback(err, resume);
            });
        },
        function (callback) {
            proxy.quick_recruit_term.findOneOnline(function (err, quick_recruit_term) {
                callback(err, quick_recruit_term);
            });
        },
        function (callback) {
            proxy.quick_recruit_user_info.getOneById(uid, function (err, info) {
                callback(err, info);
            });
        },
        function (callback) {
            proxy.quick_recruit_apply.myApplyList(uid, function (err, quick_recruit_applies) {
                callback(err, quick_recruit_applies);
            });
        },
        function (callback) {
            proxy.quick_recruit_invite.getListByUser({
                user_id: uid,
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
        if (results[3] && results[3].length) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        if (results[1] && uid && !err) {

            return proxy.quick_recruit_apply.hasApplied(uid, results[1].term_id, function (err, apply) {
                if (err) {
                    logger.error(err);
                }
                res.render('quickRecruit/manage/stu', {
                    resume: results[0] || {},
                    invites: results[4] || [],
                    status: status,
                    quick_recruit_term: results[1],
                    quick_recruit_applies: results[3] || [],
                    stats_info: results[2] || {},
                    path: req.path,
                    apply: apply ? 1 : 0
                });
            });
        }
        res.render('quickRecruit/manage/stu', {
            resume: results[0] || {},
            invites: results[4] || [],
            status: status,
            quick_recruit_term: results[1],
            quick_recruit_applies: results[3] || [],
            stats_info: results[2] || {},
            path: req.path,
            apply: 0
        });
    });
};
//用户查看快招流程
exports.process = function (req, res) {
    res.render("quickRecruit/process", {type: 'user'});
};
//快招精选详情
exports.detailPage = function (req, res) {
    var id = req.params.id, uid = res.locals.uid;
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

/**
 * 普通用户申请快招精选
 * @param req
 * @param res
 */
exports.apply = function (req, res) {
    var term_id = req.body.term_id, uid = res.locals.uid;
    if (!term_id || term_id <= 0) {
        return res.json(resp_status_builder.build(10002, "invalid term_id"));
    }
    proxy.resume.findLastResume(uid, null, function (err, resume) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!resume) {
            return res.json(resp_status_builder.build(10006, "must create a resume first!"));
        }
        var now = +new Date;
        var option = {
            user_id: uid,
            name: resume.name,
            phone: resume.phone,
            email: resume.email,
            male: resume.male,
            status: 1,
            create_time: now,
            update_time: now,
            school: JSON.parse(resume.education_detail)[0].school,
            term_id: term_id,
            resume_id: resume.rid
        };
        db.quick_recruit_apply.create(option).then(function (apply) {
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        }).catch(function (e) {
            logger.error(e);
            res.json(resp_status_builder.build(10001));
        });

    });
};

/**
 * 我的快招精选申请列表
 * @param req
 * @param res
 */
exports.applyList = function (req, res) {
    var uid = res.locals.uid;
    proxy.quick_recruit_apply.myApplyList(uid, function (err, quick_recruit_applies) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', quick_recruit_applies || []));
    });
};
