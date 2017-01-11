var qiniu = require('qiniu');
var config = require("../config_default").config;
var myhttp = require('./myhttp');

qiniu.conf.ACCESS_KEY = config.fileUpload.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.fileUpload.SECRET_KEY;

var BUCKET_NAME = {
    image: 'internbird-image-0',
    file: 'internbird-file-0'
};


function upToken(mediaType, needExtraInfo) {
    var bucketname;
    if (mediaType == 'image') {
        bucketname = BUCKET_NAME.image;
    } else {
        bucketname = BUCKET_NAME.file;
    }
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    if (needExtraInfo) {
        //putPolicy.callbackUrl = "http://" + config.host+(config.port == '80'?"":(":"+config.port)) + "/api/upload/callback";
        putPolicy.callbackUrl = "http://www.internbird.com/api/upload/callback";
        putPolicy.callbackBody = "name=$(fname)&hash=$(etag)&bucket=$(bucket)&key=$(key)&size=$(fsize)&height=$(imageInfo.height)&width=$(imageInfo.width)";
    }
    //putPolicy.returnUrl = "http://www.zhwnl.cn/api/login";
    //putPolicy.returnBody  = "name=$(fname)&hash=$(etag)&bucket=${bucket}&key=${key}&size={fsize}";
    //putPolicy.asyncOps = asyncOps;
    //putPolicy.expires = expires;

    return putPolicy.token();
}
exports.upToken = upToken;
function uploadBuffer(body, key, uptoken, callback) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;
    qiniu.io.put(uptoken, key, body, extra, function (err, ret) {
        callback(err, ret);
    });
}

function uploadLocalFile(localFile, key, uptoken, callback) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret);
            console.log(ret.key, ret.hash, ret.size, ret.filename, ret.width);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
        callback(err, ret);
    });
}
exports.uploadRemoteFile = function (url, key, callback) {
    var _upToken = upToken('image');
    myhttp.getBuffer(url, function (buffer) {
        uploadBuffer(buffer, key, _upToken, function (e, ret) {
            callback(e, ret);
        });
    }, function (err) {
        callback(err);
    });
};


/*
uploadRemoteFile('http://www.lgstatic.com/www/static/common/widgets/header_c/modules/img/logo_d0915a9.png', 'florence.png', function(err,ret){
    console.log(err);
    console.log(ret);
});
*/

//uploadFile("./qq.png","asf1",uptoken(bucketname.image));