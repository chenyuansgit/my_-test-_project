var platform = require('../common/utils/platform');
var config = require('../config_default').config;
var reg = require('../common/utils/reg');

function _config(name, env) {
    var file = {
        local: "local_config.js",
        development: "dev_config.js",
        prod: "prod_config.js"
    };
    return require('../config/' + name + '/' + file[env]);
}

module.exports = function (req, res, next) {
    res.locals.host = {
        i: _config('company_mobile', config.env).host,
        hr: _config('company_web', config.env).host,
        www: _config('user_web', config.env).host,
        m: _config('user_mobile', config.env).host,
        account: _config('account_system', config.env).host
    };
    var userAgent = req.headers['user-agent'].toLowerCase(), originalUrl = req.originalUrl;
    req.start_time = +new Date;
    res.locals.platform = platform(userAgent).isAppInner ? 'client' : (platform(userAgent).isMobile ? 'h5' : 'web');
    res.locals.isWeixin = platform(userAgent).isWeixin;
    req.insert_data = {};
    res.locals.encodeOriginalUrl = reg.url.test(originalUrl) ? encodeURIComponent(originalUrl) : encodeURIComponent("http://" + config.host + originalUrl);
    res.locals.forward = !req.query.forward ? ("http://" + res.locals.host.www + "/") : (req.query.forward.indexOf('/') > -1 ? encodeURIComponent(req.query.forward) : req.query.forward);
    next();
};