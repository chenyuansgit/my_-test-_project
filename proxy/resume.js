var async = require('async');
var sequelize = require('../model/connect').sequelize;
var db = require('../model/index').models;
var solr = require('../solr/index').models;
var relation = require('./resume_job_rel');

//公司管理简历列表
exports.getListByCompany = function (option, cb) {
    if (!option || !option.job_user_id) {//公司下的职位
        return cb('no option or no job_user_id');
    }
    var status = option.status,
        job_user_id = option.job_user_id,
        job_id = option.job_id,
        timestamp = option.timestamp,
        page = option.page > 1 ? option.page : 1,
        read_type = option.read_type,
        transmitted = option.transmitted,
        marked = option.marked,
        interviewed = option.interviewed.toString(),
        recruit_type = option.recruit_type,
        sql = '';
    sql = " from resume a,resume_job_rel b,job c where c.user_id = " + job_user_id + "  and c.jid = b.job_id and a.rid = b.resume_id and a.version = b.version and b.status= '" + status + "' and b.create_time <= '" + timestamp + "'";
    if (job_id > 1) {
        sql += " and c.jid =" + job_id;
    }
    if (recruit_type) {
        sql += " and b.recruit_type =" + recruit_type;
    }
    if (status >= 1 && status <= 4) {
        sql += " and b.status = '" + status + "'";
    }
    if (status == 3 && (interviewed == '0' || interviewed == '1')) {
        if (interviewed == '0') {
            sql += " and b.interview_time >= '" + (+new Date) + "'";
        } else {
            sql += " and b.interview_time < '" + (+new Date) + "'";
        }
    }
    if (read_type === '0' || read_type === 0 || read_type === '1' || read_type === 1) {
        sql += " and b.read_type = '" + read_type + "'";
    }
    if (transmitted === '0' || transmitted === 0 || transmitted === '1' || transmitted === 1) {
        sql += " and b.transmitted = '" + transmitted + "'";
    }
    if (marked === '0' || marked === 0 || marked === '1' || marked === 1) {
        sql += " and b.transmitted = '" + marked + "'";
    }
    var countSql = "select count(*) " + sql;
    if (status == 3) {
        sql += " order by b.`interview_time` desc";
    } else {
        sql += " order by b.`create_time` desc";
    }
    if (page > 1) {
        sql += " limit " + (page - 1) * 10 + ",10";
    } else {
        sql += " limit 10";
    }
    async.parallel([
        function (callback) {
            sequelize.query("select a.`rid`, a.`name`, a.`phone`, a.`email`, a.`male`, a.`work_state`, a.`avatar`, a.`education_detail`, a.`user_id`, a.`create_time`, a.`version`, " +
                " c.`name` as `job_name`, b.`recruit_type`, " +
                " b.`resume_id`,b.`job_id`,b.`status`,b.`read_type`,b.`marked`,b.`transmitted`,b.`transmit_email`,b.interview_info,b.contact_info,b.improper_info,b.`create_time` as `delivery_time` " + sql, {type: sequelize.QueryTypes.SELECT}).then(function (resumes) {
                callback(null, resumes);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            if (option.no_count) {
                return callback(null, 0);
            }
            sequelize.query(countSql, {type: sequelize.QueryTypes.SELECT}).then(function (count) {
                callback(null, count[0]['count(*)']);
            }).catch(function (err) {
                callback(err);
            });
        }], function (err, results) {
        if (err) {
            return cb(err);
        }
        var data = {
            resumes: results[0],
            page: option.page > 1 ? option.page : 1
        };
        if (!option.no_count) {
            data.pages = results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1);
            data.count = results[1];
        }
        cb(null, data);
    });
};

/**
 * 根据uid或者rid获取最新版本的简历
 * @param uid
 * @param rid
 * @param callback
 */

function findLastResume(uid, rid, callback) {
    if (!uid && !rid) {
        callback("invalid params");
    }
    var ops = {
        where: {},
        order: "version DESC"
    };
    if (uid) {
        ops.where.user_id = uid;
    }
    if (rid) {
        ops.where.rid = rid;
    }
    db.resume.findOne(ops).then(function (resume) {
        callback(null, resume && resume.dataValues ? resume.dataValues : null);
    }).catch(function (err) {
        callback(err);
    });
}
exports.findLastResume = findLastResume;
/**
 *  获取某个版本简历
 * @param rid
 * @param version
 * @param callback
 */

function findOneByVersion(rid, version, callback) {
    if (!rid) {
        return callback("invalid params");
    }
    db.resume.findOne({
        where: {
            rid: rid,
            version: version || 0
        }
    }).then(function (resume) {
        callback(null, resume && resume.dataValues ? resume.dataValues : null);
    }).catch(function (err) {
        callback(err);
    });
}
exports.findOneByVersion = findOneByVersion;
/**
 * 修改所有版本简历
 * @param option
 * @param rid
 * @param callback
 */
exports.updateAllById = function (option, rid, callback) {
    if (!rid || !option) {
        return callback("invalid params");
    }
    db.resume.update(option, {
        where: {
            rid: rid
        }
    }).then(function (rows) {
        if (rows[0]) {//异步修改solr存储
            findLastResume(null, rid, function (e, resume) {
                if (!e && resume) {
                    solr.resume.update(resume.user_id);
                }
            });
        }
        callback(null, !rows[0] ? 0 : 1);
    }).catch(function (err) {
        callback(err);
    });
};
//筛选出education_detail中的最高学历
function getHighestEducation(education_detail) {
    try {
        var education = JSON.parse(education_detail), stage = '', recent_time = 0;
        if (!education.length) {
            return 0;
        }
        for (var i = 0, len = education.length; i < len; ++i) {
            if (education[i].start_time) {
                var time = parseInt(education[i].start_time.replace(/[.-]/g, '').substr(0, 6));
                if (time > recent_time) {
                    recent_time = time;
                    stage = education[i].stage.replace(/\+/g, '');
                }
            }
        }
        if (stage && recent_time) {
            if (stage.indexOf('博士') > -1) {
                return 4;
            } else if (stage.indexOf('硕士') > -1) {
                return 3;
            } else if (stage.indexOf('本科') > -1) {
                return 2;
            } else if (stage.indexOf('大专') > -1) {
                return 1;
            }
        }
        return 0;
    } catch (e) {
        return 0;
    }
}
/**
 * 修改某个版本简历
 * @param option
 * @param rid
 * @param version
 * @param callback
 */
exports.updateOneByVersion = function (option, rid, version, callback) {
    if (!rid || !option) {
        return callback("invalid params");
    }
    if (option.education_detail) {
        option.highest_degree_stage = getHighestEducation(option.education_detail);
    }
    db.resume.update(option, {
        where: {
            rid: rid,
            version: version
        }
    }).then(function (rows) {
        if (rows[0]) {//异步修改solr存储
            findOneByVersion(rid, version, function (e, resume) {
                if (!e && resume) {
                    solr.resume.update(resume.user_id);
                }
            });
        }
        callback(null, !rows[0] ? 0 : 1);
    }).catch(function (err) {
        callback(err);
    });
};
/**
 * 创建简历
 * @param option
 * @param callback
 */
exports.create = function (option, callback) {
    if (!option) {
        return callback("invalid params");
    }
    if (option.education_detail) {
        option.highest_degree_stage = getHighestEducation(option.education_detail);
    }
    db.resume.create(option).then(function (resume) {
        if (resume && resume.user_id) {
            solr.resume.update(resume.user_id);
        }
        callback(null, resume);
    }).catch(function (err) {
        callback(err);
    });
};
exports.findTalentResume = function (uid, employer_user_id, cb) {
    if (!uid || !employer_user_id) {
        return cb("invalid params");
    }
    async.parallel([
        function (callback) {
            findLastResume(uid, null, function (err, resume) {
                callback(err, resume && resume.dataValues ? resume.dataValues : (resume || {}));
            });
        },
        function (callback) {
            relation.getOneByOption({
                resume_user_id: uid,
                job_user_id: employer_user_id,
                recruit_type: 2
            }, function (err, resume_job_rel) {
                callback(err, resume_job_rel && resume_job_rel.dataValues ? resume_job_rel.dataValues : (resume_job_rel || null));
            });
        }
    ], function (e, results) {
        console.log(results);
        if (e) {
            return cb(e);
        }
        if (!results[0] || !results[0].is_public) {
            return cb(null, {});
        }
        if (!results[1] || !results[1].status || results[1].status == 1) {
            results[0].phone = results[0].phone ? (results[0].phone.toString().slice(0, 7) + '****') : '';
            results[0].email = results[0].email ? ('*******@' + results[0].email.split('@')[1]) : '';
        }
        results[0].status = (results[1] && results[1].status) ? results[1].status : 0;
        cb(null, results[0]);
    });
};
//公开简历搜索(solr搜索)
exports.search = function (option, cb) {
    var timestamp = option.timestamp, page = option.page, ava = option.ava, cid = option.cid, dt = option.dt, mp = option.mp, wk = option.wk, jt = option.jt, et = option.et, key = option.key;
    var opt = {
        timestamp: timestamp,
        page: page,
        sort: "time",
        size: 10
    };
    if (key) {
        opt.key = key;
    }
    if (ava >= 1) {//有无头像
        opt.avatar = 1;
    }
    if (jt != 0) {//职位类型
        opt.intern_expect_position_type = jt;
    }
    if (et >= 1 && et <= 4) {//最高学历要求
        opt.highest_degree_stage = et;
    }
    if (cid > 0) {//城市id
        opt.intern_expect_cid = cid;
    }
    if (dt >= 1 && dt <= 4) {//实习周期
        opt.intern_expect_dur_type = dt;
    }
    if (wk >= 1 && wk <= 5) {//每周工作天数类型
        opt.intern_expect_days_type = wk;
    }
    if (mp > 0) {//最低日薪资
        opt.intern_expect_min_payment = mp;
    }
    solr.resume.queryResumes(opt, function (err, data) {
        cb(err, data);
    });
};
//公开简历列表,暂时不支持搜索(mysql查询)
exports.findTalentResumesList = function (option, cb) {
    var timestamp = option.timestamp, page = option.page, ava = option.ava, cid = option.cid, uids = option.uids, uid = option.uid, dt = option.dt, mp = option.mp, ws = option.ws, wk = option.wk, jt = option.jt, et = option.et, sql = '', countSql = '';
    sql += " from (select rid,max(version) as max_version from resume group by rid)a,(select rid,version,status,is_public,male,user_id,name,avatar,work_state,highest_degree_stage,intern_expect_cid,intern_expect_city,intern_expect_dur_type,intern_expect_position_type,intern_expect_position,intern_expect_days_type,intern_expect_min_payment,education_detail,intern_expect,self_desc,refresh_time from resume)b where a.rid = b.rid and a.max_version = b.version and b.is_public = 1 and b.status = 1 and b.refresh_time< :timestamp ";
    if (uid) {
        sql += "and b.user_id != :uid ";
    }
    if (uids && uids.length) {
        sql += "and b.user_id in (" + uids.join(',') + ") ";
    }
    if (ava >= 1) {
        sql += "and b.avatar != '' and b.avatar !='undefined' ";
    }
    if (jt) {
        sql += "and intern_expect_position_type like :jt ";
    }
    if (et >= 1 && et <= 4) {//最高学历要求
        sql += "and highest_degree_stage >= :et ";
    }
    if (cid > 0) {//期望工作城市id
        sql += "and intern_expect_cid = :cid ";
    }
    if (dt >= 1 && dt <= 4) {//实习周期要求1-4
        sql += "and intern_expect_dur_type >= :dt ";
    }
    /*    if (ws >= 0 && ws <= 3) {
     sql += "and work_state = :ws ";
     }*/
    if (wk >= 1 && wk <= 5) {//每周天数类型
        sql += "and intern_expect_days_type >= :wk ";
    }
    if (mp > 0) {//最低日薪资
        sql += "and intern_expect_min_payment <= :mp ";
    }
    countSql = "select count(*) as count" + sql;
    sql = "select b.* " + sql + "order by b.refresh_time desc limit :offset,10";
    async.parallel([
        function (callback) {
            sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    offset: (page - 1) * 10,
                    uid: uid,
                    jt: "%" + jt + "%",
                    et: et,
                    cid: cid,
                    dt: dt,
                    wk: wk,
                    ws: ws,
                    mp: mp
                }
            }).then(function (resumes) {
                callback(null, resumes);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            if (option.no_count) {
                return callback(null, 1);
            }
            sequelize.query(countSql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    offset: (page - 1) * 10,
                    uid: uid,
                    jt: "%" + jt + "%",
                    et: et,
                    cid: cid,
                    dt: dt,
                    wk: wk,
                    ws: ws,
                    mp: mp
                }
            }).then(function (count) {
                callback(null, count[0].count);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (err, results) {
        if (err) {
            return cb(err);
        }
        if (option.no_count) {
            return cb(null, {
                resumes: results[0],
                page: option.page > 1 ? option.page : 1
            });
        }
        cb(null, {
            resumes: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};


//后台简历查询
exports.getAllList = function (option, cb) {
    var timestamp = option.timestamp, page = option.page, lt = option.lt, key = option.key, operation = option.operation, sql = '', countSql = '';
    sql += "select b.*,d.invites,e.accepts from (select rid,max(version) as max_version from resume group by rid)a,(select rid,version,status,is_public,male,user_id,name,intern_expect_position_type,intern_expect_position,avatar,work_state,education_detail,email,phone,update_time ,c.count from resume left join (select resume_id ,count(*) as count from resume_job_rel group by resume_id)c on resume.rid = c.resume_id)b left join (select count(*) as invites,user_id from quick_recruit_invite group by user_id) d on d.user_id = b.user_id left join (select count(*) as accepts,user_id from quick_recruit_invite where status = 2 group by user_id) e on e.user_id = b.user_id where a.rid = b.rid and a.max_version = b.version and b.update_time< :timestamp ";

    if (operation === 0 || operation === '0') {
        sql += "and b.intern_expect_position_type ='' ";
    }
    if (operation >= 1) {
        sql += "and b.intern_expect_position_type !='' ";
    }
    if (key) {
        sql += "and ( b.name like :key or b.education_detail like :key) ";
    }
    if (lt == 'time') {
        sql += "order by b.update_time desc limit :offset,10";
    } else if (lt == 'deliveries') {
        sql += "order by b.count desc limit :offset,10";
    } else if (lt == 'invites') {
        sql += "order by d.invites desc limit :offset,10";
    } else {
        sql += "order by e.accepts desc limit :offset,10";
    }
    countSql += "select count(*) as count from (select rid,max(version) as max_version from resume group by rid)a,(select rid,name,status,version,education_detail, intern_expect_position_type,update_time from resume)b  where a.rid = b.rid and a.max_version = b.version and b.update_time< :timestamp";
    if (operation === 0 || operation === '0') {
        countSql += " and b.intern_expect_position_type ='' ";
    }
    if (operation >= 1) {
        countSql += " and b.intern_expect_position_type !='' ";
    }
    if (key) {
        countSql += " and ( b.name like :key or b.education_detail like :key) ";
    }
    async.parallel([
        function (callback) {
            sequelize.query(sql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    key: "%" + key + "%",
                    offset: (page - 1) * 10
                }
            }).then(function (resumes) {
                callback(null, resumes);
            }).catch(function (err) {
                callback(err);
            });
        }, function (callback) {
            if (option.no_count) {
                return callback(null, 1);
            }
            sequelize.query(countSql, {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    key: "%" + key + "%",
                    offset: (page - 1) * 10
                }
            }).then(function (count) {
                callback(null, count[0].count);
            }).catch(function (err) {
                callback(err);
            });
        }
    ], function (err, results) {
        if (err) {
            return cb(err);
        }
        if (option.no_count) {
            return cb(null, {
                resumes: results[0],
                page: option.page > 1 ? option.page : 1
            });
        }
        cb(null, {
            resumes: results[0],
            total: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: option.page > 1 ? option.page : 1,
            count: results[1]
        });
    });
};





