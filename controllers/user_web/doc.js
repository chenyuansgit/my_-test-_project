var officegen = require('officegen');
var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var logger = require("../../common/log").logger("index");
var des = require('../../common/des');
var proxy = require('../../proxy/index');
var resp_status_builder = require('../../common/response_status_builder.js');
var http = require('http');
require('../../common/fn');

exports.resume_doc_download = function (req, res) {
    var resume = req.insert_data.resume;
    var resume_job_rel = req.insert_data.resume_job_rel;
    var job = req.insert_data.job;

    try {
        var file_name, status;
        if (job && resume_job_rel) {
            if (resume.education_detail) {
                file_name = encodeURIComponent("【实习鸟】" + job.name + "_" + resume.name + "_" + JSON.parse(resume.education_detail)[0].school) + ".docx";
            } else {
                file_name = encodeURIComponent("【实习鸟】" + job.name + "_" + resume.name) + ".docx";
            }
            status = resume_job_rel.status;
        } else {
            if (resume.education_detail) {
                file_name = encodeURIComponent("【实习鸟】" + resume.name + "_" + JSON.parse(resume.education_detail)[0].school) + ".docx";
            } else {
                file_name = encodeURIComponent("【实习鸟】" + resume.name) + ".docx";
            }
            status = 2;
        }

        var docx = officegen('docx');
        docx.on('finalize', function (written) {
            logger.info("create docx starting ...");
        });

        format(docx, resume, status, function (e, s_docx, filename) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10003));
            }
            res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-disposition": "attachment; filename=" + file_name
            });
            s_docx.generate(res);// 客户端导出word

        });
    } catch (err) {
        logger.error(err);
        return res.json(resp_status_builder.build(10003));
    }

};


function format(docx, resume, status, callback) {
    var phone = resume["phone"];
    var email = resume["email"];
    if (status == 1) {
        phone = phone.toString().slice(0, 7) + "****";
        email = "*******@" + email.split("@")[1];
    }

    //if(resume.avatar) {
    //    try {
    //        download(resume.avatar, function (filename) {
    //            formatStep2(filename, docx, resume, phone, email);
    //            //fs.unlink(filename);
    //            callback(null, docx, filename);
    //        });
    //    } catch (e) {
    //        callback(e);
    //    }
    //} else {
    formatStep2(null, docx, resume, phone, email);
    callback(null, docx);
    //}
}

