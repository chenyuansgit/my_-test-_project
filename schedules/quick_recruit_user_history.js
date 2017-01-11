var proxy = require("../proxy/index");
var logger = require("../common/log").logger("schedule");
var sequelize = require('../model/connect').sequelize;
var push_template = require('../common/push_template');

exports.doBgService = function (size) {
    proxy.quick_recruit_user_history.rpop(size, function (err, uids) {
        logger.info(uids);
        for (var m = 0, l = uids.length; m < l; ++m) {
            proxy.quick_recruit_user_history.lrange(uids[m], 100, function (e, visitors, user_id) {
                var sql = "insert into `stats_user_qr_history` (`user_id`,`company_id`,`company_name`,`visit_time`) values ";
                for (var i = 0, len = visitors.length; i < len; ++i) {
                    var history = JSON.parse(visitors[i]);
                    sql += "(" + history.uid + "," + history.cid + ",'" + history.name + "'," + history.visit_time + ")";
                    if (i < len - 1) {
                        sql += ",";
                    }
                }
                if (!visitors.length) {
                    return false;
                }
               // logger.info(visitors);
                var company_name = JSON.parse(visitors[visitors.length - 1]).name;
                sequelize.query(sql, {type: sequelize.QueryTypes.INSERT}).then(function () {
                    updateVisitorInfo(user_id);
                    updateVisitorNum(user_id);
                    proxy.quick_recruit_user_history.ltrim(user_id,size);
                    //推送给客户端一条信息
                    proxy.push.toSingleByUid(user_id,push_template.newVisitor(company_name));
                }).catch(function (e) {
                    logger.error(e);
                });
            });
        }
    });
};

exports.refreshTodayVisitor = function(){
    proxy.quick_recruit_user_history.getVisitedOnes(function(err,uids){
        for (var i = 0, l = uids.length; i < l; ++i) {
            updateVisitorNum(uids[i].user_id);
        }
    });
};


//更新最近访客记录
function updateVisitorInfo(uid, callback) {
    proxy.quick_recruit_user_history.getRecentVisitor(uid, function (e, vis) {
        proxy.quick_recruit_user_info.updateOneById({recent_visitor: JSON.stringify(vis)}, uid, function (err) {
            callback && callback(err);
        });
    });
}
//更新今日访客记录
function updateVisitorNum(uid, callback) {
    proxy.quick_recruit_user_history.getTodayVisitorNum(uid, function (e, num) {
        proxy.quick_recruit_user_info.updateOneById({today_visitor_num: num}, uid, function (err) {
            callback && callback(err);
        });
    });
}




