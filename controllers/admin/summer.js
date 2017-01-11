var proxy = require("../../proxy/index");
var logger = require("../../common/log").logger("index");
var resp_status_builder = require('../../common/response_status_builder.js');


exports.isCompanyJoiner = function (req, res) {
    var cid = req.params.cid;
    proxy.summer.isJoiner(cid, 'company', function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            isJoiner: score > 1 ? 1 : 0
        }));
    });
};
//企业加入暑期实习
exports.companyJoin = function (req, res) {
    var cid = req.params.cid;
    proxy.summer.isJoiner(cid, 'company', function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (score > 1) {
            return res.json(resp_status_builder.build(10007, 'you have join before'));
        }
        proxy.summer.join(cid, 'company', function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};


//企业退入暑期实习
exports.companyQuit = function (req, res) {
    var cid = req.params.cid;
    proxy.summer.isJoiner(cid, 'company', function (err, score) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (score > 1) {
            return res.json(resp_status_builder.build(10007, 'you have not join before'));
        }
        proxy.summer.quit(cid, 'company', function (e) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};




