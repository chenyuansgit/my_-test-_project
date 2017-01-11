var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var solr = require("../../solr/index").models;


exports.settingPage = function (req, res) {
    var uid = res.locals.uid;
    if (!uid) {
        return res.render('sub/setting', {
            sub: {}
        });
    }
    proxy.job_subscription.getOneById(uid, function (err, job_subscription) {
        if (err) {
            logger.error(err);
        }
        res.render('sub/setting', {
            sub: job_subscription || {}
        });
    });
};

exports.createOrUpdate = function (req, res) {
    var uid = res.locals.uid, option = req.body.option || {};
    proxy.job_subscription.getOneById(uid, function (err, job_subscription) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        option.user_id = uid;
        if (!job_subscription) {
            option.create_time = option.update_time = +new Date;
            return proxy.job_subscription.create(option, function (e1) {
                if (e1) {
                    logger.error(e1);
                    return res.json(resp_status_builder.build(10003));
                }
                return res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
            });
        }
        option.update_time = +new Date;
        proxy.job_subscription.updateOneById(uid, job_subscription, option, function (e2) {
            if (e2) {
                logger.error(e2);
                return res.json(resp_status_builder.build(10003));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};
exports.listPage = function (req, res) {
    var uid = res.locals.uid, now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    if (!uid) {
        return res.render('sub/list', {
            sub: {},
            isSub: false,
            page: page,
            pages: 0,
            jobs: [],
            count: 0
        });
    }
    proxy.job_subscription.getOneById(uid, function (err, job_subscription) {
        if (err) {
            logger.error(err);
            return res.render('sub/list', {
                sub: {},
                isSub: false,
                page: page,
                pages: 0,
                jobs: [],
                count: 0
            });
        }
        job_subscription = job_subscription || {};
        solr.job.queryJobs(page, // 页数
            10, // 每页数量
            job_subscription.key || '', //关键词
            job_subscription.city_id || 0, // 城市id
            null, // 职位类型id
            job_subscription.min_payment || 0, // 最低薪水
            job_subscription.workdays || 0, // 每周工作天数
            job_subscription.education || 0, //学历要求的类型
            0,
            0,
            'time', // 指定排序字段名
            timestamp,
            function (e, data) {
                if (e) {
                    logger.error(e);
                }
                if (data && data.jobs && data.jobs.length && page == 1) {
                    res.cookie('intern_list_ts', now_time, {
                        path: '/',
                        maxAge: 1000 * 60 * 60 * 30,
                        signed: false,
                        httpOnly: true
                    });
                }
                data.job_subscription = job_subscription;
                data.isSub = job_subscription.user_id ? true : false;
                res.render('sub/list', data);
            }
        );
    });
};












