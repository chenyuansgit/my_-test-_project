var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var jobStats = require('./stats_job');
var async = require('async');
var employer = require('./employer');
var quick_recruit_invite = require('./quick_recruit_invite');


var safe_contacting_time = 3;//待沟通持续时间(在这之后,hr的联系方式将可以被用户查看)

var redis_key_resume_job_rel = "resume_job_rel_";
var redis_key_user_job_rel = "user_job_rel_";
var redis_key_job_resume_rel = "job_resume_rel_";
var redis_key_user_delivery_times = "delivery_times_";


exports.getJobByUid = function (uid, callback) {
    cache.zrange(redis_key_user_job_rel + uid, 0, -1, function (e, jid) {
        if (e) {
            return callback(e);
        }
        callback(null, jid || []);
    });
};


exports.count = function (option, callback) {
    db.resume_job_rel.count(option).then(function (count) {
        callback(null, count[0]);
    }).catch(function (e) {
        callback(e);
    });
};

function getOneByOption(option, callback) {
    db.resume_job_rel.findOne({
        where: option
    }).then(function (resume_job_rel) {
        callback(null, resume_job_rel);
    }).catch(function (err) {
        callback(err);
    });
}
exports.getOneByOption = getOneByOption;
exports.countByUid = function (uid, timestamp, callback) {
    db.resume_job_rel.count({
        where: {
            resume_user_id: uid,
            create_time: {
                $gt: timestamp
            }
        }
    }).then(function (count) {
        callback(null, count || 0);
    }).catch(function (err) {
        callback(err);
    });
};
//获取单个投递关系的详情
exports.getDeliveryDetail = function (uid, jid, callback) {
    checkUserRepeatDelivering(uid, jid, function (err, score) {
        if (err) {
            return callback(err);
        }
        if (!score) {
            return callback(null, {});
        }
        async.parallel([
            function (callback) {
                getOneByOption({
                    resume_user_id: uid,
                    job_id: jid
                }, function (e, resume_job_rel) {
                    callback(e, resume_job_rel);
                });
            },
            function (callback) {
                quick_recruit_invite.getOneByOption({
                    user_id: uid,
                    job_id: jid
                }, function (e, invite) {
                    callback(e, invite);
                });
            }
        ], function (error, results) {
            if (error) {
                return callback(err);
            }
            if (!results && !results[0]) {
                return callback(null, {});
            }
            var contact_info = {
                update_time: results[0].contact_info ? JSON.parse(results[0].contact_info).update_time : ''
            };
            var data = {
                interview_info: results[0].interview_info,
                improper_info: results[0].improper_info,
                recruit_type: results[0].recruit_type,
                create_time: results[0].create_time,
                status: results[0].status
            };
            if (results[0].status == 1) {
                data.contact_info = '';
                return callback(null, data);
            }
            if (results[0].recruit_type == 2 && results[0].status > 1) {
                contact_info.update_time = results[0].create_time;
                data.create_time = results[1].create_time;
            }
            //如果超过待沟通时间,hr的联系方式被展示在前端
            if (contact_info.update_time && (+new Date - contact_info.update_time) / (24 * 60 * 60 * 1000) > safe_contacting_time) {
                return employer.getOneById(results[0].job_user_id, function (e1, emp) {
                    if (e1) {
                        return callback(e1);
                    }
                    contact_info.hr_name = emp.nick_name || '';
                    contact_info.hr_email = emp.notice_email || '';
                    data.contact_info = contact_info.update_time ? JSON.stringify(contact_info) : '';
                    callback(null, data);
                });
            }
            data.contact_info = contact_info.update_time ? JSON.stringify(contact_info) : '';
            callback(null, data);
        });
    });
};


//获取现在时间到今晚24:00的秒数
function getLastTime(now_time) {
    var date = new Date(now_time);
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);
    return parseInt((date.getTime() - now_time + 1) / 1000);
}

exports.create = function (option, callback) {
    db.resume_job_rel.create(option).then(function (relation) {
        cache.zadd(redis_key_user_job_rel + relation.resume_user_id, relation.create_time, relation.job_id);
        cache.zadd(redis_key_job_resume_rel + relation.job_id, relation.create_time, relation.resume_id);
        cache.zadd(redis_key_resume_job_rel + relation.resume_id, relation.create_time, relation.job_id);
        updateDeliveryTimes(relation.resume_user_id);
        // 该职位下简历数+1
        jobStats.incrResumeNum(relation.job_id);
        callback(null, relation);
    }).catch(function (e) {
        callback(e);
    });
};

/**
 * 获取用户当日简历投递次数
 * @param uid
 * @param callback
 */
exports.getDeliveryTimes = function (uid, callback) {
    cache.get(redis_key_user_delivery_times + uid, function (err, times) {
        if (err) {
            return callback && callback(err);
        }
        callback && callback(null, times || 0);
    });
};
/**
 * 更新用户当日简历投递次数
 * @param uid
 * @param callback
 */
function updateDeliveryTimes(uid, callback) {
    cache.incr(redis_key_user_delivery_times + uid, function (err) {
        if (!err) {
            cache.expire(redis_key_user_delivery_times + uid, getLastTime(+new Date));
        }
        callback && callback(err);
    });
}
exports.updateDeliveryTimes = updateDeliveryTimes;
/**
 *         投递
 * @param rid
 * @param jid
 * @param callback
 */
exports.checkRepeatDelivering = function (rid, jid, callback) {
    cache.zscore(redis_key_resume_job_rel + rid, jid, function (err, score) {
        if (err) {
            return callback(err);
        }
        callback(null, score);
    });
};

/**
 *         投递
 * @param uid
 * @param jid
 * @param callback
 */
function checkUserRepeatDelivering(uid, jid, callback) {
    cache.zscore(redis_key_user_job_rel + uid, jid, function (err, score) {
        if (err) {
            return callback(err);
        }
        callback(null, score);
    });
}
exports.checkUserRepeatDelivering = checkUserRepeatDelivering;

/**
 * 企业用户删除投递简历
 * @param rid 数组
 * @param jid
 * @param callback
 */
exports.deleteRel = function (rid, jid, callback) {
    db.resume_job_rel.update({status: 9}, {
        where: {
            resume_id: rid,
            job_id: jid,
            status: 4
        }
    }).then(function (resume_job_rel) {
        if (!resume_job_rel[0]) {
            return callback(null, resume_job_rel);
        }

        for (var i = 0; i < rid.length; i++) {
            cache.zrem(redis_key_job_resume_rel + jid, rid[i]);
        }

        callback(null, resume_job_rel);
    }).catch(function (e) {
        callback(e);
    });

};