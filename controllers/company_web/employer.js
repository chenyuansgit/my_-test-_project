var logger = require("../../common/log").logger("index");
var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');


exports.settingPage = function (req, res) {
    res.render('employer/setting');
};
exports.update = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid;
    var black = ['user_id', 'company_id', 'create_time', 'enterprise_email'];
    for (var i = 0, len = black.length; i < len; ++i) {
        if (typeof option[black[i]] !== 'undefined') delete option[black[i]];
    }
    option.update_time = +new Date;
    proxy.employer.updateOneById(uid, option, function (err) {
        if (err) {
            logger.info(err);
            return res.json(resp_status_builder.build(10003, err));
        }
        if (option.nick_name) {
            //删除显示昵称信息
            req.session.account_name = null;
            proxy.account.display_name.del(uid);

        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
    });
};