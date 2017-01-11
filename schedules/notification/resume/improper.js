var proxy = require("../../../proxy/index");
var logger = require("../../../common/log").logger("schedule");
var push_template = require('../../../common/push_template');
var db = require('../../../model/index').models;
var email_template = require('../../../common/email_template');
var async = require('async');
var validate = require('../../../common/validate');

var expires = 15;//简历状态过期时间(天)


var improper_reason_title = "过期未处理,简历状态自动变更为不合适";
var improper_reason_content = "非常荣幸收到你的简历，经过评估，我们认为你与该职位的条件暂时不太匹配，无法进入面试阶段。相信更好的机会一定还在等待着你，赶快调整心态，做好充足的准备重新出发吧！";

//系统处理15天还未处理的简历,状态变更为不合适

//获取超过15天的未处理简历关系
function getExpiredRel(callback) {
    db.resume_job_rel.findAll({
        where: {
            create_time: {
                $lte: +new Date - expires * 24 * 60 * 60 * 1000
            },
            status: 1
        }
    }).then(function (resume_job_rels) {
        callback(null, resume_job_rels);
        logger.error('length:'+resume_job_rels.length);
    }).catch(function (e) {
        callback(e);
    });
}

//系统自动不合适单个过期未操作的简历关系

function toBeImproper(resume_job_rel, callback) {
    var time = +new Date, jid = resume_job_rel.job_id;
    db.resume_job_rel.update({
        improper_info: JSON.stringify({
            update_time: time,
            reason_title: improper_reason_title
        }),
        update_time: time,
        status: 4
    }, {
        where: {
            id: resume_job_rel.id
        }
    }).then(function (rows) {
        if (rows[0]) {
            // 更新job的简历首次处理延时
            proxy.stats_job.incrResumeTreatNum(jid, Math.ceil((time - resume_job_rel.create_time) / (1000 * 3600)));
            //发送客户端推送
            proxy.push.toSingleByUid(resume_job_rel.resume_user_id, push_template.improper());
            //发送邮件通知
            sendImproperMail(resume_job_rel);
        }
        callback && callback(null);
    }).catch(function (e) {
        callback && callback(e);
    });
}
//根据resume_job_rel查找发送邮件相关数据,并发送邮件
function sendImproperMail(resume_job_rel, callback) {
    async.parallel([
        function (_callback) {
            proxy.job.findOneById(resume_job_rel.job_id, function (e, job) {
                _callback(e, job);
            });
        },
        function (_callback) {
            proxy.company.findOne(resume_job_rel.job_company_id, function (e, company) {
                _callback(e, company);
            });
        },
        function (_callback) {
            proxy.resume.findOneByVersion(resume_job_rel.resume_id, resume_job_rel.version, function (e, resume) {
                _callback(e, resume);
            });
        }
    ], function (err, results) {
        if (err) {
            return callback && callback(err);
        }
        var data = {
            name: results[2].name,
            address: results[2].email,
            subject: '简历状态更改通知'
        };
        email_template.improper({
            resume_name: results[2].name,
            job_name: results[0].name,
            jid: resume_job_rel.job_id,
            cid: resume_job_rel.job_company_id,
            company_name: results[1].name,
            reason_title: improper_reason_title,
            reason_content: improper_reason_content
        }, function (err, str) {
            if (!err) {
                data.html = str;
                validate.sendMail(data);
            }
            callback && callback(err);
        });
    });
}

exports.doBgService = function () {
    getExpiredRel(function (e, resume_job_rels) {
        if (e) {
            return logger(e);
        }
        if (!resume_job_rels || !resume_job_rels.length) {
            return false;
        }
        for (var i = 0, len = resume_job_rels.length; i < len; ++i) {
            toBeImproper(resume_job_rels[i]);
        }
    });
};
