var https = require("https");
//var zlib = require('zlib');

module.exports.get = function (options, successCallback, errorCallback) {
    options.option.method = "get";
    options.option.port = options.option.port ? options.option.port : "443";
    options.option.headers = options.option.headers || {};
    options.option.headers["Accept-Encoding"] = "gzip,deflate";
    var httpreq = https.request(options.option, function (response) {
        var chunks = [], data, encoding = response.headers['content-encoding'];
        // 非gzip/deflate要转成utf-8格式
        if (encoding === 'undefined') {
            response.setEncoding('utf-8');
        }
        response.on('data', function (chunk) {
            chunks.push(chunk);
        });
        response.on('end', function () {
            var buffer = Buffer.concat(chunks);
            data = buffer.toString();
            successCallback && successCallback(data, response);
        });
    });
    httpreq.on('error', function (e) {
        errorCallback && errorCallback(e);
    });
    httpreq.end();
};
module.exports.post = function (options, successCallback, errorCallback) {
    options.option.method = "post";
    options.option.port = options.option.port ? options.option.port : "443";
    options.option.headers = options.option.headers || {};
    options.option.headers["Content-Type"] = "application/x-www-form-urlencoded";
    options.option.headers["Accept-Encoding"] = "gzip";
    options.option.headers["Content-Length"] = options.content.length;
    var httpreq = https.request(options.option, function (response) {
        var chunks = [], data, encoding = response.headers['content-encoding'];
        //非gzip/deflate要转成utf-8格式
        if (encoding === 'undefined') {
            response.setEncoding('utf-8');
        }
        response.on('data', function (chunk) {
            chunks.push(chunk);
        });
        response.on('end', function () {
            var buffer = Buffer.concat(chunks);
            data = buffer.toString();
            successCallback && successCallback(data, response);

        });
    });
    httpreq.on('error', function (e) {
        errorCallback && errorCallback(e);
    });

    httpreq.write(options.content);

    httpreq.end();
};