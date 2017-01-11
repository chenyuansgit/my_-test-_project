var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var proxy = require("../proxy/index");
var logger = require("../common/log").logger("schedule");
var solr = require("../solr/index").models;


/**
 * 批量过期7天内没响应的快招邀请
 */
exports.expiredInivtes = function () {
    var start_time = +new Date;
    var opt = {
        where: {
            status:1,
            create_time:{$lt: (+new Date - 7*24*3600*1000)}
        }
    };

    db.quick_recruit_invite.update({status:4},opt).then(function (rows) {
        logger.info("Expired QuickRecruitInvites schedule : {status: SUCCESS, size: " + rows[0] + ", cost:" + (+new Date - start_time) + "ms" + "}");
    }).catch(function (e) {
        logger.error(e);
    });


};