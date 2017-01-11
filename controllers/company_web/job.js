var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var config = require('../../config_default').config;
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');
var id_reg = require("../../common/utils/reg").number;


//job信息页面展示
exports.detailPage = function (req, res) {
    var jid = req.params.jid,uid = res.locals.uid;
    if (!id_reg.test(jid)) {
        return res.render('error/404');
    }
    proxy.job.singleJobDisplay(jid, uid, function (err, job, company, employer, isDelivered, isFavorite) {
        if (err) {
            logger.error(err);
            return res.render("employer/positionManage/detail", {
                job: {},
                company: {},
                employer: {},
                isDelivered: 0,
                isFavorite: 0
            });
        }
        if (employer.user_id && employer.company_id != job.company_id) {
            return res.redirect("http://" + res.locals.host.www + '/job/detail/' + jid);
        }
        res.render("employer/positionManage/detail", {
            job: job,
            company: company,
            employer: employer,
            isDelivered: isDelivered,
            isFavorite: isFavorite
        });
    });
};
exports.previewPage = function(req,res){
 res.render("employer/positionManage/positionPreview");
};

//企业用户操作职位信息
exports.add = function (req, res) {
    var job_info = req.body.option || {}, employer = res.locals.employer;
    job_info.company_id = employer.company_id;
    job_info.create_time = job_info.update_time = job_info.refresh_time = +new Date;
    job_info.user_id = employer.user_id;

    proxy.job.getPubTimes(employer.user_id, function (err, count) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (count >= config.company.job_release_times) {
            return res.json(resp_status_builder.build(10013, 'you can release job' + config.company.job_release_times + ' times per day!'));
        }
        proxy.job.create(job_info, function (err) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });

};
exports.delete = function (req, res) {//不是实际删除,状态值保存为9
    var jid = req.params.jid, employer = res.locals.employer;
    var option = {state: 9, update_time: +new Date};
    proxy.job.update(option, jid, employer.user_id, employer.company_id, function (err, job) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!job[0]) {
            return res.json(resp_status_builder.build(10006, "job not exists"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));

    });
};
exports.update = function (req, res) {
    var jid = req.params.jid,
        option = req.body.option || {},
        employer = res.locals.employer;
    if (option.jid) delete option.jid;
    if (option.company_id) delete option.company_id;
    if (option.user_id) delete option.user_id;
    option.update_time = +new Date;

    proxy.job.getPubTimes(employer.user_id, function (err, count) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (count >= config.company.job_release_times) {
            return res.json(resp_status_builder.build(10013, 'you can release job' + config.company.job_release_times + ' times per day!'));
        }
        proxy.job.update(option, jid, employer.user_id, employer.company_id, function (err, job) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            if (!job[0]) {
                return res.json(resp_status_builder.build(10006, "job not exists"));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });

};
exports.refresh = function (req, res) {
    var jid = req.params.jid, employer = res.locals.employer;
    proxy.job.refresh(jid, employer.user_id, employer.company_id, function (err, rst) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (rst == 1) {
            return res.json(resp_status_builder.build(10013, "refresh times hit limit"));
        }
        if (rst == 2) {
            return res.json(resp_status_builder.build(10006, "job not exists"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
exports.offline = function (req, res) {
    var jid = req.params.jid || req.query.jid || (req.body.option && req.body.option.jid), employer = res.locals.employer;
    var option = {state: 2, update_time: +new Date};

    if (!jid) {
        return res.json(resp_status_builder.build(10002, "invalid jid"));
    }
    proxy.job.update(option, jid, employer.user_id, employer.company_id, function (err, job) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }

        if (!job[0]) {
            return res.json(resp_status_builder.build(10006, "job not exists"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};
exports.online = function (req, res) {
    var jid = req.params.jid || req.query.jid || (req.body.option && req.body.option.jid), employer = res.locals.employer;
    var deadline = req.body.option.deadline;
    var option = {state: 1, update_time: +new Date};
    if (deadline) {
        option.deadline = deadline;
    }
    if (!jid) {
        return res.json(resp_status_builder.build(10002, "invalid jid"));
    }
    proxy.job.update(option, jid, employer.user_id, employer.company_id, function (err, job) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!job[0]) {
            return res.json(resp_status_builder.build(10006, "job not exists"));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};

/**
 * 快招页面hr展示职位列表
 * @param req
 * @param res
 */
exports.getListByEmployer = function (req, res) {
    var employer = res.locals.employer;
    async.parallel([
        function (callback) {
            proxy.job.findJobsByEmployer(employer.user_id, function (err, jobs) {
                callback(err, jobs);
            });
        },
        function (callback) {
            proxy.company.findOne(employer.company_id, function (err, company) {
                callback(err, company);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            jobs: results[0] || [],
            company: results[1] || {}
        }));
    });
};
