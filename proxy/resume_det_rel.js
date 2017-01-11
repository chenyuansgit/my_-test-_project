var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var async = require('async');
var sequelize = require('../model/connect').sequelize;

var resume_job_rel = require('./resume_job_rel');

var redis_key_resume_det_rel = "resume_det_rel_";//用户包打听投递关系


//更新投递关系
function updateDeliveryRel(user_id, det_id, delivery_time, callback) {
    cache.zadd(redis_key_resume_det_rel + user_id, delivery_time, det_id, function (err) {
        callback && callback(err);
    });
}
//创建新的包打听投递关系
exports.create = function (option, callback) {
    db.resume_det_rel.create(option).then(function (resume_det_rel) {
        if (resume_det_rel) {
            updateDeliveryRel(resume_det_rel.resume_user_id, resume_det_rel.det_id, resume_det_rel.create_time);
            resume_job_rel.updateDeliveryTimes(resume_det_rel.resume_user_id);
        }
        callback(null, resume_det_rel);
    }).catch(function (e) {
        callback(e);
    });
};
//判断是否投递
exports.isDelivery = function (user_id, det_id, callback) {
    cache.zscore(redis_key_resume_det_rel + user_id, det_id, function (err, score) {
        callback && callback(err, score);
    });
};
exports.getOneByOption = function (option, callback) {
    db.resume_det_rel.findOne({
        where: option
    }).then(function (resume_det_rel) {
        callback(null, resume_det_rel);
    }).catch(function (err) {
        callback(err);
    });
};

exports.list = function (uid, page, channel_type, timestamp, callback) {
    var replacements_det = {
        uid: uid,
        timestamp: timestamp,
        offset: (page - 1) * 10
    };
    var replacement_num = {
        uid: uid,
        timestamp: timestamp
    };
    if(channel_type){
        replacements_det.channel_type = channel_type;
        replacement_num.channel_type = channel_type;
    }
    async.parallel([
        function (_callback) {
            sequelize.query("select a.resume_user_id,a.create_time as delivery_time,b.id as jid,b.name,b.company_name,b.company_avatar,b.city,b.city_id,b.workdays,b.max_payment,b.min_payment,b.channel_type from resume_det_rel a,detective_job b where a.det_id = b.id "+(channel_type?'and  b.channel_type = :channel_type':'')+" and  a.create_time < :timestamp and a.resume_user_id = :uid order by a.create_time desc limit :offset,10", {
                type: sequelize.QueryTypes.SELECT,
                replacements: replacements_det
            }).then(function (relations) {
                _callback(null, relations);
            }).catch(function (e) {
                _callback(e);
            });
        }, function (_callback) {
            sequelize.query("select count(*) as count from resume_det_rel where "+(channel_type?'recruit_type=:channel_type  and ':'')+"create_time < :timestamp and resume_user_id = :uid", {
                type: sequelize.QueryTypes.SELECT,
                replacements:replacement_num
            }).then(function (count) {
                _callback(null, count[0].count);
            }).catch(function (e) {
                _callback(e);
            });
        }
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            dets: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: page,
            count: results[1]
        });
    });
};












