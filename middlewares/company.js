var proxy = require('../proxy/index');

//查看普通公司信息时,如果是自己公司跳转到可编辑主页

exports.checkSingleCompanyOwner = function (req, res, next) {
    req.company_owner = 1;
    var uid = res.locals.uid;
    if (!uid) return next();
    proxy.employer.getOneById(uid, function (err, employer) {
        if (err) {
            req.error = {code: '500', mes: 'database error'};
        }
        if (!!employer && !err && employer.company_id == req.params.cid) {
            req.company_owner = 2;
            res.locals.employer = employer;
        }
        next();
    });
};