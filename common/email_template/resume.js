/**
 * Created by zhphu on 16/5/27.
 */
require('../../common/fn');
var config = require('../../config_default').config;
var platform = require('../../common/utils/platform');
function _config(name, env) {
    var file = {
        local: "local_config.js",
        development: "dev_config.js",
        prod: "prod_config.js"
    };
    return require('../../config/' + name + '/' + file[env]);
}
var host = {
    i: _config('company_mobile', config.env).host,
    hr: _config('company_web', config.env).host,
    www: _config('user_web', config.env).host,
    m: _config('user_mobile', config.env).host,
    account: _config('account_system', config.env).host
};
var url_head =  {
    i : ("http://" + host.i + "/"),
    hr :("http://" + host.hr + "/"),
    www :("http://" + host.www + "/"),
    m :("http://" + host.m + "/"),
    account :("http://" + host.account + "/")
};
var _email_bottom = "<tr class='mail-bottom' style='width: 640px; height: 149px;' background='" + url_head.www + "public/build/www/img/mail/mail-bottom.png'>\
                        <td></td>\
                    </tr>\
                    <tr class='mail-footer' style='padding:25px 20px;line-height: 20px;color: #666;'>\
                        <td style='padding:0 25px;font-size: 15px;'>\
                            <p style='line-height:20px;margin-top: 20px;'>该邮件为实习鸟系统邮件，<span style='color:#ff2525'>请勿直接回复。</span></p>\
                            <p style='line-height:20px;'>忘记密码可<a style='color:#00ced1;text-decoration:none;' href='" + url_head.account + "/findPwd'>点击这里</a>修改</p>\
                            <p style='line-height:20px'>若有任何问题，可与我们联系，我们将尽快帮你解决。</p>\
                            <p style='line-height:20px'>Email：<a href='mailto:service@internbird.com' target='_blank' style='color:#00ced1;text-decoration: none'>service@internbird.com</a>，电话：010-57460008</p>\
                            <p class='add-mail' style='margin-top: 25px;line-height:20px;'>为保证邮箱正常接收，请将<a style='color: #00ced1;text-decoration: none;' href='mailto:noreply@mail.internbird.com' target='_blank'>noreply@mail.internbird.com</a>添加进你的通讯录</p>\
                        </td>\
                    </tr>";
