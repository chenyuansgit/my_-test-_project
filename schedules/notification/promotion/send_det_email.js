var cache = require('../../../cache/index').cache;
var proxy = require("../../../proxy/index");
var logger = require("../../../common/log").logger("schedule");
var sequelize = require('../../../model/connect').sequelize;
var solr = require("../../../solr/index").models;
var async = require('async');
var validate = require('../../../common/validate');
var promotion_template = require('../../../common/email_template/promotion').det_notification;


var redis_key_det_resume_recommend_list = "det_resume_recommend_list";
var recommend_length = 4;

function getTimeRange(timestamp, days) {
    var date = new Date(timestamp);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return [date.getTime() - 24 * 60 * 60 * 1000 * days, date.getTime() - 1];
}

function sendMail(address, resume_list, callback) {
    var html = promotion_template(resume_list);
    validate.sendMail({
        address: address,
        subject: '20万学生用户,免费查看简历,免费邀约,快来抢夺人才!',
        html: html
    }, function (e) {
        callback && callback(e);
    });
}

//获取过去一天发出的包打听职位信息
function getLastDet(timestamp, days, callback) {
    var range = getTimeRange(timestamp, days);
    sequelize.query("select city_id,type_id,notice_email from detective_job where create_time >= :start and create_time <= :end group by notice_email", {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            start: range[0],
            end: range[1]
        }
    }).then(function (dets) {
        callback(null, dets);
    }).catch(function (e) {
        callback(e);
    });
}

function getDefaultRecommend(callback) {
    cache.lrange(redis_key_det_resume_recommend_list, 0, -1, function (err, list) {
        if (err) {
            return callback(err);
        }
        if (!list || !list.length) {
            return callback(null, []);
        }
        for (var i = 0, _list = [], len = list.length; i < len; ++i) {
            _list.push(JSON.parse(list[i]));
        }
        callback(null, _list);
    });
}

function recommend(det, callback) {
    async.parallel([
        function (_callback) {
            proxy.resume.search({
                cid: det.city_id || 0,
                jt: det.type_id || 0,
                ava: 1,
                page: 1
            }, function (e, data) {
                _callback(e, data && data.resumes && data.resumes.length ? data.resumes : []);
            });
        }, function (_callback) {
            getDefaultRecommend(function (e, list) {
                _callback(e, list);
            });
        }
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        var resumes = results[0] || [], default_resumes = results[1] || [], callback_list = [];
        if (results[0].length >= recommend_length) {
            return callback(null, results[0].slice(0, 4));
        }
        switch (resumes.length) {
            case 0:
                callback_list = default_resumes;
                break;
            case 1:
                callback_list.push(resumes[0]);
                callback_list.push(default_resumes[0]);
                callback_list.push(default_resumes[1]);
                callback_list.push(default_resumes[2]);
                break;
            case 2:
                callback_list.push(resumes[0]);
                callback_list.push(resumes[1]);
                callback_list.push(default_resumes[0]);
                callback_list.push(default_resumes[1]);
                break;
            case 3:
                callback_list.push(resumes[0]);
                callback_list.push(resumes[1]);
                callback_list.push(resumes[2]);
                callback_list.push(default_resumes[0]);
                break;
        }
        callback(null, callback_list);
    });
}

exports.doBgService = function (callback) {
    var day_of_week = new Date().getDay(), days = 1;
    if (day_of_week === 6 || day_of_week === 7) {
        return callback && callback(null);
    }
    if (day_of_week === 1) {
        days = 3;
    }
    getLastDet(+new Date, days, function (e, dets) {
        if (e) {
            logger.error(e);
            return callback && callback(e);
        }
        if (!dets || !dets.length) {
            return callback && callback(null);
        }
        async.each(dets, function (det, _callback) {
            recommend(det, function (e0, list) {
                if (e0) {
                    return _callback(e0);
                }
                sendMail(det.notice_email, list);
                _callback(null);
            });
        }, function (err) {
            callback && callback(err);
        });
    });
};
