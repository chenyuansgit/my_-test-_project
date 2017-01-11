var db = require('../model/index').models;
var cache = require('../cache/index').cache;

var redis_key_qr_term_online = "qr_term_online" ;
/**
 * 获取在线的快招期数
 * @param callback
 */
exports.findOneOnline = function (callback) {
    cache.get(redis_key_qr_term_online, function (err, term) {
        if(err) {
            return callback(err);
        }
        var now = +new Date;
        if(term) {
            term = JSON.parse(term);
            if(term.start_time < now && now < term.end_time) {
                return callback(null, term);
            } else {
                return callback(null, {});
            }
        } else {
            var option = {
                where: {
                    status:1,
                    start_time:{$lt: now},
                    end_time: {$gt: now}
                },
                order:"start_time DESC"
            };
            db.quick_recruit_term.findOne(option).then(function (quick_recruit_term) {
                if(quick_recruit_term) {
                    insertCache(quick_recruit_term.dataValues);
                    callback(null ,quick_recruit_term.dataValues);
                } else {
                    callback(null ,{});
                }
            }).catch(function (e) {
                callback(e);
            });
        }
    });
};

function insertCache(quick_recruit_term) {
    var now = +new Date;
    if(now < quick_recruit_term.start_time || now > quick_recruit_term.end_time) {
        return ;
    }
    cache.set(redis_key_qr_term_online, JSON.stringify(quick_recruit_term), function (err) {
        if(!err) {
            var expire = quick_recruit_term.end_time - now;
            cache.expire(redis_key_qr_term_online, Math.ceil(expire/1000));
        }
    });
}

exports.update = function (option, callback) {
    db.quick_recruit_term.update(option,{
        where:{
            term_id:option.term_id
        }
    }).then(function (rows) {
        cache.del(redis_key_qr_term_online);
        callback(null ,rows);
    }).catch(function (e) {
        callback(e);
    });
};

