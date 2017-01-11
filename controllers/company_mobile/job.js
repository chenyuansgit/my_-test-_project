var proxy = require("../../proxy/index");
var logger = require("../../common/log").logger("index");
var resp_status_builder = require('../../common/response_status_builder.js');
var id_reg = require("../../common/utils/reg").number;

exports.allListPage = function (req, res) {
    var uid = res.locals.uid;
    proxy.job.findJobsByEmployer(uid, function (err, jobs) {
        if (err) {
            logger.error(err);
        }
        res.render("mine/jobList", {
            jobs: jobs || []
        });
    });
};
exports.myAllList = function(req,res){
    var uid = res.locals.uid;
    proxy.job.findJobsByEmployer(uid, function (err, jobs) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {jobs: jobs}));
    });
};

//job信息页面展示
exports.singleJobRender = function (req, res) {
    var jid = req.params.jid,uid = res.locals.uid;
    if (!id_reg.test(jid)) {
        return res.render('error/404');
    }
    proxy.job.singleJobDisplay(jid, (uid || 0), function (err, job, company, employer, isDelivered) {
        if (err) {
            logger.error(err);
            return res.render('error/404');
        }
        return res.render("mine/jobPreview", {
            job: job,
            company: company,
            isDelivered: isDelivered,
            owner: employer.user_id && employer.company_id == job.company_id ? 2 : 1//1代表普通用户,2代表发布者或者同公司发布
        });
    });
};