//简历通过初选时候,发送的简历模版
exports.contact = function (option, callback) {
    if (!option || !option.jid || !option.job_name || !option.cid) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www+ "/jobCondition' style='color: #2f8284;text-decoration:none;'>我的求职</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <ul style='padding: 25px 0;list-style: none;'>\
                                <li style='line-height: 30px;'>应聘公司：<a style='color: #00ced1;text-decoration:none;' href='" + url_head.www + "company/detail/" + option.cid + "'>" + option.company_name + "</a></li>\
                                <li style='line-height: 30px;'>应聘职位：<a style='color: #00ced1;text-decoration:none;' href='" + url_head.www + "job/detail/" + option.jid + "'>" + option.job_name + "</a></li>\
                                <li style='line-height: 30px;'>简历状态：通过初选，等待沟通 </li>\
                            </ul>\
                            <p style='line-height: 28px;'>您的简历已经通过我们的筛选，三个工作日之内我们将与您沟通，感谢您对我们的支持，请耐心等待。</p>\
                            <p style='line-height: 28px;'>同时，请保持简历中电话、邮箱的畅通，并且及时查看消息。希望您能够有机会加入我们，与我们一起成长。</p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//简历不合适邮件模板
exports.improper = function (option, callback) {
    if (!option || !option.resume_name || !option.company_name || !option.cid || !option.jid || !option.job_name) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "/jobCondition' style='color: #2f8284;text-decoration:none;'>我的求职</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>" + option.resume_name + "，您好~</p>\
                            <p style='line-height: 28px;text-indent: 32px;'>非常荣幸收到你的简历，招聘方经过评估，认为你与该职位的条件不太匹配，无法进入面试阶段。</p>\
                            <p style='line-height: 28px;text-indent: 32px;'> 相信更好的机会一定还在翘首期盼着你，赶快调整心态，做好充足的准备重新出发吧！</p>\
                            <p style='line-height: 28px;'>应聘公司：<a style='color:#00ced1;text-decoration:none;' href='" + url_head.www + "company/detail/" + option.cid + "'>" + option.company_name + "</a></p>\
                            <p style='line-height: 28px;'>应聘职位：<a style='color:#00ced1;text-decoration:none;' href='" + url_head.www + "job/detail/" + option.jid + "'>" + option.job_name + "</a></p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);

};
//面试通知邮件模板
exports.interview = function (option, callback) {
    if (!option || !option.resume_name || !option.jid || !option.job_name || !option.cid || !option.company_name || !option.interview_time) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "/jobCondition' style='color: #2f8284;text-decoration:none;'>我的求职</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>" + option.resume_name + "，您好~</p>\
                            <p style='line-height: 28px;'>您的简历已通过我们的筛选，很高兴通知您参加我们的面试。</p>\
                            <ul style='padding: 25px 0;list-style: none;'>\
                                <li style='line-height: 30px;'>面试公司：<a style='color: #00ced1;text-decoration:none;' href='" + url_head.www + "company/detail/" + option.cid + "'>" + option.company_name + "</a></li>\
                                <li style='line-height: 30px;'>面试职位：<a style='color: #00ced1;text-decoration:none;' href='" + url_head.www + "job/detail/" + option.jid + "'>" + option.job_name + "</a></li>\
                                <li style='line-height: 30px;'>面试时间：" + new Date(parseInt(option.interview_time)).format('yyyy-MM-dd hh:mm') + "</li>\
                                <li style='line-height: 30px;'>面试地点：" + option.address + "</li>\
                                <li style='line-height: 30px;'>联系人：" + option.hr_name + "</li>\
                                <li style='line-height: 30px;'>联系电话：" + option.hr_phone + "</li>\
                                <li style='line-height: 30px;'>" + option.content + "</Li>\
                            </ul>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//简历转发后，发给求职者邮件模板
exports.transmit = function (option, callback) {
    if (!option || !option.jid || !option.job_name || !option.cid || !option.company_name) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "/jobCondition' style='color: #2f8284;text-decoration:none;'>我的求职</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <ul style='padding: 25px 0;'>\
                                <li style='font-size:16px;line-height: 30px;list-style: none;'>应聘公司：<a style='color: #00ced1;text-decoration:none;' href='" + url_head.www + "company/detail/" + option.cid + "'>" + option.company_name + "</a></li>\
                                <li style='font-size:16px;line-height: 30px;list-style: none;'>应聘职位：<a style='color: #00ced1;text-decoration:none;' href='" + url_head.www + "job/detail/" + option.jid + "'>" + option.job_name + "</a></li>\
                                <li style='font-size:16px;line-height: 30px;list-style: none;'>简历状态：被转发</li>\
                            </ul>\
                            <p>hr已将您的简历转发给了用人部门，审阅通过后会约您面试，非常感谢您对我们的支持，请耐心等待！</p>\
                            <p>希望您能有机会加入我们，与我们一起共同成长。 </p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";

    callback(null, html);
};
//简历转发后，发给转发邮箱的模板
exports.resumeTransmitted = function (option, callback) {
    if (!option || !option.jid || !option.job_name || !option.hr_name || !option.resume || !option.shareKey || !option.code) {
        return callback(new Error('1'));
    }
    var resume = option.resume, education, school, intern_city, intern_payment, intern_days, work_state;
    var payment_text = ["不限","50以下","50-100","100-200","200-500","500以上"];
    var days_text = ["1-2天","3天","4天","5天","6-7天"];
    try {
        education = JSON.parse(resume.education_detail)[0].stage;
        school = JSON.parse(resume.education_detail)[0].school;
        intern_city = resume.intern_expect_city;
        var days_type = parseInt((resume.intern_expect_days_type));
        intern_days = days_text[days_type-1];
        switch(parseInt(resume.intern_expect_min_payment)){
            case 0 :  intern_payment = payment_text[0];break;
            case 1 :  intern_payment = payment_text[1];break;
            case 50 :  intern_payment = payment_text[2];break;
            case 100 :  intern_payment = payment_text[3];break;
            case 200:  intern_payment = payment_text[4];break;
            case 500:  intern_payment = payment_text[5];break;
            default : intern_payment = payment_text[0];break;
        }

        var state = parseInt(resume.work_state);
        switch (state) {
            case 0:
                work_state = "我在学校，可来公司实习";
                break;
            case 1:
                work_state = "我在实习，考虑换个公司";
                break;
            case 2:
                work_state = "我在公司所在城市，可来实习";
                break;
            case 3:
                work_state = "我暂时无法实习";
                break;
        }
    } catch (e) {
    }

    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.hr + "resume/list' style='color: #2f8284;text-decoration:none;'>简历管理</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>" + option.hr_name + "，你好！</p>\
                            <p style='line-height: 28px;'>以下是应聘“<a style='color:#00ced1;' href='" + url_head.www + "job/detail/" + option.jid + "'>" + option.job_name + "</a><span>”的简历。我已查阅，请你评估一下。若觉合适，我们将安排面试，谢谢！</p>\
                            <h3 style='font-size: 16px;font-weight: 600;padding-top: 20px;'>" + option.resume.name + "的简历</h3>\
                            <p style='line-height: 28px;'>" + option.resume.name + "|" + (option.resume.male == 1 ? '男' : '女') + "</p>\
                            <p style='line-height: 28px;'>毕业院校：" + (!education ? (school + ' ') : (education + ' · ' + school)) + "</p>\
                            <p class='pt' style='line-height: 28px;'>* 为保证数据安全，查看完整简历时请输入验证码： <span style='color: #e61432;' class='r'>" + option.code + "</span></p>\
                            <p class='pb' style='line-height: 28px; padding-bottom: 30px'><a style='background-color: #00ced1;padding: 8px 15px;display: inline-block;color: #fff;margin-top: 30px;text-decoration: none;' href='" + url_head.hr + "resume/s/" + option.shareKey + "' class='view-resume-detail'>查看完整简历</a></p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
    /*<p style='line-height: 28px;'>期望实习：" + intern_city + " ｜ 日薪" + intern_payment + " ｜ 最少可实习" + intern_days + " ｜</p>\
     <p style='line-height: 28px;'>目前状态：" + work_state + "</p>\*/
};
//简历投递成功后,发送给公司hr的简历
exports.delivery = function (option, callback) {
    if (!option || !option.jid || !option.job_name || !option.hr_name || !option.resume || !option.shareKey || !option.code) {
        return callback(new Error('1'));
    }
    var resume = option.resume, avatar,education, school, major, intern_city, intern_payment, intern_days, work_state;
    var payment_text = ["不限","50以下","50-100","100-200","200-500","500以上"];
    var days_text = ["1-2天","3天","4天","5天","6-7天"];
    try {
        education = JSON.parse(resume.education_detail)[0].stage || "";
        school = JSON.parse(resume.education_detail)[0].school;
        major = JSON.parse(resume.education_detail)[0].major;
        intern_city = resume.intern_expect_city;
        var days_type = parseInt((resume.intern_expect_days_type));
        intern_days = days_text[days_type-1];
        switch(parseInt(resume.intern_expect_min_payment)){
            case 0 :  intern_payment = payment_text[0];break;
            case 1 :  intern_payment = payment_text[1];break;
            case 50 :  intern_payment = payment_text[2];break;
            case 100 :  intern_payment = payment_text[3];break;
            case 200:  intern_payment = payment_text[4];break;
            case 500:  intern_payment = payment_text[5];break;
            default : intern_payment = payment_text[0];break;
        }

        var state = parseInt(resume.work_state);
        switch (state) {
            case 0:
                work_state = "我在学校，可来公司实习";
                break;
            case 1:
                work_state = "我在实习，考虑换个公司";
                break;
            case 2:
                work_state = "我在公司所在城市，可来实习";
                break;
            case 3:
                work_state = "我暂时无法实习";
                break;
        }
    } catch (e) {
    }
    if(resume.avatar && resume.avatar !='undefined'){
        avatar = resume.avatar;
    }else{
        avatar = 'http://image.internbird.com/21232f297a57a5a743894a0e4a801fc3/2b7468a989c8efc6b98b4d9a565c9872.png';
    }
    var border_color = option.resume.male == 1 ? '#4ed0cd' : '#f29c9f';
    var resume_content = "<div class='resume-content' style='box-shadow: 0 2px 2px #ddd;background-color:#fbfbfb;padding:20px 25px 40px;'>\
                    <div class='resume-top' style='position:relative;height:100px;padding: 20px 0;'>\
                        <div class='avatar' style='-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;border:2px solid "+border_color+";position:absolute;width:100px;height:100px;background:url("+avatar+") 0 0 no-repeat;background-size: cover;background-position: center;'></div>\
                        <div class='top-right' style='position:absolute;margin:5px 0 0 150px;font-weight:600;padding-left:40px;border-left:1px solid "+border_color+";'>\
                            <p>" + option.resume.name + "&nbsp;|&nbsp;" + (option.resume.male == 1 ? '男' : '女') + "</p>\
                            <p>应聘职位&nbsp;:&nbsp;" + option.job_name + "</p>\
                        </div>\
                    </div>\
                    <div class='resume-line' style='line-height: 42px;border-top:1px solid #eee;border-bottom:1px solid #eee;color:#666;margin-top:15px;'>\
                        <span style='display:inline-block;width:5px;height:5px;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;background: #e77f00;vertical-align: middle;margin: -2px 10px 0 1px;'></span>\
                        毕业院校&nbsp;:&nbsp;"+ school + "&nbsp;|&nbsp;"+ education+"\
                    </div>\
                    <div class='resume-line' style='line-height: 42px;border-bottom:1px solid #eee;color:#666;'>\
                        <span style='display:inline-block;width:5px;height:5px;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;background: #e77f00;vertical-align: middle;margin: -2px 10px 0 1px;'></span>\
                        学习专业&nbsp;:&nbsp;"+major+"\
                    </div>\
                 </div>";
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.hr + "resume/list' style='color: #2f8284;text-decoration:none;'>简历管理</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td  style='padding:0 25px;font-size: 16px;color: #666;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>" + option.hr_name + "，你好！</p>\
                            <p>这是来自实习鸟的应聘简历</p>\
                             "+resume_content+"\
                            <p style='color:#666;text-align: center;margin-top: 40px;font-weight: 600;'><span style='vertical-align:middle'>*</span>&nbsp;查看完整简历请点击下面的按钮&nbsp;,&nbsp;验证码: <em style='color:#e77f00;font-style:normal'>" + option.code + "</em></p>\
                            <p class='pb' style='text-align:center;'><a href='" + url_head.hr + "resume/s/" + option.shareKey + "' style='background-color: #00ced1;padding: 8px 15px;display: inline-block;color: #fff;text-decoration: none;border-radius:3px;' class='view-resume-detail'>查看完整简历</a></p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
    /*<div class='resume-line' style='line-height: 42px;border-bottom:1px solid #eee;color:#666;'>\
     <span style='display:inline-block;width:5px;height:5px;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;background: #e77f00;vertical-align: middle;margin: -2px 10px 0 1px;'></span>\
     期望实习&nbsp;:&nbsp;" + intern_city + "&nbsp;|&nbsp;" + intern_payment + "&nbsp;|&nbsp;每周最少可实习" + intern_days + "\
     </div>\*/
};



