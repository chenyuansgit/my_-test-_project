var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var async = require('async');
var id_reg = require("../../common/utils/reg").number;
//获取单个职位的投递收藏情况
exports.detailPage = function (req, res) {
    var det_id = req.params.det_id, uid = res.locals.uid;
    if (!id_reg.test(det_id)) {
        return res.render('error/404');
    }
    async.parallel([
        function (callback) {
            if (!uid) {
                return callback(null, 0);
            }
            proxy.resume_det_rel.isDelivery(uid, det_id, function (e, resume_det_rel) {
                callback(null, resume_det_rel ? 1 : 0);
            });
        }, function (callback) {
            if (!uid) {
                return callback(null, 0);
            }
            proxy.favorite.isFavorite(uid, 'det', det_id, function (e, score) {
                callback(e, score >= 1 ? 1 : 0);
            });
        }, function (callback) {
            proxy.det.findOneById(det_id, function (e, det) {
                callback(e, det);
            });
        }
    ], function (err, results) {
        if (err) {
            logger.error(err);
            return res.render('error/404');
        }
        //增加一个包打听职位阅读量
        proxy.stats_det.incrViewNum(det_id);

        res.render("det/detail", {
            isDelivered: results[0],
            isFavorite: results[1],
            det: results[2]
        });
    });
};