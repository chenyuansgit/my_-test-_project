var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');

exports.subscriptionPage = function (req, res) {
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
    var option = req.body.option || {}, uid = res.locals.uid;
    if (!option) {
        return res.json(resp_status_builder.build(10002));
    }
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
    var uid = res.locals.uid;
    if (!uid) {
        return res.render('sub/list', {
            sub: {},
            isSub: false
        });
    }
    proxy.job_subscription.getOneById(uid, function (err, job_subscription) {
        if (err) {
            logger.error(err);
        }
        res.render('sub/list', {
            sub: job_subscription || {},
            isSub: job_subscription && !err ? true : false
        });
    });
};












