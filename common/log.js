var config = require('../config_default').config;
var log4js = require('log4js');
var log4js_configuration = require("../log4js_configuration.json");
log4js.configure(log4js_configuration, {});

var logger = log4js.getLogger('normal');

logger.setLevel(config.logs_level);
exports.logger = function (name) {
    var logger = log4js.getLogger(name);
    logger.setLevel(config.logs_level);
    return logger;
};