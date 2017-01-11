var solr = require("./solr").client;
var logger = require("../common/log").logger("index");
var sequelize = require('../model/connect').sequelize;


//删除搜索人才库简历(当简历status不等于1或者关闭快招时)
function deleteById(uid, callback) {
    solr.resume.deleteByID(uid, function (err, obj) {
        if (err) {
            logger.error(err);
        }
        callback && callback(err, obj);
    });
}
exports.deleteById = deleteById;


function addOrUpdate(resumes, callback) {
    solr.resume.add(resumes, function (err, obj) {
        if (err) {
            logger.error(err);
        }
        callback && callback(err, obj);
    });
}
exports.addOrUpdate = addOrUpdate;

exports.update = function (uid, callback) {
    var sql = "select rid,version,male,user_id,name,avatar,work_state,is_public,status,highest_degree_stage,intern_expect_cid,intern_expect_city,intern_expect_dur_type,intern_expect_position,intern_expect_position_type,intern_expect_days_type,intern_expect_min_payment,education_detail,self_desc,refresh_time from resume  where  user_id = :uid  order by version desc limit 1";
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            uid: uid
        }
    }).then(function (resume) {
        //console.log('oooooooooooo',resume[0].is_public, resume[0].status);

        if (resume && resume[0] && resume[0].is_public && resume[0].status == 1) {
            resume[0].is_public = undefined;
            resume[0].status = undefined;
            return addOrUpdate(resume[0], function (e, obj) {
                callback && callback(e, obj);
            });
        }
        deleteById(uid, function (e, obj) {
            callback && callback(e, obj);
        });
    }).catch(function (err) {
        logger.error(err);
        callback && callback(err);
    });
};


/**
 * 职位搜索
 * @param option
 * @param callback
 */
exports.queryResumes = function (option, callback) {
    var q = option.key || "*";
    if (option.page > 3000) {
        option.page = 1;
    }
    var sort_obj = {};
    if (option.sort == "time") {
        sort_obj.refresh_time = "desc";
    }
    if (option.intern_expect_min_payment && option.intern_expect_min_payment > 0) {
        sort_obj.intern_expect_min_payment = "asc";
    }
    var query = solr.resume.createQuery()
        .q(q)
        .start((option.page - 1) * option.size)
        .rows(option.size)
        .df("key")
        .qop("AND")
        .sort(sort_obj);

    if (option.work_state === 0 || option.work_state === '0' || (option.work_state >= 1 && option.work_state <= 3)) {
        query.matchFilter("work_state", option.work_state);
    }
    query.matchFilter("refresh_time", "[0 TO " + (option.timestamp || (+new Date)) + "]");

    if (option.avatar) {
        query.matchFilter("avatar", "*http*");
    }
    if (option.highest_degree_stage >= 1 && option.highest_degree_stage <= 4) {
        query.matchFilter("highest_degree_stage", "[" + option.highest_degree_stage + " TO 4]");
    }
    if (option.intern_expect_cid > 0) {
        query.matchFilter("intern_expect_cid", option.intern_expect_cid);
    }
    if (option.intern_expect_dur_type >= 1 && option.intern_expect_dur_type <= 4) {
        query.matchFilter("intern_expect_dur_type", "[" + option.intern_expect_dur_type + " TO 4]");
    }
    if (option.intern_expect_days_type >= 1 && option.intern_expect_days_type <= 5) {
        query.matchFilter("intern_expect_days_type", "[" + option.intern_expect_days_type + " TO 5]");
    }
    if (option.intern_expect_min_payment > 0) {
        query.matchFilter("intern_expect_min_payment", "[0 TO " + option.intern_expect_min_payment + "]");
    }
    if (option.intern_expect_position_type) {
        query.matchFilter("intern_expect_position_type", option.intern_expect_position_type);
    }
    solr.resume.search(query, function (err, resumes) {
        if (err) {
            logger.error(err);
            return callback(err);
        }
        callback(null, {
            resumes: resumes.response.docs,
            count: resumes.response.numFound,
            page: option.page > 1 ? option.page : 1,
            pages: resumes.response.numFound % 10 == 0 ? resumes.response.numFound / 10 : (parseInt(resumes.response.numFound / 10) + 1)
        });
    });
};

