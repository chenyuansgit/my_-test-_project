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
                            <p style='line-height:20px'>如您需招收更多实习生或者使用我们的人才库邀请实习生功能，请您直接将职位发布到实习鸟官网上：<a style='color: #00ced1;text-decoration: none;' href='" + url_head.hr + "job/add?from=email' target='_blank'>点击发布</a>。</p>\
                            <p style='line-height:20px'>Email：<a href='mailto:service@internbird.com' target='_blank' style='color:#00ced1;text-decoration: none'>service@internbird.com</a>，电话：010-57460008</p>\
                            <p class='add-mail' style='margin-top: 25px;line-height:20px;'>为保证邮箱正常接收，请将<a style='color: #00ced1;text-decoration: none;' href='mailto:noreply@mail.internbird.com' target='_blank'>noreply@mail.internbird.com</a>添加进你的通讯录</p>\
                        </td>\
                    </tr>";
exports.delivery = function (option, callback) {
    if (!option || !option.det_id || !option.job_name || !option.hr_name || !option.resume || !option.shareKey || !option.code) {
        return callback(new Error('1'));
    }
    var resume = option.resume, avatar, education, school, major, intern_city, intern_payment, intern_days, work_state;
    var payment_text = ["不限", "50以下", "50-100", "100-200", "200-500", "500以上"];
    var days_text = ["1-2天", "3天", "4天", "5天", "6-7天"];
    try {
        education = JSON.parse(resume.education_detail)[0].stage || "";
        school = JSON.parse(resume.education_detail)[0].school;
        major = JSON.parse(resume.education_detail)[0].major;
        intern_city = resume.intern_expect_city;
        var days_type = parseInt((resume.intern_expect_days_type));
        intern_days = days_text[days_type - 1];
        switch (parseInt(resume.intern_expect_min_payment)) {
            case 0 :
                intern_payment = payment_text[0];
                break;
            case 1 :
                intern_payment = payment_text[1];
                break;
            case 50 :
                intern_payment = payment_text[2];
                break;
            case 100 :
                intern_payment = payment_text[3];
                break;
            case 200:
                intern_payment = payment_text[4];
                break;
            case 500:
                intern_payment = payment_text[5];
                break;
            default :
                intern_payment = payment_text[0];
                break;
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
        return callback(e);
    }
    if (resume.avatar && resume.avatar != 'undefined') {
        avatar = resume.avatar;
    } else {
        avatar = 'http://image.internbird.com/21232f297a57a5a743894a0e4a801fc3/2b7468a989c8efc6b98b4d9a565c9872.png';
    }

    var border_color = option.resume.male == 1 ? '#4ed0cd' : '#f29c9f';
    var resume_content = "<div class='resume-content' style='box-shadow: 0 2px 2px #ddd;background-color:#fbfbfb;padding:20px 25px 40px;'>\
                    <div class='resume-top' style='position:relative;height:100px;padding: 20px 0;'>\
                        <div class='avatar' style='-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;border:2px solid " + border_color + ";position:absolute;width:100px;height:100px;background:url(" + avatar + ") 0 0 no-repeat;background-size: cover;background-position: center;'></div>\
                        <div class='top-right' style='position:absolute;margin:5px 0 0 150px;font-weight:600;padding-left:40px;border-left:1px solid " + border_color + ";'>\
                            <p>" + option.resume.name + "&nbsp;|&nbsp;" + (option.resume.male == 1 ? '男' : '女') + "</p>\
                            <p>应聘职位&nbsp;:&nbsp;<a style='color:#00ced1;text-decoration:none;' href='" + url_head.www + "det/detail/"+option.det_id+"'>" + option.job_name + "</a></p>\
                        </div>\
                    </div>\
                    <div class='resume-line' style='line-height: 42px;border-top:1px solid #eee;border-bottom:1px solid #eee;color:#666;margin-top:15px;'>\
                        <span style='display:inline-block;width:5px;height:5px;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;background: #e77f00;vertical-align: middle;margin: -2px 10px 0 1px;'></span>\
                        毕业院校&nbsp;:&nbsp;" + school + "&nbsp;|&nbsp;" + education + "\
                    </div>\
                    <div class='resume-line' style='line-height: 42px;border-bottom:1px solid #eee;color:#666;'>\
                        <span style='display:inline-block;width:5px;height:5px;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;background: #e77f00;vertical-align: middle;margin: -2px 10px 0 1px;'></span>\
                        学习专业&nbsp;:&nbsp;" + major + "\
                    </div>\
                 </div>";
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                            <a href='" + url_head.hr + "job/add?from=email' style='color: #2f8284;text-decoration:none;'>发布更多职位</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td  style='padding:0 25px;font-size: 16px;color: #666;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>" + option.hr_name + "，你好！</p>\
                            <p>这是来自实习鸟的应聘简历</p>\
                             " + resume_content + "\
                            <p style='color:#666;text-align: center;margin-top: 40px;font-weight: 600;'><span style='vertical-align:middle'>*</span>&nbsp;查看完整简历请点击下面的按钮&nbsp;,&nbsp;验证码: <em style='color:#e77f00;font-style:normal'>" + option.code + "</em></p>\
                            <p class='pb' style='text-align:center;'><a href='" + url_head.hr + "resume/det/" + option.shareKey + "' style='background-color: #00ced1;padding: 8px 15px;display: inline-block;color: #fff;text-decoration: none;border-radius:3px;' class='view-resume-detail'>查看完整简历</a></p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";

    callback(null, html);
};



