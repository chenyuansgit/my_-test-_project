var logger = require("../../common/log").logger("index");
var fileUpUtil = require("../../common/file_upload_util");
var md5 = require("md5");
var resp_status_builder = require('../../common/response_status_builder.js');

exports.upToken = function (req, res) {

    try {
        var mediaType = req.query.mediaType;
        //   var uid = req.query.uid;
        var upToken = fileUpUtil.upToken(mediaType);

        // var key = md5(uid) + '/' + md5(+new Date) + ".png";
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            uptoken: upToken
        }));
    } catch (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            uptoken: null
        }));
    }
};


exports.callback = function (req, res) {
    try {
        var hash = req.body.hash;
        var key = req.body.key;
        var size = req.body.size;
        var width = req.body.width;
        var height = req.body.height;
        if (hash && key) {
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                hash: hash,
                key: key,
                size: size,
                width: width,
                height: height
            }));
        } else {
            res.json(resp_status_builder.build(10010, 'no hash or key return from qiniu'));
        }
    } catch (err) {
        logger.error(err);
        res.json(resp_status_builder.build(10005));
    }
};