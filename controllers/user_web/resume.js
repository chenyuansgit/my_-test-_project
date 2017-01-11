var des = require('../../common/des');
var validate = require('../../common/validate');
var rankey = require('../../common/fn').rankey;
var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var email_template = require('../../common/email_template');
var md5 = require('md5');
var resp_status_builder = require('../../common/response_status_builder.js');
var job_type = require('../../common/job_type');


exports.createPage = function (req, res) { //简历创建
    res.render("private/resume/create");
};

exports.detailPage = function (req, res) { //用户自己简历预览
    res.render("private/resume/preview", {
        resume: req.insert_data.resumes[0] || {},
        job_type: job_type
    });
};
exports.add = function (req, res) {
    var uid = res.locals.uid,
        option = req.body.option,
        timestamp = +new Date,
        resumes = req.insert_data.resumes,
        rid_arr = req.insert_data.rid,
        rid = parseInt(uid.toString() + rankey(10, 99).toString());
    if (resumes.length >= 1) {
        return res.json(resp_status_builder.build(10006, 'you already have one resume!'));
    }
    if (rid_arr.indexOf(rid) > -1) {
        rid = parseInt(uid.toString() + rankey(10, 99).toString());
        if (rid_arr.indexOf(rid) > -1) {
            rid = parseInt(uid.toString() + rankey(10, 99).toString());
            if (rid_arr.indexOf(rid) > -1) {
                return res.json(resp_status_builder.build(10005));
            }
        }
    }
    option.user_id = uid;
    option.rid = rid;
    option.create_time = option.update_time = option.refresh_time = timestamp;
    if (!resumes.length) {
        option.default_resume = 1;
    }
    proxy.resume.create(option, function (e, resumeone) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {resume: resumeone}));
    });
};
/*
 1.获取最新版本号的简历
 2.查看该简历是否有投递记录
 3.没有直接修改，有则新增记录且版本号+1
 */
exports.update = function (req, res) {
    var rid = req.params.rid, option = req.body.option || {};
    if (req.insert_data.resumes.length < 1) {
        return res.json(resp_status_builder.build(10006, "resume not exists"));
    }
    if (option.refresh_time || option.is_public === '0' || option.is_public === 0 || option.is_public == 1) {//如果存在刷新时间和公开简历选项,修改操作只针对其中之一
        if (option.refresh_time) {
            option = {
                refresh_time: +new Date
            };
        } else {
            option = {
                is_public: option.is_public
            };
        }
        return proxy.resume.updateOneByVersion(option, rid, req.insert_data.resumes[0].version, function (err) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    }
    option.update_time = +new Date;
    proxy.resume_job_rel.getOneByOption({
        resume_id: rid,
        version: req.insert_data.resumes[0].version
    }, function (err, relation) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!relation) {
            if (option.rid) delete option.rid;
            if (option.user_id) delete option.user_id;
            proxy.resume.updateOneByVersion(option, rid, req.insert_data.resumes[0].version, function (err) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10003));
                }
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        } else {
            var resume = req.insert_data.resumes[0].dataValues;
            for (var i in option) {
                resume[i] = option[i];
            }
            resume.version = relation.version + 1;
            proxy.resume.create(resume, function (err, resu) {
                if (err) {
                    logger.error(err);
                    return res.json(resp_status_builder.build(10003));
                }
                res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                    resume: resu
                }));
            });
        }
    });
};
