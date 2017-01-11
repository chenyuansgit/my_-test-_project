var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var logger = require("../../common/log").logger("index");
var des = require('../../common/des');
var config = require('../../config_default').config;
var resp_status_builder = require('../../common/response_status_builder.js');
var wkhtmltopdf = require('wkhtmltopdf');
var proxy = require('../../proxy/index');
var job_type = require('../../common/job_type');


exports.resume_pdf_download = function (req, res) {
    var rid = req.params.rid;
    var resume = req.insert_data.resume;
    var resume_job_rel = req.insert_data.resume_job_rel;
    var job = req.insert_data.job;

    try {
        var file_name, status;
        if (job && resume_job_rel) {
            file_name = encodeURIComponent("【实习鸟】" + job.name + "_" + resume.name + "_" + eval(resume.education_detail)[0].school) + ".pdf";
            status = resume_job_rel.status;
        } else {
            file_name = encodeURIComponent("【实习鸟】" + resume.name + "_" + eval(resume.education_detail)[0].school) + ".pdf";
            status = 2;
        }
        var encode = {
            rid: resume.rid,
            version: resume.version,
            status: status,
            time: +new Date
        };
        var code = des.cipher(config.des_3.algorithm, config.des_3.key, JSON.stringify(encode));
        res.writeHead(200, {
            "Content-Type": "application/octet-stream",
            "Content-disposition": "attachment; filename=" + file_name
        });
        wkhtmltopdf("http://" + config.host + "/resume/for_pdf_download/" + rid + "?k=" + code).pipe(res);

    } catch (e) {
        logger.error(e);
        res.json(resp_status_builder.build(10005));
    }

};

exports.resume_display_for_pdf = function (req, res) {
    var rid = req.params.rid,key = req.query.k;
    if (!rid || rid < 1) {
        return res.json(resp_status_builder.build(10002));
    }
    var _rid, time, status, version;
    try {
        var decode = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, key));
        _rid = decode.rid;
        time = decode.time;
        status = decode.status;
        version = decode.version;
        if (rid != _rid) {
            return res.json(resp_status_builder.build(10002, "param error-1"));
        }
        if ((+new Date - time) > 1000 * 60 * 3) {
            return res.json(resp_status_builder.build(10002, "param error-3"));
        }
        if (!status) {
            return res.json(resp_status_builder.build(10002, "param error-4"));
        }
    } catch (e) {
        logger.error(e);
        return res.json(resp_status_builder.build(10002, "param error-2"));
    }
    proxy.resume.findOneByVersion(rid, version, function (e, resume) {
        if (e) {
            logger.error(e);
            return res.json(resp_status_builder.build(10003));
        }
        if (!resume) {
            return res.json(resp_status_builder.build(10006, "resume not exists"));
        }
        res.render("public/resumeDownloadPreview", {
            resume: resume || {},
            status: status,
            job: {},
            job_type: job_type,
            shareKey: ''
        });
    });
};




