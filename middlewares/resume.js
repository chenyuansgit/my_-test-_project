var db = require('../model/index').models;
var async = require('async');
var sequelize = require('../model/connect').sequelize;
var logger = require("../common/log").logger("index");
var resp_status_builder = require('../common/response_status_builder.js');
var proxy = require('../proxy/index');
var des = require('../common/des');
var config = require('../config_default').config;

//用户操作简历的时候对用户和简历关系校验
exports.userResumeAuth = function (req, res, next) {
    var option = req.body.option || {}, rid = req.params.rid || req.query.rid || option.rid || "", uid = res.locals.uid, rid_arr = [];
    try {
        rid_arr = (rid && rid.split(',')) || [];
    } catch (e) {
        logger.error('wrong rid type:' + e);
    }
    var ops = {
        where: {
            user_id: uid
        },
        order: "version DESC"
    };
    if (!!rid_arr.length && rid) {
        ops.where.rid = rid_arr;
    }

    if (rid_arr.length == 1) {
        db.resume.findOne(ops).then(function (resume) {
            if (!resume) {
                req.insert_data.rid = req.insert_data.resumes = [];
                return next();
            }
            req.insert_data.rid = rid_arr;
            req.insert_data.resumes = [resume];
            next();
        }).catch(function (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        });
    } else {
        ops.group = "rid";
        sequelize.query("SELECT * FROM `resume` ,(SELECT `rid`,MAX(`version`) AS `version` FROM `resume` WHERE `user_id`= " + uid + " GROUP BY `rid`) b WHERE `resume`.rid = b.rid AND `resume`.`version` = b.`version`  ORDER BY `create_time`;", {type: sequelize.QueryTypes.SELECT}).then(function (resume) {
            if (!resume || !resume.length || resume.length < rid_arr.length) {
                req.insert_data.rid = req.insert_data.resumes = [];
                return next();
            }
            if (!rid_arr.length) {
                for (var i = 0, len = resume.length; i < len; ++i) {
                    rid_arr.push(resume[i].rid);
                }
            }
            req.insert_data.rid = rid_arr;
            req.insert_data.resumes = resume;
            next();
        }).catch(function (err) {
            logger.error(err);
            res.json(resp_status_builder.build(10003));
        });
    }

};
/*
 hr查看私有简历权限控制,只有已被投递的hr才能查看
 */
exports.employerCheckResume = function (req, res, next) {
    var rid = req.params.rid, option = req.body.option || {}, jid = req.query.jid || option.jid || '', uid = res.locals.uid;
    if (!uid) {
        return res.json(resp_status_builder.build(10007));
    }
    db.resume_job_rel.findOne({
        where: {
            resume_id: rid,
            job_id: jid,
            job_user_id: uid
        }
    }).then(function (resume_job_rel) {
        if (!resume_job_rel) {
            // 关系不存在，说明未投递，没有简历查看权限
            return res.json(resp_status_builder.build(10007));
        }
        async.parallel([function (callback) {
            proxy.resume.findOneByVersion(rid, resume_job_rel.version, function (e1, resume) {
                callback(e1, resume);
            });
        }, function (callback) {
            proxy.job.findOneById(jid, function (e1, job) {
                callback(e1, job);
            });
        }], function (error, results) {
            if (error) {
                logger.error(error);
                return res.json(resp_status_builder.build(10003));
            }
            var resume = results[0] || {}, job = results[1] || {};
            req.insert_data.job = job;
            req.status = resume_job_rel.status;
            req.insert_data.rid = [rid];
            req.insert_data.resumes = [resume];
            next();
        });
    }).catch(function (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10003));
    });
};

/**
 * 简历下载权限验证
 */
exports.downloadCheck = function (req, res, next) {
    var type = req.query.type; // 下载类型1：本人下载  2：hr下载  3：转发后下载
    switch (type) {
        case '2':
            checkByHr(req, res, next);
            break;
        case '3':
            checkByPublic(req, res, next);
            break;
        case '4':
            checkByDet(req, res, next);
            break;
        default:
            checkBySelf(req, res, next);
            break;
    }
};

