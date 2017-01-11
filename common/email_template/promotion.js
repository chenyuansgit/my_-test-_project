exports.det_notification = function (resumes) {
    var resume_html = '';
    for (var i = 0, len = resumes.length; i < len && resumes[i]; ++i) {
        var sex_borderColor = resumes[i].male ? '#00ced1' : '#f29c9f', education_detail;
        var bg_avatar = resumes[i].avatar && resumes[i].avatar != 'undefined' ? 'background-image:url(' + resumes[i].avatar + '?imageView2/2/w/200/h/200' + ')' : '';
        try {
            education_detail = JSON.parse(resumes[i].education_detail);
        } catch (e) {
        }
        var self_desc = resumes[i].self_desc.replace(/(<[^>]*>)/g, '').trim();
        self_desc = self_desc.length > 30 ? self_desc.substr(0, 30) + '...' : self_desc;

        var intern_expect = [];
        intern_expect.city = resumes[i].intern_expect_city;
        intern_expect.position = resumes[i].intern_expect_position;
        switch (parseInt(resumes[i].intern_expect_min_payment)) {
            case 0 :
                intern_expect.payment = '不限';
                break;
            case 1 :
                intern_expect.payment = '0-50元/天';
                break;
            case 50 :
                intern_expect.payment = '50-100元/天';
                break;
            case 100 :
                intern_expect.payment = '100-200元/天';
                break;
            case 200 :
                intern_expect.payment = '200-500元/天';
                break;
            case 500 :
                intern_expect.payment = '500元以上';
                break;
        }
        switch (parseInt(resumes[i].intern_expect_days_type)) {
            case 1 :
                intern_expect.days = '1-2天/周';
                break;
            case 2:
                intern_expect.days = '3天/周';
                break;
            case 3 :
                intern_expect.days = '4天/周';
                break;
            case 4 :
                intern_expect.days = '5天/周';
                break;
            case 5 :
                intern_expect.days = '6-7天/周';
                break;
        }
        var self_state = '我暂时无法实习';
        switch (parseInt(resumes[i].work_state)) {
            case 0:
                self_state = '我在学校，可实习';
                break;
            case 1:
                self_state = '我在实习，想换份实习';
                break;
            case 2:
                self_state = '我在公司所在城市，可来实习';
                break;
            case 3:
                self_state = '我暂时无法实习';
                break;
        }
        resume_html += "<a href='http://hr.internbird.com/talentPool/detail/" + resumes[i].user_id + "' target='_blank'  class='talent-info talent-info-hr' style='display:block;text-decoration:none;color:#333;width:500px;background:#fff;position:relative;'>\
            <div class='info-content clearfix' style='padding-bottom: 30px;position: relative'>\
            <div class='info-l' style='width: 190px; text-align: center;'>\
            <div class='avatar' style='width: 100px;height: 100px;border:2px solid " + sex_borderColor + ";border-radius: 50%;margin: 20px auto 0;background:0 0 no-repeat;background-position:center;background-size:contain;" + bg_avatar + "'></div>\
            <h3 class='name' style='color: #333;margin: 10px 0 0;font-size: 16px;'>" + resumes[i].name + "</h3>\
            <p class='school ellipsis' style='color: #666;font-size: 13px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;margin: 5px 0 2px;max-width: 190px;'>" + education_detail[0].school + "</p>\
            <p class='clearfix edu-detail' style='text-align: center;width: 100%;margin-top: 7px;'>\
            <span class='major ellipsis' style='color: #666;font-size: 13px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;max-width: 128px;'>" + education_detail[0].major + "</span>\
            <span class='ellipsis' style='overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'>-</span>\
            <span class='stage ellipsis' style='color: #666;font-size: 13px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;'>" + education_detail[0].stage + "</span>\
            </p>\
            </div>\
            <div class='info-r' style='position: absolute;width:280px;left: 195px;top:0;font-size: 13px;'>\
            <p class='info-line clearfix'>\
            <span class='title'>期待职位&nbsp;:&nbsp;</span>\
        <span class='hope-position ellipsis' style='overflow: hidden;white-space: nowrap;text-overflow: ellipsis;max-width: 112px;'>" + intern_expect.position + "</span>\
            <span>-</span>\
            <span class='hope-city ellipsis' style='overflow: hidden;white-space: nowrap;text-overflow: ellipsis;max-width: 70px;'>" + intern_expect.city + "</span>\
            </p>\
            <p class='info-line clearfix'>\
            <span class='title'>实习薪资&nbsp;:&nbsp;</span>\
        <span class='hope-payment'>" + intern_expect.payment + "</span>\
            </p>\
            <p class='info-line clearfix'>\
            <span class='title'>实习时间&nbsp;:&nbsp;</span>\
        <span class='hope-days'>" + intern_expect.days + "</span>\
        </p>\
        <p class='info-line clearfix'>\
            <span class='title'>求职状态&nbsp;:&nbsp;</span>\
        <span class='self-state'>" + self_state + "</span>\
        </p>\
        <p class='info-line clearfix'>\
            <span class='title'>自我评价&nbsp;:&nbsp;</span>\
        <em class='self-desc'style='font-style: normal;'>" + (self_desc || '这家伙很懒什么都没有写...') + "</em>\
            </p>\
            <div class='btn-area' style='text-align: right;'>\
              <span  style=' padding: 4px 20px;border-radius: 3px;color: #00ced1;font-size: 14px;border: 2px solid #00ced1;'>邀请</span>\
            </div>\
            </div>\
            </div>\
            </a>";
    }
    return "<!DOCTYPE html>\
        <html lang='zh-CN'>\
        <head>\
        <meta charset='UTF-8'>\
        <title>招聘推广邮件</title>\
        </head>\
        <body>\
        <table id='mail' cellpadding='0' cellspacing='0' width='640' border='0' align='center' style='margin: 0 auto;border: 1px solid #eee;font-size: 16px;font-family: Hiragino Sans GB, Microsoft Yahei, SimSun;'>\
        <tbody>\
        <tr class='mail-header' style='width: 640px; height: 130px;position: relative;' background='http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/c1446806e2080a00a88025de2daaa91c.png'>\
        <td style='width: 640px; height: 130px;position: relative;font-size: 16px;'>\
    <div class='header-right' style='position: absolute; bottom: 10px; right:15px;'>\
    <a href='http://www.internbird.com/' target='_blank' style='color: #2f8284;margin-right: 15px;text-decoration:none;'>首页</a>\
    <a href='http://hr.internbird.com/resume/list' target='_blank' style='color: #2f8284;text-decoration:none;'>简历管理</a>\
    </div>\
    </td>\
    </tr>\
    <tr class='mail-content' style=''>\
    <td  style='padding:0 25px;font-size: 16px;color: #666'>\
    <p>Dear 招聘官大人:</p>\
    <div style='margin-left: 32px;'>\
    <p>您好!从网上得知您有招聘实习生的需求,真诚的邀请您来实习鸟</p>\
    <p><a href='http://www.internbird.com' target='_blank' style='color:#00ced1;text-decoration:none;'>www.internbird.com</a>上<i style='color:#00ced1;font-style:normal;'>免费</i>发布招聘信息</p>\
    <p>1.实习鸟是一家专注于大学生实习校招的招聘平台;</p>\
    <p>2.所有的注册发布都是免费的;</p>\
    <p>3.网站上学生的<i style='color:#00ced1;font-style:normal;'>简历</i>也是<i style='color:#00ced1;font-style:normal;'>免费</i>查看的。</p>\
    <p>我们是一家创业公司,已获得<i style='color:#00ced1;font-style:normal;'>天使轮投资。</i></p>\
    <p>以下是为您挑选的部分学生简历,快来网站查阅完整简历,看看有没有您</p>\
    <p>想要的萝卜吧!</p>\
    </div>\
    <div class='resumes' style='width:500px;margin:0 auto;border:1px solid #eee;'>" + resume_html + "</div>\
    <div style='margin: 15px 42px 15px 18px;text-align:right;'>\
    <a href='http://hr.internbird.com/quickRecruit' style='padding: 5px 10px;border-radius: 3px;color:#fff;font-size: 14px;background:#00ced1;border: 2px solid #00ced1;text-decoration: none;cursor: pointer;'>查看更多</a>\
        </div>\
    <p style='margin-left: 32px;'>您有任何的招聘需求、建议、投诉或者其他问题，欢迎和我们的职位君联系。</p>\
    <div style='position: relative;margin-left: 32px;'>\
        <div>\
        <p>职位君联系方式在此:</p>\
    <p>微信&nbsp;:&nbsp;internbd110</p>\
    <p>QQ&nbsp;:&nbsp;1520962535</p>\
    <p>电话&nbsp;:&nbsp;010-57460009</p>\
    <p>手机&nbsp;:&nbsp;18310276287</p>\
    <p>祝您工作愉快!</p>\
    </div>\
    <div style='text-align:center;position:absolute; top:5px;left:350px;'>\
        <img class='with:158px;height:158px;' src='http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/fdbd5cddb8b987f94269c9737e1042fd.png' alt='职位君二维码'/>\
        <p>职位君微信二维码</p>\
        </div>\
        </div>\
        </td>\
        </tr>\
        <tr class='mail-bottom' style='width: 640px; height: 149px;' background='http://image.internbird.com/21232f297a57a5a743894a0e4a801fc3/9f8a3afd0bc0f80b2bd5f405e018135e.png'>\
        <td></td>\
        </tr>\
        <tr class='mail-footer' style='padding:25px 20px;line-height: 20px;color: #666;'>\
        <td style='padding:0 25px;font-size: 15px;'>\
        <p style='line-height:20px;margin-top: 20px;'>该邮件为实习鸟系统邮件，<span style='color:#ff2525'>请勿直接回复。</span></p>\
    <p style='line-height:20px;'>忘记密码可<a style='color:#00ced1;text-decoration:none;' href='http://account.internbird.com/findPwd' target='_blank'>点击这里</a>修改</p>\
        <p style='line-height:20px'>若有任何问题，可与我们联系，我们将尽快帮你解决。</p>\
    <p style='line-height:20px'>Email：<a href='mailto:service@internbird.com' target='_blank' style='color:#00ced1;text-decoration: none'>service@internbird.com</a>，电话：010-57460008</p>\
    <p class='add-mail' style='margin-top: 25px;line-height:20px;'>为保证邮箱正常接收，请将<a style='color: #00ced1;text-decoration: none;' href='mailto:noreply@mail.internbird.com' target='_blank'>noreply@mail.internbird.com</a>添加进你的通讯录</p>\
    </td>\
    </tr>\
    </tbody>\
    </table>\
    </body>\
    </html>";
};