var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var sequelize = require('../model/connect').sequelize;
var async = require('async');

exports.create = function (option, callback) {
    db.quick_recruit_invite.create(option).then(function (invite) {
        callback(null, invite);
    }).catch(function (e) {
        callback(e);
    });
};

exports.update = function (option, where, callback) {
    db.quick_recruit_invite.update(option, {
        where: where
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

exports.getOneByOption = function (option, callback) {
    db.quick_recruit_invite.findOne({
        where: option
    }).then(function (invite) {
        callback(null, invite);
    }).catch(function (e) {
        callback(e);
    });
};
/**
 * 普通用户查询快招邀请列表
 * @param option
 * @param cb
 * @returns {*}
 */
exports.getListByUser = function (option, cb) {
    if (!option || !option.timestamp) {
        return cb('no timestamp');
    }
    var page = option.page,
        timestamp = option.timestamp,
        status = option.status,
        user_id = option.user_id,
        no_count = option.no_count,
        sql = "";

    async.parallel([
        function (callback) {
            if (status == 2) {
                sql = "SELECT a.*,b.`channel_type`, b.`type`, b.`parent_type`, b.`name` as `job_name`, c.`name` as `company_name`, b.`city`, b.`min_payment`,b.`max_payment`,c.`avatar`, b.`workdays`,d.phone as hr_phone,d.notice_email as hr_email ";
            } else {
                sql = "SELECT a.*, b.`channel_type`, b.`type`, b.`parent_type`, b.`name` as `job_name`, c.`name` as `company_name`, b.`city`, b.`min_payment`,b.`max_payment`,c.`avatar`, b.`workdays` ";
            }
            sql += "FROM `quick_recruit_invite` a " +
                "LEFT JOIN `job` b ON b.`jid`=a.`job_id` " +
                "LEFT JOIN `company` c ON c.`cid`=a.`company_id` ";
            if (status == 2) {
                sql += "LEFT JOIN `employer` d ON d.`user_id`=a.`employer_user_id` ";
            }
            sql += "WHERE a.`status` = :status AND a.`create_time` <= :timestamp AND a.`user_id` = :user_id " +
                "ORDER BY a.`create_time` DESC " +
                "LIMIT :offset,10";
            sequelize.query(sql, {
                replacements: {
                    user_id: user_id,
                    status: status,
                    timestamp: timestamp,
                    offset: (page - 1) * 10
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (invites) {
                callback(null, invites);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            if (no_count) {
                return callback(null, 1);
            }
            var sql = "SELECT COUNT(*) as `count` FROM `quick_recruit_invite` WHERE `status` = :status AND `create_time` <= :timestamp AND `user_id` = :user_id ";
            sequelize.query(sql, {
                replacements: {
                    status: status,
                    user_id: user_id,
                    timestamp: timestamp
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (count) {
                callback(null, count[0]['count']);
            }).catch(function (err) {
                callback(err);
            });
        }], function (err, results) {
        if (err) {
            return cb(err);
        }
        if (no_count) {
            return cb(null, {
                invites: results[0]
            });
        }
        cb(null, {
            invites: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};

/**
 * hr用户查询快招邀请列表
 * @param option
 * @param cb
 * @returns {*}
 */
exports.getListByEmployer = function (option, cb) {
    if (!option || !option.timestamp) {
        return cb('no timestamp');
    }
    var page = option.page,
        timestamp = option.timestamp,
        status = option.status,
        employer_user_id = option.employer_user_id,
        no_count = option.no_count,
        sql = "";

    async.parallel([
        function (callback) {
            sql += "SELECT a.*, b.`type`, b.`parent_type`, b.`name` as `job_name`, c.`name`, c.`phone`, c.`email`, c.`male`, c.`work_state`, c.`avatar`, c.`education_detail`,d.`id` as qid " +
                "FROM `quick_recruit_invite` a " +
                "LEFT JOIN `job` b ON b.`jid`=a.`job_id` " +
                "LEFT JOIN `resume` c ON c.`rid`=a.`resume_id` AND c.`version` = a.`version` " +
                "LEFT JOIN `quick_recruit` d ON d.`resume_id`=a.`resume_id` and d.`version` = a.`version` " +
                "WHERE a.`status` = :status AND a.`create_time` <= :timestamp  AND a.`employer_user_id` = :employer_user_id " +
                "ORDER BY a.`create_time` DESC " +
                "LIMIT :offset,10";
            sequelize.query(sql, {
                replacements: {
                    status: status,
                    employer_user_id: employer_user_id,
                    timestamp: timestamp,
                    offset: (page - 1) * 10
                },
                type: sequelize.QueryTypes.SELECT
            }).then(function (invites) {
                callback(null, invites);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            if (no_count) {
                return callback(null, 1);
            }
            var sql = "SELECT COUNT(*) as `count` FROM `quick_recruit_invite` WHERE `status` = :status AND `create_time` <= " + timestamp + " AND `employer_user_id` = :employer_user_id ";
            sequelize.query(sql, {
                replacements: {status: status, employer_user_id: employer_user_id},
                type: sequelize.QueryTypes.SELECT
            }).then(function (count) {
                callback(null, count[0]['count']);
            }).catch(function (err) {
                callback(err);
            });
        }], function (err, results) {
        if (err) {
            return cb(err);
        }
        if (no_count) {
            return cb(null, {
                invites: results[0]
            });
        }
        cb(null, {
            invites: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};