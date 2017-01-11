var proxy = require("../../proxy/index");
var logger = require("../../common/log").logger("index");


exports.homePage = function (req, res) {
    var employer = res.locals.employer;
    if (!employer.company_id) {
        return res.render("mine/homePage", {
            company: {}
        });
    }
    proxy.company.findOne(employer.company_id, function (err, company) {
        if (err) {
            logger.error(err);
        }
        res.render("mine/homePage", {
            company: company || {}
        });
    });
};
exports.validate = function (req, res) {
    var step = req.query.step >= 1 && req.query.step <= 3 ? req.query.step : 1;
    res.render('mine/validate', {
        step: step
    });
};