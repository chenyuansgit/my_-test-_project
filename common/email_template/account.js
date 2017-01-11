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
                            <p style='line-height:20px;'>忘记密码可<a style='color:#00ced1;text-decoration:none;' href='" + url_head.account + "findPwd'>点击这里</a>修改</p>\
                            <p style='line-height:20px'>若有任何问题，可与我们联系，我们将尽快帮你解决。</p>\
                            <p style='line-height:20px'>Email：<a href='mailto:service@internbird.com' target='_blank' style='color:#00ced1;text-decoration: none'>service@internbird.com</a>，电话：010-57460008</p>\
                            <p class='add-mail' style='margin-top: 25px;line-height:20px;'>为保证邮箱正常接收，请将<a style='color: #00ced1;text-decoration: none;' href='mailto:noreply@mail.internbird.com' target='_blank'>noreply@mail.internbird.com</a>添加进你的通讯录</p>\
                        </td>\
                    </tr>";
//验证账户邮箱
exports.accountValidate = function (option, callback) {
    if (!option || !option.url) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>欢迎注册实习鸟平台账号</p>\
                            <p style='line-height: 28px;width:100%;word-break:break-all;'>请点击以下链接验证你的注册邮箱，以便及时找回密码和享受其他更好的服务：<a style='color:#00ced1;' href='" + option.url + "'>" + option.url + "</a></p>\
                            <p class='pt pb' style='line-height: 28px; padding-bottom: 30px;padding-top: 25px;'>如果以上链接无法访问，请将该链接复制并粘贴到浏览器窗口中并访问。</p>\
                            <p style='line-height: 28px;'>实习鸟团队</p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//验证企业邮箱
exports.companyValidate = function (option, callback) {
    if (!option || !option.url) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>欢迎使用实习鸟招聘服务</p>\
                            <p style='line-height: 28px;width:100%;word-break:break-all;'>请点击以下链接验证你的接收简历邮箱，以开通招聘服务<a style='color:#00ced1;' href='" + option.url + "'>" + option.url + "</a></p>\
                            <p class='pt pb' style='line-height: 28px;padding-bottom: 30px;padding-top: 25px;'>如果以上链接无法访问，请将该链接复制并粘贴到浏览器窗口中并访问。</p>\
                            <p style='line-height: 28px;'>实习鸟团队</p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//验证找回密码(激活链接方式)
exports.accountFindPwd = function (option, callback) {
    if (!option || !option.url) {
        return callback(new Error('1'));
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>欢迎使用实习鸟平台</p>\
                            <p style='line-height: 28px;width:100%;word-break:break-all;'>请点击以下链接验证你的注册邮箱，以便完成找回密码步骤：<a style='color:#00ced1;' href='" + option.url + "'>" + option.url + "</a></p>\
                            <p class='pt pb' style='line-height: 28px;padding-bottom: 30px;padding-top: 25px;'>如果以上链接无法访问，请将该链接复制并粘贴到浏览器窗口中并访问。</p>\
                            <p style='line-height: 28px;'>实习鸟团队</p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};
//验证找回密码(验证码方式)
exports.accountFindPwdCode = function (option, callback) {
    if (!option || !option.code) {
        return callback(1);
    }
    var html = "<table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
                    <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='" + url_head.www + "public/build/www/img/mail/mail-top.png'>\
                      <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
                        <div class='header-right' style='position: absolute; bottom: 10px; right:15px;text-decoration:none;'>\
                            <a href='" + url_head.www + "' style='color: #2f8284;text-decoration:none;margin-right: 15px;'>首页</a>\
                        </div>\
                      </td>\
                    </tr>\
                    <tr class='mail-content' style='padding:25px 20px;line-height: 30px'>\
                        <td style='padding:0 25px;font-size: 16px;'>\
                            <p style='line-height: 28px;margin-top: 20px;'>欢迎使用实习鸟平台</p>\
                            <p style='line-height: 28px;margin-top: 20px;'>请复制下面的验证码到你发出找回密码请求的页面。</p>\
                            <p style='line-height: 28px;margin-top: 20px;font-size: 40px;font-weight: 600;'>"+option.code+"</p>\
                            <p style='line-height: 28px;'>实习鸟团队</p>\
                        </td>\
                    </tr>\
                    " + _email_bottom + "\
                </table>";
    callback(null, html);
};



