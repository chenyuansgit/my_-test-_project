var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var sequelize = require('../../model/connect').sequelize;
var resp_status_builder = require('../../common/response_status_builder.js');
var solr = require('../../solr/index').models;
var async = require('async');
exports.search = function (req, res) {
    var key = req.query.k;
    if (!key) {
        return res.json(resp_status_builder.build(10002));
    }
    var sql = "select rid,user_id,name,phone,email,education_detail,max(version) as version from `resume` where `name` like'%" + key + "%' or `phone`='" + key + "' or `email`='" + key + "' or `education_detail`='" + key + "' group by rid";
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT
    }).then(function (resumes) {
        return res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {resumes: resumes}));
    }).catch(function (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10003));
    });
};

exports.operate = function (req, res) {
    var option = req.body.option || {}, intern_expect_position_type = option.intern_expect_position_type, rid = req.params.rid;
    if (!intern_expect_position_type) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.resume.updateAllById({
        intern_expect_position_type: intern_expect_position_type
    }, rid, function (e, rows) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
exports.detail = function (req, res) {
    var rid = req.params.rid || req.query.rid;
    if (!rid || rid <= 0) {
        return res.json(resp_status_builder.build(10002, "invalid rid"));
    }
    proxy.resume.findLastResume(null, rid, function (err, resume) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.render('quick_recruit/apply/resumePreview', {
            resume: resume
        });
    });
};
exports.listPage = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time, lt = req.query.lt || 'time', k = req.query.k;
    proxy.resume.getAllList({
        timestamp: timestamp,
        key: k,
        page: page,
        lt: lt,
        operation: req.query.operation
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.resumes.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.render('recruit/resume/list', {
            resumes: data.resumes || [],
            pages: data.pages || 0,
            page: page,
            total: data.total || 0,
            lt: lt,
            option: {
                timestamp: timestamp,
                key: k,
                page: page,
                lt: lt,
                operation: req.query.operation
            }
        });
    });
};
//查看单个用户的投递列表(公司和职位信息)
exports.deliveryList = function(req,res){
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time,uid = req.query.uid;
    async.parallel([
        function(callback){
            sequelize.query("select a.status,b.name as job_name,b.jid as job_id,c.cid as company_id,c.name as company_name from resume_job_rel a,job b,company c where a.job_company_id = c.cid and a.job_id = b.jid and a.resume_user_id = :uid and a.update_time < :timestamp limit :offset,10",{
                type: sequelize.QueryTypes.SELECT,
                replacements:{
                    uid:uid,
                    offset:(page-1)*10,
                    timestamp:timestamp
             }
            }).then(function(details){
                callback(null,details);
            }).catch(function(e){
                callback(e);
            });
        },function(callback){
            sequelize.query("select count(*) as count from resume_job_rel where resume_user_id = :uid and update_time < :timestamp",{
                type: sequelize.QueryTypes.SELECT,
                replacements:{
                    uid:uid,
                    timestamp:timestamp
                }
            }).then(function(count){
                callback(null,count[0].count);
            }).catch(function(e){
                callback(e);
            });
        }
    ],function(err,results){
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (results[0].length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms',{
            details:results[0],
            count:results[1],
            page:page,
            total: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1)
        }));
    });
};

//屏蔽简历
exports.shield = function (req, res) {
    var rid = req.params.rid || req.query.rid;
    proxy.resume.updateAllById({status: 2}, rid, function (e, rows) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10003));
        }
        if (rows[0]) {//异步修改solr存储
            proxy.resume.findLastResume(null, rid, function (err, resume) {
                if (!err && resume) {
                    solr.resume.update(resume.user_id);
                }
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
//取消屏蔽
exports.unshield = function (req, res) {
    var rid = req.params.rid || req.query.rid;
    proxy.resume.updateAllById({status: 1}, rid, function (e, rows) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10003));
        }
        if (rows[0]) {//异步修改solr存储
            proxy.resume.findLastResume(null, rid, function (err, resume) {
                if (!err && resume) {
                    solr.resume.update(resume.user_id);
                }
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};

