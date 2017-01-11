var logger = require("../../common/log").logger("index");
var proxy = require('../../proxy/index');
var des = require('../../common/des');
var id_reg = require("../../common/utils/reg").number;
require('../../common/fn');


//公司详情页面
exports.companyPage = function (req, res) {
    var uid = res.locals.uid, cid = req.params.cid;
    if (!id_reg.test(cid)) {
        return res.render('error/404');
    }
    proxy.company.companyDetails((uid || 0), cid, 0, 0, function (err, company, jobs) {
        if (err) {
            logger.error(err);
            return res.render('error/404');
        }
        res.render("company/detail", {
            company: company || {},
            jobs: jobs || [],
            employer: {}
        });
    });
};