function formatStep2(filename, docx, resume, phone, email) {
    var pObj = docx.createP({align: 'center'});// 创建行 设置居中
    if (filename) {
        pObj.addImage(path.resolve(filename), {cx: 80, cy: 90});
        pObj.addLineBreak();
    }
    pObj.addText(resume["name"], {font_face: 'Arial', font_size: 30});
    pObj.addLineBreak();
    pObj.addText(resume["self_desc"].replace(new RegExp("<[^>]*>", "gm"), "").replace(new RegExp("&nbsp;", "gm"), ""), {
        font_face: 'Arial',
        font_size: 10
    });
    pObj.addLineBreak();

    var pObj = docx.createP({align: 'center'});
    pObj.addText("性别：" + (resume["male"] ? "男" : "女") + "     |     " + "生日：" + new Date(resume["birthday"]).format("yyyy年MM月dd日") + "     |     " + "地址：" + resume["address"], {
        font_face: 'Arial',
        font_size: 12
    });
    pObj.addLineBreak();
    pObj.addText("手机号：" + phone + "     |     " + "邮箱：" + email, {font_face: 'Arial', font_size: 12});
    pObj.addLineBreak();
    pObj.addText("目前状态：" + getWorkState(resume["work_state"]), {font_face: 'Arial', font_size: 12});
    pObj.addLineBreak();

    var payment = "";
    var payment_text = ["不限","50以下","50-100","100-200","200-500","500以上"];
    switch(parseInt(resume.intern_expect_min_payment)){
        case 0 :  payment = payment_text[0];break;
        case 1 :  payment = payment_text[1];break;
        case 50 :  payment = payment_text[2];break;
        case 100 :  payment = payment_text[3];break;
        case 200:  payment = payment_text[4];break;
        case 500:  payment = payment_text[5];break;
        default : payment = payment_text[0];break;
    }

    var days_type = parseInt((resume.intern_expect_days_type));
    var days_text = ["1-2天","3天","4天","5天","6-7天"];
    var days = days_text[days_type-1];

    var dur_type = parseInt((resume.intern_expect_dur_type));
    var dur_text = ["1个月以下","2个月","3个月","3个月以上"];
    var duration = dur_text[dur_type-1];


    var pObj = docx.createP();
    pObj.addText("我的期望", {font_face: 'Arial', font_size: 15, bold: true});
    pObj.addLineBreak();
    pObj.addText("--------------------------------------------------------------------------------------------------------------------------------");
    pObj.addText("实习城市：" + resume.intern_expect_city, {font_face: 'Arial', font_size: 12});
    pObj.addLineBreak();
    pObj.addText("实习职位：" + resume.intern_expect_position, {font_face: 'Arial', font_size: 12});
    pObj.addLineBreak();
    pObj.addText("每周实习：" + days, {font_face: 'Arial', font_size: 12});
    pObj.addLineBreak();
    pObj.addText("连续实习：" + duration, {font_face: 'Arial', font_size: 12});
    pObj.addLineBreak();
    pObj.addText("期望日薪：" + payment, {font_face: 'Arial', font_size: 12});
    pObj.addLineBreak();
    pObj.addLineBreak();


    var skill = JSON.parse(resume["skill"]);
    if (skill && skill.length > 0) {
        var pObj = docx.createP();
        pObj.addText("我的技能", {font_face: 'Arial', font_size: 15, bold: true});
        pObj.addLineBreak();
        pObj.addText("--------------------------------------------------------------------------------------------------------------------------------");
        for (var i = 0; i < skill.length; i++) {
            pObj.addText((i + 1) + ". " + skill[i].skill, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
        }
        pObj.addLineBreak();
    }


    var education = JSON.parse(resume["education_detail"]);
    if (education && education.length > 0) {
        var pObj = docx.createP();
        pObj.addText("教育经历", {font_face: 'Arial', font_size: 15, bold: true});
        pObj.addLineBreak();
        pObj.addText("--------------------------------------------------------------------------------------------------------------------------------");
        for (var i = 0; i < education.length; i++) {
            pObj.addText("学校名称：" + education[i].school, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("专业：" + education[i].major, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("学历：" + education[i].stage, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("时间：" + education[i].start_time + " ~ " + education[i].end_time, {
                font_face: 'Arial',
                font_size: 12
            });
            pObj.addLineBreak();
            pObj.addLineBreak();
        }
        pObj.addLineBreak();
    }

    var project_exp = JSON.parse(resume["project_exp"]);
    if (project_exp && project_exp.length) {
        var pObj = docx.createP();
        pObj.addText("项目经历", {font_face: 'Arial', font_size: 15, bold: true});
        pObj.addLineBreak();
        pObj.addText("--------------------------------------------------------------------------------------------------------------------------------");
        for (var i = 0; i < project_exp.length; i++) {
            pObj.addText("项目名称：" + project_exp[i].name, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("项目负责人：" + project_exp[i].role, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("时间：" + project_exp[i].startTime + " ~ " + project_exp[i].endTime, {
                font_face: 'Arial',
                font_size: 12
            });
            pObj.addLineBreak();
            pObj.addText("项目介绍：" + project_exp[i].content.replace(new RegExp("<[^>]*>", "gm"), "").replace(new RegExp("&nbsp;", "gm"), ""), {
                font_face: 'Arial',
                font_size: 12
            });
            pObj.addLineBreak();
            pObj.addLineBreak();
        }
        pObj.addLineBreak();
    }


    var inter_exp = JSON.parse(resume["inter_exp"]);
    if (inter_exp && inter_exp.length > 0) {
        var pObj = docx.createP();
        pObj.addText("实习经历", {font_face: 'Arial', font_size: 15, bold: true});
        pObj.addLineBreak();
        pObj.addText("--------------------------------------------------------------------------------------------------------------------------------");
        for (var i = 0; i < inter_exp.length; i++) {
            pObj.addText("公司名称：" + inter_exp[i].name, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("实习职位：" + inter_exp[i].role, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("实习时间：" + inter_exp[i].startTime + " ~ " + inter_exp[i].endTime, {
                font_face: 'Arial',
                font_size: 12
            });
            pObj.addLineBreak();
            pObj.addText("实习内容：" + inter_exp[i].content.replace(new RegExp("<[^>]*>", "gm"), "").replace(new RegExp("&nbsp;", "gm"), ""), {
                font_face: 'Arial',
                font_size: 12
            });
            pObj.addLineBreak();
            pObj.addLineBreak();
        }
        pObj.addLineBreak();
    }

    var school_exp = JSON.parse(resume["school_exp"]);
    if (school_exp && school_exp.length > 0) {
        var pObj = docx.createP();
        pObj.addText("校园经历", {font_face: 'Arial', font_size: 15, bold: true});
        pObj.addLineBreak();
        pObj.addText("--------------------------------------------------------------------------------------------------------------------------------");
        for (var i = 0; i < school_exp.length; i++) {
            pObj.addText("校园经历：" + school_exp[i].name, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("校园角色：" + school_exp[i].role, {font_face: 'Arial', font_size: 12});
            pObj.addLineBreak();
            pObj.addText("起止时间：" + school_exp[i].startTime + " ~ " + school_exp[i].endTime, {
                font_face: 'Arial',
                font_size: 12
            });
            pObj.addLineBreak();
            pObj.addText("经历内容：" + school_exp[i].content.replace(new RegExp("<[^>]*>", "gm"), "").replace(new RegExp("&nbsp;", "gm"), ""), {
                font_face: 'Arial',
                font_size: 12
            });
            pObj.addLineBreak();
            pObj.addLineBreak();
        }
        pObj.addLineBreak();
    }

}


function getWorkState(state) {
    var work_state = "";
    switch (state) {
        case 1 :
            work_state = "我在学校，可来公司实习";
            break;
        case 2 :
            work_state = "我在实习，考虑换个公司";
            break;
        case 3 :
            work_state = "我在公司所在城市，可来实习";
            break;
        case 4 :
            work_state = "我暂时无法实习";
            break;
        default :
            work_state = "我在学校，可来公司实习";
            break;
    }
    return work_state;
}

function download(url, callback) {
    http.get(url, function (response) {
        var file_name = "public/image/" + (+new Date) + ".png";
        var writeStream = fs.createWriteStream(file_name);
        response.on('data', function (chunk) {
            writeStream.write(chunk);
        });

        response.on('end', function () {
            writeStream.end();
            callback(file_name);
        });
    });
}
