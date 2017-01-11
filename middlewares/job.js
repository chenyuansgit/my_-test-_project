var db = require('../model/index').models;


//公司用户操作职位信息时候需要校验该职位发布者
exports.checkJobsEmployerPublisher = function (req, res, next) {
    //操作的job_id方式一次优先级为path参数,url参数,body参数,如果不存在将默认操作该用户的发布的所有职位
    var jid = req.params.jid || req.query.jid || (req.body.option && req.body.option.jid) || "", employer = res.locals.employer, jid_arr = [];
    try {
        jid_arr = (jid && jid.split(',')) || [];
    } catch (e) {
    }
    var option = {
        where: {
            user_id: employer.user_id
        }
    };
    if (!!jid_arr.length && jid) {
        option.where.jid = jid_arr;
    }
    db.job.findAll(option).then(function (jobs) {
        if (!jobs || !jobs.length || jobs.length < jid_arr.length) {
            req.insert_data.jid = req.insert_data.jobs = [];
            return next();
        }
        if (!jid_arr.length) {
            for (var i = 0, len = jobs.length; i < len; ++i) {
                jid_arr.push(jobs[i].jid);
            }
        }
        req.insert_data.jid = jid_arr;
        req.insert_data.jobs = jobs;
        next();
    });
};
