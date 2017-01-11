var logger = require("../../common/log").logger("index");
var async = require('async');
var proxy = require("../../proxy/index");
var hotWords = require("../../common/hotWords");
var platform = require('../../common/utils/platform');
require('../../common/fn');


exports.home = function (req, res) {// 主页渲染
    async.parallel([function (callback) {
        proxy.job.getHottestList({}, function (err, jobs) {
            callback(err, jobs);
        });
    }, function (callback) {
        proxy.job.getNewestList({}, function (err, jobs) {
            callback(err, jobs);
        });
    }, function (callback) {
        proxy.ad.findOnShowList(1, function (err, ads) {
            callback(err, ads);
        });
    }, function (callback) {
        proxy.ad.findOnShowList(2, function (err, ads) {
            callback(err, ads);
        });
    }, function (callback) {
        proxy.activity.getNewestList(function (err, activities) {
            callback(err, activities);
        });
    }], function (err, results) {
        if (err) {
            logger.error(err);
        }
        res.render('index', {
            hotJobs: results[0] || [],
            newJobs: results[1] || [],
            big_ads: results[2] || [],
            small_ads: results[3] || [],
            activities: results[4] || [],
            hotWords: hotWords
        });
    });
};

exports.app_download_page = function (req, res) {
    var userAgent = req.headers['user-agent'];
    if(platform(userAgent).isMobile){
        return  res.render('download/mobile');
    }
    res.render('download/web');
};
exports.app_download = function (req, res) {
    var userAgent = req.headers['user-agent'];
    if(platform(userAgent).isAndroid){
        return res.redirect('http://cdn.s3.internbird.com/internbird/latest_version.apk');
    }
    if(platform(userAgent).isWeixin){
        return res.redirect('http://a.app.qq.com/o/simple.jsp?pkgname=com.tutorstech.internbird');
    }
    if(platform(userAgent).isIOS){
        return res.redirect('https://itunes.apple.com/cn/app/shi-xi-niao-da-xue-sheng-zhao/id1114750563?mt=8');
    }
    res.redirect('http://www.internbird.com/');
};