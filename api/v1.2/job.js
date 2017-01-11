var logger = require("../../common/log").logger("index");
var proxy = require("../../proxy/index");
var resp_status_builder = require('../../common/response_status_builder.js');
var solr = require("../../solr/index").models;



//solr搜索,加入包打听
exports.jobSearch = function (req, res) {
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.headers['intern_list_ts']) ? req.headers['intern_list_ts'] : now_time;
    var channel_type = req.query.type || "";
    var option = {
        pt: req.query.pt >= 1 && req.query.pt <= 5 ? req.query.pt : 0,
        wk: req.query.wk >= 1 && req.query.wk <= 7 ? req.query.wk : 0,
        lt: req.query.lt ? req.query.lt : 'time',
        et: req.query.et >= 1 && req.query.et <= 4 ? req.query.et : 0,
        jt: req.query.jt || 0,
        cid: req.query.cid || 0,
        k: req.query.k,
        reg:req.query.reg,
        ct:req.query.ct
    };
    solr.job.queryJobs(req.query.page > 1 ? req.query.page : 1, // 页数
        10, // 每页数量
        option.k, // 关键词
        option.cid, // 城市id
        option.jt, // 职位类型id
        getPayment(option.pt,channel_type), // 最低薪水
        option.wk, // 每周工作天数
        option.et, //学历要求的类型
        option.reg,//是否转正
        option.ct || '1,2',//来源类型,普通职位或者包打听
        option.lt, // 指定排序字段名
        timestamp,
        function (err, data) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003, '服务器错误'));
            }
            if (data.jobs.length && (!req.query.page || req.query.page <= 1)) {
                data.timestamp = timestamp;
            }
            data.option = option;
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', data));
        }
    );
};
function getPayment(payment_type,channel_type) {
    var min_payment = 0;
    payment_type = parseInt(payment_type);
    if(channel_type == "campus"){
        switch (payment_type) {
            case 1:
                min_payment = 0;
                break;
            case 2:
                min_payment = 30000;
                break;
            case 3:
                min_payment = 60000;
                break;
            case 4:
                min_payment = 100000;
                break;
            case 5:
                min_payment = 200000;
                break;
            default:
                min_payment = 0;
        }
    }else {
        switch (payment_type) {
            case 1:
                min_payment = 0;
                break;
            case 2:
                min_payment = 50;
                break;
            case 3:
                min_payment = 100;
                break;
            case 4:
                min_payment = 200;
                break;
            case 5:
                min_payment = 500;
                break;
            default:
                min_payment = 0;
        }
    }
    return min_payment;
}