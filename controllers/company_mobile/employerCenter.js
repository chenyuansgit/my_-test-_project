var proxy = require("../../proxy/index");
var logger = require("../../common/log").logger("index");
var async = require("async");
var resp_status_builder = require('../../common/response_status_builder.js');


exports.index = function (req, res) {
    var uid = res.locals.uid;
    if (!uid) {
        return res.render("employerCenter", {
            employer: {},
            validated: 0,
            job_count: 0
        });
    }
    async.parallel([
        function (callback) {
            proxy.employer.getOneById(uid, function (e, employer) {
                callback(e, employer);
            });
        }, function (callback) {
            proxy.job.findJobsByEmployer(uid, function (e, jobs) {
                callback(e, jobs && jobs.length ? jobs.length : 0);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
        }
        res.render("employerCenter", {
            employer: results && results[0] ? results[0] : {},
            validated: results && results[0] && results[0].company_id >= 1 ? 1 : 0,
            job_count: results && results[1] ? results[1] : 0
        });
    });
};
exports.updateBase = function (req, res) {
    var option = req.body.option || {}, employer = res.locals.employer, opt = {};
    if (!option.avatar || !!option.nick_name) {
        return res.json(resp_status_builder.build(10002));
    }
    if (option.avatar) {
        opt.avatar = option.avatar;
    }
    if (option.nick_name) {
        opt.nick_name = option.nick_name;
    }
    proxy.employer.updateOneById(employer.user_id, opt, function (err) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (option.nick_name) {
            //删除显示昵称信息
            req.session.account_name = null;
            proxy.account.display_name.del(employer.user_id);

        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};