//学生自身下载简历权限校检
function checkBySelf(req, res, next) {
    var rid = req.params.rid, uid = res.locals.uid;
    if (!uid) {
        return res.json(resp_status_builder.build(10004));
    }
    proxy.resume.findLastResume(null, rid, function (err, resume) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!resume) {
            return res.json(resp_status_builder.build(10006, "resume not exists"));
        }
        if (uid != resume.user_id) {
            return res.json(resp_status_builder.build(10007));
        }
        req.insert_data.resume = resume;
        next();
    });
}
//hr通过简历管理下载简历权限校检
function checkByHr(req, res, next) {
    var job_id = req.query.jid, rid = req.params.rid, uid = res.locals.uid;
    if (!uid) {
        return res.json(resp_status_builder.build(10004));
    }
    //先查看投递关系是否存在
    proxy.resume_job_rel.getOneByOption({
        resume_id: rid,
        job_id: job_id,
        job_user_id: uid
    }, function (err, resume_job_rel) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!resume_job_rel) {
            return res.json(resp_status_builder.build(10007));
        }
        //返回相应的职位和简历信息
        async.parallel([function (callback) {
            proxy.job.findOneById(resume_job_rel.job_id, function (e, job) {
                callback(e, job);
            });
        }, function (callback) {
            proxy.resume.findOneByVersion(rid, resume_job_rel.version, function (e, resume) {
                callback(e, resume);
            });
        }], function (error, results) {
            if (error) {
                logger.error(error);
                return res.json(resp_status_builder.build(10003));
            }
            req.insert_data.resume = results[1] || {};
            req.insert_data.resume_job_rel = resume_job_rel;
            req.insert_data.job = results[0] || {};
            next();
        });
    });
}
function checkByPublic(req, res, next) {
    var resumeData, code, time, rid, shareKey = req.query.shareKey, job_id = req.query.jid, now = +new Date;
    if (!shareKey || !job_id) {
        return res.json(resp_status_builder.build(10002));
    }
    try {
        resumeData = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, shareKey));
        rid = resumeData.rid;
        code = resumeData.code;
        time = resumeData.time;
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002));
    }
    if (now - time >= 3 * 24 * 60 * 1000 * 1000) {
        return res.json(resp_status_builder.build(10007, "code expired"));
    }
    proxy.resume_job_rel.getOneByOption({
        resume_id: rid,
        job_id: job_id
    }, function (err, resume_job_rel) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!resume_job_rel) {
            return res.json(resp_status_builder.build(10007));
        }
        //返回相应的职位和简历信息
        async.parallel([function (callback) {
            proxy.job.findOneById(resume_job_rel.job_id, function (e, job) {
                callback(e, job);
            });
        }, function (callback) {
            proxy.resume.findOneByVersion(rid, resume_job_rel.version, function (e, resume) {
                callback(e, resume);
            });
        }], function (error, results) {
            if (error) {
                logger.error(error);
                return res.json(resp_status_builder.build(10003));
            }
            req.insert_data.resume = results[1] || {};
            req.insert_data.resume_job_rel = resume_job_rel;
            req.insert_data.job = results[0] || {};
            next();
        });
    });
}
function checkByDet(req, res, next) {
    var resumeData, code, time, rid, shareKey = req.query.shareKey, det_id = req.query.det_id, now = +new Date;
    if (!shareKey || !det_id) {
        return res.json(resp_status_builder.build(10002));
    }
    try {
        resumeData = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, shareKey));
        rid = resumeData.rid;
        code = resumeData.code;
        time = resumeData.time;
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002));
    }
    if (now - time >= 3 * 24 * 60 * 1000 * 1000) {
        return res.json(resp_status_builder.build(10007, "code expired"));
    }
    proxy.resume_det_rel.getOneByOption({
        resume_id: rid,
        det_id: det_id
    }, function (err, resume_det_rel) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!resume_det_rel) {
            return res.json(resp_status_builder.build(10007));
        }
        //返回相应的职位和简历信息
        async.parallel([function (callback) {
            proxy.det.findOneById(resume_det_rel.det_id, function (e, det) {
                callback(e, det);
            });
        }, function (callback) {
            proxy.resume.findOneByVersion(rid, resume_det_rel.version, function (e, resume) {
                callback(e, resume);
            });
        }], function (error, results) {
            if (error) {
                logger.error(error);
                return res.json(resp_status_builder.build(10003));
            }
            req.insert_data.resume = results[1] || {};
            // req.insert_data.resume_det_rel = resume_det_rel;
            req.insert_data.job = results[0] || {};
            next();
        });
    });
}