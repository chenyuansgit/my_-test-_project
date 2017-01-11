var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var config = require("../../config_default").config;
require('../../common/fn');


exports.quickRecruitPage = function (req, res) {
    res.render('quickRecruit/list');
};
exports.getQuickRecruitList = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    proxy.quick_recruit.findListByTime({
        page: page,
        timestamp: timestamp
    }, function (err, data) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (data.quick_recruits.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
    });
};
exports.quickRecruitDetailPage = function (req, res) {
    var id = req.params.id;
    proxy.quick_recruit.findOneById(id, function (err, qc) {
        if (err) {
            logger.error(err);
        }
        res.render('quickRecruit/detail', {quick_recruit: qc && !err ? qc : {}});
    });
};

//学生用户快招主页
exports.userQrPage = function (req, res) {
    var uid = res.locals.uid;
    proxy.resume.findLastResume(uid, null, function (err, resume) {
        if (err) {
            logger.error(err);
        }
        res.render("manage/qrInvites", {
            is_public: resume && resume.is_public ? resume.is_public : 0,
            rid: resume && resume.rid ? resume.rid : 0
        });
    });
};

