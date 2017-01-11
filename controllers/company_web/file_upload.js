var logger = require("../../common/log").logger("index");
var fileUpUtil = require("../../common/file_upload_util");
var md5 = require("md5");

exports.upToken = function (req, res) {

    try {
        var mediaType = req.query.mediaType;
        //   var uid = req.query.uid;
        var upToken = fileUpUtil.upToken(mediaType);

        // var key = md5(uid) + '/' + md5(+new Date) + ".png";
        res.json({
            'uptoken': upToken
        });
    } catch (err) {
        logger.error(err);
        res.json({
            'uptoken': null
        });
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
            res.json({
                hash: hash,
                key: key,
                size: size,
                width: width,
                height: height
            });
        } else {
            res.json({
                status: 10010,
                desc: 'no hash or key return from qiniu'
            })
        }
    } catch (err) {
        logger.error(err);
        res.json({
            status: 10005,
            desc: 'server error'
        });
    }
};