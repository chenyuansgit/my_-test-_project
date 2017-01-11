var logger = require("../../common/log").logger("index");
var fileUpUtil = require("../../common/file_upload_util");
var md5 = require("md5");
var resp_status_builder = require('../../common/response_status_builder.js');

exports.upToken = function (req, res) {

    try {
        var mediaType = req.query.mediaType;
        //   var uid = req.query.uid;
        var upToken = fileUpUtil.upToken(mediaType,1);

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
            resp_status_builder(10010,'no hash or key return from qiniu');
        }
    } catch (err) {
        logger.error(err);
        resp_status_builder(10005);
    }
};

exports.imgUpload = function(req,res){
    var option = req.body.option || {},admin_name = res.locals.admin;
    var url = option.url || '', keyString = admin_name;
    var key = md5(keyString)+"/"+md5(+new Date)+".png";
    if(!url || !key){
        return res.json(resp_status_builder(10002));
    }
    fileUpUtil.uploadRemoteFile(url,key,function(err,imgData){
        if(err){
            logger.error(err);
            return res.json(resp_status_builder.build(10010,"upload failed"));
        }
        var imgUrl = "http://image.internbird.com/"+imgData.key;
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms',{
            url : imgUrl
        }));
    });
};

exports.imgUploadPage = function(req,res){
    res.render("others/imgUpload");
};