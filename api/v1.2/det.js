var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var async = require('async');
var resp_status_builder = require('../../common/response_status_builder.js');
var loginStatusValidate = require("../../middlewares/login").loginStatusValidate;
var id_reg = require("../../common/utils/reg").number;


//获取单个职位的投递收藏情况
exports.getStatus = function (req, res) {
    var det_id = req.params.det_id, uid = req.headers['uid'], auth_token = req.headers['auth_token'], jobDetail;
    if (!id_reg.test(det_id)) {
        return res.json(resp_status_builder.build(10002, '请求参数错误'));
    }
    loginStatusValidate(uid, auth_token, function (code) {
        async.parallel([
            function (callback) {
                if (code) {
                    return callback(null, 0);
                }
                proxy.resume_det_rel.isDelivery(uid, det_id, function (e, resume_det_rel) {
                    callback(null, resume_det_rel ? 1 : 0);
                });
            }, function (callback) {
                if (code) {
                    return callback(null, 0);
                }
                proxy.favorite.isFavorite(uid, 'det', det_id, function (e, score) {
                    callback(e, score >= 1 ? 1 : 0);
                });
            }, function (callback) {
                proxy.det.findOneById(det_id, function (e, det) {
                    if (e || !det) {
                        return callback(e, null);
                    }
                    jobDetail = {
                        jid: det.id,
                        state: det.state,
                        name: det.name,
                        redirect_uri: det.redirect_uri || '',
                        company_name: det.company_name,
                        company_avatar: det.company_avatar,
                        address: det.address
                    };
                    callback(null, jobDetail);
                });
            }
        ], function (err, results) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10005, '服务器错误'));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                isDelivered: results[0],
                isFavorite: results[1],
                det: results[2]
            }));
        });
    });
};