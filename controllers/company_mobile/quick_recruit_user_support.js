var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');


//点赞
exports.support = function (req, res) {
    var uid = res.locals.uid, option = req.body.option || {};
    if (!option.support_id) {
        return res.json(resp_status_builder.build(10002));
    }
    if (uid == option.support_id) {
        return res.json(resp_status_builder.build(10002, 'cannot operate yourself!'));
    }
    async.parallel([
        function (callback) {
            proxy.account.getAllByUid(option.support_id, function (e, accounts) {
                callback(e, accounts);
            });
        }, function (callback) {
            //如果不存在该成员会返回error
            proxy.quick_recruit_user_support.isSupported(option.support_id, uid, function (e, time) {
                callback(null, e || !time ? 0 : time);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (!results[0] || !results[0].length) {
            return res.json(resp_status_builder.build(10006, 'no this user'));
        }
        if (results[1] > 1) {
            return res.json(resp_status_builder.build(10007, 'you had already supported!'));
        }
        proxy.quick_recruit_user_support.add(option.support_id, uid, function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};


//取消点赞
exports.cancel = function (req, res) {
    var uid = res.locals.uid, option = req.body.option || {};
    if (!option.support_id) {
        return res.json(resp_status_builder.build(10002));
    }
    if (uid == option.support_id) {
        return res.json(resp_status_builder.build(10002, 'cannot operate yourself!'));
    }
    async.parallel([
        function (callback) {
            proxy.account.getAllByUid(option.support_id, function (e, accounts) {
                callback(e, accounts);
            });
        }, function (callback) {
            //如果不存在该成员会返回error
            proxy.quick_recruit_user_support.isSupported(option.support_id, uid, function (e, time) {
                callback(null, e || !time ? 0 : time);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (!results[0] || !results[0].length) {
            return res.json(resp_status_builder.build(10006, 'no this user'));
        }
        if (!results[1]) {
            return res.json(resp_status_builder.build(10007, 'you had not supported this one!'));
        }
        proxy.quick_recruit_user_support.del(option.support_id, uid, function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};
