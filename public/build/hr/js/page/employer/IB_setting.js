require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        },
        'js/lib/IB_plupload.full':{
            exports:'plupload'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fileUpLoad', 'js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_regex'], function ($,fileUpload, FastClick, fn, regex) {
    $(function () {
        var can_request = true;
        var hr_email = global.hr_email;
        var uid = global.uid;
        $(".new-hr-email,.new-hr-nickname,.new-hr-phone").focus(function () {
            $(this).parent().nextAll(".input-tips").remove();
        });
        $(".new-hr-email").blur(function () {
            $(this).nextAll(".input-tips").remove();
            var newEmail = $.trim($(".new-hr-email").val());
            if (!(regex.email.test(newEmail))) {
                $(this).parent().nextAll(".input-tips").remove();
                $(this).parent().after("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的电子邮箱号码</div>");
            }
        });
        $(".new-hr-nickname").blur(function () {
            $(this).nextAll(".input-tips").remove();
            var newNickname= $.trim($(".new-hr-nickname").val());
            if (!newNickname) {
                $(this).parent().nextAll(".input-tips").remove();
                $(this).parent().append("<div class='input-tips'><span class='icon-prompt'></span>昵称不能为空</div>");
            }
        });
        $(".new-hr-phone").blur(function () {
            $(this).nextAll(".input-tips").remove();
            var newPhone = $.trim($(".new-hr-phone").val());
            if(regex.phone.test(newPhone) || regex.tel.test(newPhone))
                return;
            else {
                $(this).parent().nextAll(".input-tips").remove();
                $(this).parent().append("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的手机号码或座机号(座机号的区号和号码用'-'分隔)</div>");
            }
        });

        //头像上传
        fileUpload(uid, "avatar-file", function (error, cover_img) {
            if (!error) {
                $(".avatar .loading").remove();
                $(".avatar").css({"background-image": "url('" + cover_img + "?imageView2/2/w/240/h/240')"}).attr("data-avatar",cover_img);
            }
        }, function () {
            $(".avatar").append("<div class='loading'></div>");
        });

        $(".btn-edit").click(function () {
            var newEmail = $.trim($(".new-hr-email").val());
            var newnickname = $.trim($(".new-hr-nickname").val());
            var newPhone = $.trim($(".new-hr-phone").val());
            var $this = $(this);
            var text = $this.val();
            var posPrefix = $(".pos-prefix").attr("data-type");    //邮件接收前缀
            if($(".setting-nav ul li").eq(1).hasClass("curr")) {
                if (!(regex.email.test(newEmail))) {
                    $(".input-tips").remove();
                    $(this).parent().find(".setting-edit-area").append("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的电子邮箱号码</div>");
                } /*else if (hr_email == newEmail) {
                    $(".input-tips").remove();
                    $(this).parent().find(".setting-edit-area").append("<div class='input-tips'><span class='icon-prompt'></span>请输入和原简历接收邮箱不同的邮箱</div>");
                }*/ else if (can_request) {
                    can_request = false;
                    $this.val("处理中...");
                    $.ajax({
                        type: "post",
                        url: "/employer/updateInfo",
                        dataType: "json",
                        data: {
                            option: {
                                notice_email: newEmail,
                                email_subject_template: posPrefix
                            }
                        },
                        success: function (data) {
                            can_request = true;
                            $this.val(text);
                            if (data.status == 10000) {
                                hr_email = newEmail;
                                $(".now-email").text("当前接收简历邮箱：" + newEmail);
                                if(!$this.parent().find(".input-tips").length >0) {
                                    $this.parent().append("<div class='input-tips success-edit'><span class='icon-speed'></span>修改成功！</div>");
                                    setTimeout(function () {
                                        $this.parent().find(".input-tips").remove();
                                    }, 3000);
                                }
                                //location.reload();
                            } else {
                                location.reload();
                            }
                        }
                    });
                }
            } else {
                var avatar = $(".avatar").attr("data-avatar");
                if (!newnickname) {
                    $(".input-tips").remove();
                    $(this).parent().find(".setting-edit-mail").append("<div class='input-tips'><span class='icon-prompt'></span>昵称不能为空</div>");
                /*} else if (!(regex.phone.test(newPhone)) || !(regex.tel.test(newPhone))) {
                    $(".input-tips").remove();
                    $(this).parent().find(".setting-edit-phone").append("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的手机号码或座机号</div>");*/
                } else if (can_request && (regex.phone.test(newPhone) || regex.tel.test(newPhone))) {
                    can_request = false;
                    $this.val("处理中...");
                    $.ajax({
                        type: "post",
                        url: "/employer/updateInfo",
                        dataType: "json",
                        data: {
                            option: {
                                avatar: avatar,
                                nick_name: newnickname,
                                phone: newPhone
                            }
                        },
                        success: function (data) {
                            can_request = true;
                            $this.val(text);
                            if (data.status == 10000) {
                                if(!$this.parent().find(".input-tips").length >0) {
                                    $this.parent().append("<div class='input-tips success-edit'><span class='icon-speed'></span>修改成功！</div>");
                                    setTimeout(function () {
                                        $this.parent().find(".input-tips").remove();
                                    }, 3000);
                                }
                               // location.reload();
                            } else {
                                location.reload();
                            }
                        }
                    });
                } else {
                    $(".input-tips").remove();
                    $(this).parent().find(".setting-edit-phone").append("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的手机号码或座机号(座机号的区号和号码用'-'分隔)</div>");
                }
            }
        });

    });

    //编辑
   /* $(".icon-edit").click(function () {
       var $this = $(this);
        var dataType = $this.parent().find(".setting-input").val();
        $this.parent().find(".setting-input").val("").removeAttr("readonly");
        $this.hide();
        $this.parent().find(".cancel").show().attr("data-type",dataType);
    });
    //取消
    $(".cancel").click(function () {
       var $this = $(this);
        var dataType = $this.attr("data-type");
        $this.parent().find(".setting-input").val(dataType).attr("readonly","readonly");
        $this.hide();
        $this.parent().find(".icon-edit").show();
        $this.parent().find(".input-tips").hide();
    });*/

    $(".setting-nav ul li").click(function () {
        var $this = $(this);
        if($this.hasClass("curr"))
            return
        else{
            $(".setting-nav ul li").removeClass("curr");
            $(".setting-nav ul li").find(".icon-sign").remove();
            $this.addClass("curr");
            $this.append("<span class='icon-sign'></span>");
            var i = $this.index();
            $(".setting-box").hide();
            $(".setting-box").eq(i).show();
        }
    });


    //自定义标题
    $(".custom-prefix").click(function () {
        $(".overlay,.popBox-prefix").show();
    });

    $(".popBox-area-btn .confirm").click(function () {
        var prefix = $(".custom-pop-prefix").val();
       /* var job = prefix.indexOf("职位名称")>=0?"job":"";
        var male = prefix.indexOf("性别")>=0?"male":"";
        var name = prefix.indexOf("姓名")>=0?"name":"";
        var school = prefix.indexOf("学校")>=0?"school":"";
        var education = prefix.indexOf("最高学历")>=0?"education":"";
        var major = prefix.indexOf("专业")>=0?"major":"";*/
        /*
        $(".pos-prefix").val(prefix).attr("data-type", job.length>0?job+"-":"" + male.length>0?male+"-":"" + name.length>0?name+"-":"" + school.length>0?school+"-":"" +education.length>0?education+"-":"" + major.length>0?major+"-":"");
        */
        var dataType = (prefix.indexOf("职位名称")>=0?"job-":"") + (prefix.indexOf("性别")>=0?"male-":"") + (prefix.indexOf("姓名")>=0?"name-":"") + (prefix.indexOf("学校")>=0?"school-":"") + (prefix.indexOf("最高学历")>=0?"education-":"") + (prefix.indexOf("专业")>=0?"major-":"");
        var dataTypePrefix = dataType.substring(0,dataType.length-1);
        $(".pos-prefix").val(prefix).attr("data-type", dataTypePrefix);
        $(".overlay, .popBox-prefix").hide();
    });

    $(".popBox-area-btn .cancel, .overlay").click(function () {
        $(".overlay, .popBox-prefix").hide();
    });

    //添加下拉样式
    $(".pos-drop-down").click(function (e) {
        var $this = $(this);
        if(!$this.hasClass("cur")) {
            $this.find(".icon-down-arrow").remove();
            $this.addClass("cur").append("<span class='icon-up-arrow'></span>");
            $this.next().show();
        } else {
            $(this).find(".icon-up-arrow").remove();
            $(this).removeClass("cur").append("<span class='icon-down-arrow'></span>");
            $this.next().hide();
        }
        e.stopPropagation();
    });

    $(document).click(function (e) {
        if($(".icon-up-arrow").length>0) {
            $(".icon-up-arrow").parent().removeClass("cur").append("<span class='icon-down-arrow'></span>");
            $(".icon-up-arrow").parent().next().hide();
            $(".icon-up-arrow").parent().find(".icon-up-arrow").remove();
        }
        var event = e || window.event;
        event.stopPropagation();
    });

    //选项
    $(".selector li").on("click",function(e){
        var event = e || window.event;
        event.stopPropagation();
        var oSelector = $(this).parent();
        var btnSel = $(oSelector).prev(".btn-selector").find("input");

        //切换下拉箭头
        $(this).parents(".selector").prev().removeClass("cur").append("<span class='icon-down-arrow'></span>");
        $(this).parents(".selector").prev().find(".icon-up-arrow").remove();

        if(!$(this).hasClass("custom-prefix"))
            $(btnSel).val($(this).text()).attr("data-type",$(this).attr("data-type"));
        $(oSelector).hide();
    });

});
