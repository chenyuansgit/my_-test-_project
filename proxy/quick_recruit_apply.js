var db = require('../model/index').models;
var cache = require('../cache/index').cache;

/**
 * 是否已申请过该期快招
 * @param uid
 * @param term_id
 * @param callback
 */
exports.hasApplied = function (uid, term_id, callback) {
    db.quick_recruit_apply.findOne({
        where:{
            user_id:uid,
            term_id:term_id
        }
    }).then(function (apply) {
        callback(null, apply);
    }).catch(function (e) {
        callback(e);
    });
};


/**
 * 获取某人最新的快招申请
 * @param uid
 * @param callback
 */
exports.myLastApply = function (uid, callback) {
    if (!uid || uid <= 0) {
        callback("invalid uid");
    }
    var option = {
        where: {
            user_id: uid,
            status: 1
        },
        order: "term_id DESC",
        limit: 1
    };
    db.quick_recruit_apply.findOne(option).then(function (quick_recruit_apply) {
        callback(null, quick_recruit_apply);
    }).catch(function (e) {
        callback(e);
    });

};

exports.update = function (option, callback) {
    db.quick_recruit_apply.update(option, {
        where: {
            id: option.id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};


exports.findOneById = function (id, callback) {
    db.quick_recruit_apply.findOne({
        where: {
            id: id
        }
    }).then(function (quick_recruit_apply) {
        callback(null, quick_recruit_apply);
    }).catch(function (e) {
        callback(e);
    });
};

exports.myApplyList = function (uid, callback) {
    if (!uid || uid <= 0) {
        callback("invalid uid");
    }
    var option = {
        where: {
            user_id: uid
        },
        order: "term_id DESC"
    };
    db.quick_recruit_apply.findAll(option).then(function (quick_recruit_applies) {
        callback(null, quick_recruit_applies);
    }).catch(function (e) {
        callback(e);
    });
};


