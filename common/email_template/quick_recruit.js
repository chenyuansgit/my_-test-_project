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

//快招 学生收到申请通过的邮件(term_id)
exports.quickRecruitApplySuccess = function (option, callback) {
    if (!option || !option.resume_name || !option.term_id) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "quickRecruit/manage' style='color: #2f8284;text-decoration:none;'>我的快招</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p><span class='stu-name'>" + option.resume_name + "</span>，你好！</p>\
                            <p style='padding-left: 32px;'>你报名的实习鸟第<span style='color: #00ced1;'>&nbsp;" + option.term_id + "&nbsp;</span>期<a href='" + url_head.www + "/quickRecruit' style='color: #00ced1;text-decoration: none;'>&nbsp;快招精选</a>，已通过申请。</p>\
                            <p style='padding-left: 32px;'>实习鸟工作人员将于两个工作日内联系你，请保持简历中电话、手机等联系方式的畅通，并及时查看消息。</p>\
                            <div style='text-align: center;margin: 30px 0;'>真诚的期待你的加入，与我们一起成长。</div>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//快招 学生收到申请未通过的邮件(term_id)
exports.quickRecruitApplyRefused = function (option, callback) {
    if (!option || !option.resume_name || !option.term_id) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "/j/search' style='color: #2f8284;text-decoration:none;'>实习机会</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p><span class='stu-name'>" + option.resume_name + "</span>，你好！</p>\
                            <p style='padding-left: 32px;'>你报名的实习鸟第<span style='color: #00ced1;'>&nbsp;" + option.term_id + "&nbsp;</span>期<a href='" + url_head.www + "/quickRecruit' style='color: #00ced1;text-decoration: none;'>&nbsp;快招精选</a>，未通过申请。</p>\
                            <p style='padding-left: 32px;'>实习鸟快招精选每周均推出新的一期，并同时开启下一期的报名，请密切关注快招页面的通知，并快快为下一期做准备吧！</p>\
                            <div style='text-align: center;margin: 30px 0;'>真诚的期待你的加入，与我们一起成长。</div>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//快招 学生收到申请待定的邮件（term_id)
exports.quickRecruitApplyDetermined = function (option, callback) {
    if (!option || !option.resume_name || !option.term_id) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "/quickRecruit/manage' style='color: #2f8284;text-decoration:none;'>我的快招</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p><span class='stu-name'>" + option.resume_name + "</span>，你好！</p>\
                            <p style='padding-left: 32px;'>你报名的实习鸟第<span style='color: #00ced1;'>&nbsp;" + option.term_id + "&nbsp;</span>期<a href='" + url_head.www + "/quickRecruit' style='color: #00ced1;text-decoration: none;'>&nbsp;快招精选</a>，未通过申请。</p>\
                            <p style='padding-left: 32px;'>你的简历已进入实习鸟快招精选优质简历库中，将有机会得到实习鸟后期快招精选的邀请和部分优质企业的推荐。</p>\
                            <p style='padding-left: 32px;'>实习鸟快招精选每周均推出新的一期，并同时开启下一期的报名，请密切关注快招页面的通知，并快快为下一期做准备吧！</p>\
                            <div style='text-align: center;margin: 30px 0;'>真诚的期待你的加入，与我们一起成长。</div>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//快招 学生收到后台快招邀请的邮件
exports.quickRecruitApplyReInvite = function (option, callback) {
    if (!option || !option.resume_name || !option.jid || !option.job_name || !option.cid || !option.company_name || !option.interview_time) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "/quickRecruit/manage' style='color: #2f8284;text-decoration:none;'>我的快招</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p><span class='stu-name'>" + option.resume_name + "</span>，你好！</p>\
                            <p style='padding-left: 32px;'>经过人工筛选，我们在简历库中发现了你的简历，现向你发出邀请，邀请你报名新一期的快招精选。</p>\
                            <p class='pb'><a href='" + url_head.www + "/quickRecruit' style='background-color: #00ced1;padding: 8px 15px;margin-left:32px;display: inline-block;color: #fff;text-decoration: none;'>前往快招</a></p>\
                            <div style='text-align: center;margin: 30px 0;'>真诚的期待你的加入，与我们一起成长。</div>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//快招 学生收到公司邀请的邮件
exports.quickRecruit = function (option, callback) {
    if (!option) {
        return callback(new Error('1'));
    }
    console.log(option.text);
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
                            <p style='margin-top: 20px;'><span class='stu-name'>" + option.user_name + "</span>，你好！</p>\
                            <p style='padding-left: 32px;'>我是&nbsp;<a class='company-name' style='color:#00ced1;text-decoration:none;' href='" + url_head.www + "company/detail/" + option.company_id + "' target='_blank'>" + option.company_name + "</a>&nbsp;HR</p>\
                            <p class='invite-content' style='padding-left: 32px;text-indent: 32px;'>" + (option.text ? option.text : '实习鸟快招为我们推荐了你。经过多方评估，我们认为你与公司实习生职位匹配度较高，现诚挚的邀请你参加我公司的实习生面试，望接受。') + "</p>\
                            <p style='padding-left: 32px;margin-top: 20px;'>适合你的职位&nbsp;&nbsp;</p>\
                            <div style='padding-left: 64px;margin-top: 5px;'>\
                                <p><a class='job' href='" + url_head.www + "job/detail/" + option.jid + "' style='color:#00ced1;text-decoration:none;' target='_blank'>" + option.job_name + "</a></p>\
                                <p class='pb' style='line-height: 28px; padding-bottom: 30px'><a style='background-color: #00ced1;padding: 8px 15px;display: inline-block;color: #fff;margin-top: 30px;text-decoration: none;' href='" + url_head.www + "quickRecruit/manage' >查看邀请</a></p>\
                            </div>\
                            <div style='text-align: center;padding-bottom: 20px;'>真诚的期待你的加入，与我们一起成长。</div>\
                        </td>\
                    </tr>\
                   " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//快招 学生接受公司邀请后收到的邮件
exports.quickRecruitAccept = function (option, callback) {
    if (!option || !option.resume_name || !option.company_name || !option.cid || !option.hr_email || !option.jid || !option.job_name) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.www + "quickRecruit/manage' style='color: #2f8284;text-decoration:none;'>我的快招</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p><span class='stu-name'>" + option.resume_name + "</span>，你好！</p>\
                            <p style='padding-left: 32px;'>你已经接受了&nbsp;<a class='company-name' style='color:#00ced1;text-decoration:none;'  href='" + url_head.www + "company/detail/" + option.cid + "'>" + option.company_name + "</a>&nbsp;的快招邀请，接受的职位为&nbsp;:&nbsp;<a class='job-name' style='color:#00ced1;text-decoration:none;' href='" + url_head + "job/detail/" + option.jid + "'>" + option.job_name + "</a></p>\
                            <p style='padding-left: 32px;margin-top: 30px;'>HR将在三日内和你联系，请耐心等待。</p>\
                            <p style='padding-left: 32px;'>同时，请保持简历中电话、邮件等联系方式的畅通，并及时查看消息。</p>\
                            <p style='padding-left: 32px;margin-top: 30px;'>" + option.company_name + "HR的联系邮箱为：<a style='color:#00ced1;text-decoration:none;' href='mailto:" + option.hr_email + "'>" + option.hr_email + "</a></p>\
                            <p style='padding-left: 32px;'>你可通过以上邮件与之联系，请勿将HR的邮箱任意泄露给他人。</p>\
                            <div style='text-align: center;margin: 30px 0;'>真诚的期待你的加入，与我们一起成长。</div>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//快招 hr收到学生接受快招邀请的邮件
exports.quickRecruitDelivery = function (option, callback) {
    if (!option || !option.job_name || !option.hr_name || !option.resume) {
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
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.hr + "resume/list' style='color: #2f8284;text-decoration:none;'>简历管理</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 30px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>" + option.hr_name + "，你好！</p>\
                            <p style='padding-left: 32px;'>求职者接受了你发出的简历投递邀请，接受的职位为：<span style='color:#00ced1'>" + option.job_name + "</span></p>\
                            <p style='padding-left: 32px;'>ta的简历已经被放到你的简历管理中，快去和ta约个面试吧～。</p>\
                            <h3 style='font-size: 16px;font-weight: 600;padding-top: 20px;'>" + option.resume.name + "的简历</h3>\
                            <p style='line-height: 28px;'>" + option.resume.name + "|" + (option.resume.male == 1 ? '男' : '女') + "</p>\
                            <p style='line-height: 28px;'>毕业院校：" + (!education ? (school + ' ') : (education + ' · ' + school)) + "</p>\
                            <p style='line-height: 28px;'>期望实习：" + intern_city + " ｜ 日薪" + intern_payment + " ｜ 最少可实习" + intern_days + " ｜</p>\
                            <p style='line-height: 28px;padding-bottom: 20px;'>目前状态：" + work_state + "</p>\
                            <p class='pb' style='line-height: 28px; padding-bottom: 30px'><a style='background-color: #00ced1;padding: 8px 15px;display: inline-block;color: #fff;margin-top: 30px;text-decoration: none;' href='" + url_head.hr + "quickRecruit/manage' >处理简历</a></p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//快招 hr收到学生拒绝快招邀请的邮件
exports.quickRecruitRefused = function (option, callback) {
    if (!option || !option.job_name || !option.hr_name || !option.resume) {
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
                            <a href='" + url_head.www + "resume/list' style='color: #2f8284;text-decoration:none;'>简历管理</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>" + option.hr_name + "，你好！</p>\
                            <p>求职者拒绝了你发出的简历投递邀请，拒绝的职位为为：<span style='color:#00ced1'>" + option.job_name + "</span></p>\
                            <p>快招栏目还有许多其他优秀的人才，快去找找看吧。</p>\
                            <p><a href='" + url_head.hr + "/quickRecruit' style='background-color: #00ced1;padding: 8px 15px;display: inline-block;color: #fff;text-decoration: none;'>前往快招</a></p>\
                            <h3 style='font-size: 16px;font-weight: 600;padding-top: 20px;'>" + option.resume.name + "的简历</h3>\
                            <p style='line-height: 28px;'>" + option.resume.name + "|" + (option.resume.male == 1 ? '男' : '女') + "</p>\
                            <p style='line-height: 28px;'>毕业院校：" + (!education ? (school + ' ') : (education + ' · ' + school)) + "</p>\
                            <p style='line-height: 28px;'>期望实习：" + intern_city + " ｜ 日薪" + intern_payment + " ｜ 最少可实习" + intern_days + " ｜</p>\
                            <p style='line-height: 28px;padding-bottom: 20px;'>目前状态：" + work_state + "</p>\
                        </td>\
                    </tr>\
                   " + _email_bottom + "\
                </table>";
    callback(null, html);
};
