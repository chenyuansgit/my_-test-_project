var proxy = require('../proxy/index');
var config = require('../config_default').config;

module.exports = function (req, res, next) {
    if (config.name !== 'user_web' && config.name !== 'company_web' && config.name !== 'account_system') {
        return next();
    }
    if (!res.locals.uid) {
        return next();
    }
    if (req.session.account_name) {
        res.locals.account.account_name = req.session.account_name;
        return next();
    }
    proxy.account.display_name.get(res.locals.uid, config.name === 'company_web' ? 'hr' : 'user', function (err, name) {
        if (name) {
            req.session.account_name = name;
        }
        res.locals.account.account_name = name || '实习鸟';
        next();
    });
};