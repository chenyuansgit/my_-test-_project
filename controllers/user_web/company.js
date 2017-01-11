var logger = require("../../common/log").logger("index");
var proxy = require('../../proxy/index');
var async = require('async');
var des = require('../../common/des');
var company_type = require('../../common/company_type.json');
var hotCity = require('../../common/hot_city.json');
var id_reg = require("../../common/utils/reg").number;
require('../../common/fn');


exports.detailPage = function (req, res) {
    var uid = res.locals.uid, cid = req.params.cid;
    if(!id_reg.test(cid)){
        return res.render('error/404');
    }
    if (req.company_owner == 2) {//如果是自己的公司,就跳转
        return res.redirect("http://" + res.locals.host.hr + '/myCompany');
    }
    proxy.company.companyDetails((uid || 0), cid, 0, 1, function (err, company, jobs, isFavorite) {
        if (err) {
            logger.error(err);
        }
        res.render("company", {
            company: company || {},
            intern_jobs: jobs && jobs.intern ? jobs.intern : [],
            campus_jobs: jobs && jobs.campus ? jobs.campus : [],
            isFavorite: isFavorite
        });
    });
};
exports.search = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        ct: req.query.ct,
        st: req.query.st || 0,
        cid: req.query.cid,
        k: req.query.k
    };
    async.parallel([function (callback) {
        proxy.ad.findOnShowList(3, function (e, ads) {
            callback(e, ads);
        });
    }, function (callback) {
        proxy.company.search({
            key: option.k,//关键词
            ct: req.query.ct,//公司类型
            st: req.query.st,//公司规模
            cid: req.query.cid,//公司地址
            timestamp: timestamp,
            page: page//页数,默认为1
        }, function (err, data) {
            callback(err, data);
        });
    }], function (e, results) {
        if (e) {
            logger.error(e);
            return res.render('companySearch', {
                option: option,
                hotCity: hotCity,
                companies: [],
                company_type: company_type,
                ads: results[0] || [],
                pages: 0,
                page: page,
                count: 0
            });
        }
        var data = results[1], ads = results[0];
        if (data.companies.length && page == 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.option = option;
        data.company_type = company_type;
        data.hotCity = hotCity;
        data.ads = ads;
        res.render('companySearch', data);
    });
};