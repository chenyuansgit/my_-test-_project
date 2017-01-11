require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/web/lib/IB_jquery': {
            exports: '$'
        },
        'js/web/plugin/IB_jquery.cookie': {
            deps:['js/web/lib/IB_jquery'],
            exports: 'cookie'
        }
    }
});

require(['js/web/lib/IB_jquery', 'js/web/plugin/IB_jquery.cookie','js/web/lib/IB_fastclick','js/web/common/IB_fn','js/web/common/IB_regex'], function ($, cookie, FastClick, fn, regex) {
    var authUtil = {
        getAuthUrl : function(type,forward){
            var authUrl = "";
            switch(type){
                case "wechat" : authUrl = "/oauth/wechat/redirect?forward="+forward;break;
                case "weibo" : authUrl= "";break;
                case "qq" : authUrl =  "";break;
            }
            return authUrl;
        },
        jumpAuth : function(type,forward){
            var authUrl = authUtil.getAuthUrl(type,forward);
            window.open(authUrl);
        }
    };
    $(function(){
        var can_request = true;
        $(".req").focus(function(){
            $(this).nextAll(".input-tips").remove();
        });

        //页面刚进来,加载图形验证码
        getcode();

        if($.cookie("codeTime_phone_reset")>0){
            showTime("codeTime_phone_reset",".btn-resend-code",".btn-send-code");
        }

        $(".reset-title li").click(function(){
            $(".req").val("");
            $(".reset-title li.curr").removeClass("curr");
            $(this).addClass("curr");
            $(".input-tips").remove();
            if($(this).text() == "邮箱找回"){
                $(".reset-step.curr").removeClass("curr");
                $(".step-email-1").addClass("curr");
                $.cookie("codeTime_phone_reset",0);
            }else{
                $(".reset-step.curr").removeClass("curr");
                $(".step-phone-1").addClass("curr");
            }
        });
        $("#next-email").click(function(){
            var email = $.trim($("#reset-email").val());
            if(!regex.email.test(email)){
                $("#reset-email").nextAll(".input-tips").remove();
                $("#reset-email").after("<span class='input-tips'>请输入有效的电子邮箱号码</span>");
            }else if(can_request){
                can_request = false;
                $("#next-email").val("邮件发送中...");
                $.ajax({
                    type:"POST",
                    url:"/api/mail/findPwd",
                    dataType:"json",
                    data:{
                        option:{
                            email:email
                        }
                    },
                    success:function(data){
                        $("#next-email").val("下一步");
                        can_request = true;
                        if(data.status == 10000){
                            $(".input-tips").remove();
                            $(".reset-step.curr").removeClass("curr");
                            $(".step-email-2").addClass("curr");
                        }else if(data.status == 10006){
                            $("#reset-email").nextAll(".input-tips").remove();
                            $("#reset-email").after("<span class='input-tips'>用户不存在</span>");
                            $.cookie("codeTime_phone_reset",0);
                        }else if(data.status == 10005){
                            $.cookie("codeTime_phone_reset",0);
                            $("#reset-email").nextAll(".input-tips").remove();
                            $("#reset-email").after("<span class='input-tips'>服务器繁忙,请稍后重试</span>");
                        }
                    }
                });
            }
        });

        $(".enter-input").blur(function(){
            if($(this).hasClass("reg-phone")){
                if(!regex.phone.test($(this).val().trim())){
                    $(this).after("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的11位手机号码</div>");
                }
            }else if($(this).hasClass("reg-code-machine")){
                if($(this).val().trim() == "" ){
                    $(this).after("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的图形码</div>");
                }
            }else if($(this).hasClass("reg-email")){
                if(!regex.email.test($(this).val().trim())){
                    $(this).after("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的邮箱号码</div>");
                }
            }else if($(this).hasClass("reg-pwd")){
                if(!regex.pwd.test($(this).val().trim())){
                    $(this).after("<div class='input-tips'><span class='icon-prompt'></span>请输入6-22位的密码</div>");
                }
            }else if($(this).hasClass("reg-code-phone")){
                if(!regex.code.test($(this).val().trim())){
                    $(".code-area").append("<div class='input-tips fl'><span class='icon-prompt'></span>请输入4位数字验证码</div>");
                }
            }
        });
        $(".enter-input").focus(function(){
            $(this).nextAll(".input-tips").remove();
        });

        //手机号找回
        $(".btn-send-code").click(function(){
            var phone = $.trim($("#reset-phone").val());
            var machine = $(".reg-code-machine").val().trim();
            if(regex.phone.test(phone) && can_request && machine.length>0){
                can_request = false;
                $.ajax({
                    type:"POST",
                    url:"/api/sendFindPwdCode",
                    dataType:"json",
                    data:{
                        option:{
                            account_name:phone,
                            vcode:machine
                        }
                    },
                    success:function(data){
                        can_request = true;
                        if(data.status == 10006){
                            $("#reset-phone").nextAll(".input-tips").remove();
                            $("#reset-phone").after("<span class='input-tips'>用户不存在</span>");
                            $.cookie("codeTime_phone_reset",0);
                        }else if(data.status == 10005){
                            $.cookie("codeTime_phone_reset",0);
                            $("#reset-phone").nextAll(".input-tips").remove();
                            $("#reset-phone").after("<span class='input-tips'>服务器繁忙,请稍后重试</span>");
                        }else if(data.status == 10007) {
                            if(!$(".reg-code-machine").nextAll().hasClass("input-tips"))
                                $(".reg-code-machine").parent().append("<div class='input-tips'><span class='icon-prompt'></span>图片验证码不正确!</div>");
                            else
                                return;
                        } else {
                            $.cookie("codeTime_phone_reset",60,60,{expireType:"s"});
                            showTime("codeTime_phone_reset",".btn-resend-code",".btn-send-code");
                        }
                    }
                });
            }else {
                if(!$(".reg-phone").nextAll().hasClass("input-tips") && !regex.phone.test(phone)){
                    $(".reg-phone").parent().append("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的11位手机号码</div>");
                }
                if(!$(".reg-code-machine").nextAll().hasClass("input-tips") && !machine.length>0){
                    $(".reg-code-machine").parent().append("<div class='input-tips'><span class='icon-prompt'></span>请输入图片验证码</div>");
                }
                /*$("#reset-phone").nextAll(".input-tips").remove();
                 $("#reset-phone").after("<span class='input-tips'>请输入正确的手机号码</span>");*/
            }
        });
        $(".btn-reset-phone").click(function(){
            var $this = $(this);
            var code = $.trim($("#code").val());
            var phone = $.trim($("#reset-phone").val());
            var newPwd = $.trim($("#pwd-phone").val());
            if(!regex.phone.test(phone)){
                $("#reset-phone").nextAll(".input-tips").remove();
                $("#reset-phone").after("<span class='input-tips'>请输入正确的手机号码</span>");
            }else if(!regex.code.test(code)) {
                $(".code-area .input-tips").remove();
                $(".code-area").append("<span class='input-tips'>请输入4位数字验证码</span>");
            }else if(!regex.pwd.test(newPwd)){
                $("#pwd-phone").nextAll(".input-tips").remove();
                $("#pwd-phone").after("<span class='input-tips'>请输入6-22位的新密码</span>");
            }else if(can_request){
                can_request = false;
                $this.val("重置中...");
                $.ajax({
                    type:"POST",
                    url:"/api/pwd/reset?by=phone",
                    dataType:"json",
                    data:{
                        option:{
                            phone:phone,
                            code:code,
                            password:newPwd
                        }
                    },
                    success:function(data){
                        $this.val("重置密码");
                        can_request = true;
                        if(data.status == 10000){
                            $(".input-tips").remove();
                            $(".reset-step.curr").removeClass("curr");
                            $(".step-phone-2").addClass("curr");
                        }else if(data.status == 10011){
                            $(".code-area .input-tips").remove();
                            $(".code-area").append("<span class='input-tips'>验证码失效或过期</span>");
                        }else if(data.status == 10012){
                            $(".code-area .input-tips").remove();
                            $(".code-area").append("<span class='input-tips'>验证码错误</span>");
                        }
                    }
                });
            }
        });

        var forward = decodeURIComponent(fn.getUrlPara("forward"));
        //邮箱找回
        var key=fn.getUrlPara("k");
        $("#btn-reset-email").click(function(){
            var pwd = $.trim($("#reset-pwd").val());
            if(!pwd || !regex.pwd.test(pwd)){
                $("#reset-pwd").nextAll(".input-tips").remove();
                $("#reset-pwd").after("<span class='input-tips'>请输入6-22位的密码</span>");
            }else if(can_request){
                can_request = false;
                $("#btn-reset-email").val("重置中...");
                $.ajax({
                    type:"post",
                    url:"/api/pwd/reset?by=email",
                    dataType:"json",
                    data:{
                        option:{
                            password:pwd,
                            key:key
                        }
                    },
                    success:function(data){
                        $("#btn-reset-email").val("重置密码");
                        can_request = true;
                        if(data.status == 10000){
                            $(".reset-step.curr").removeClass("curr");
                            $(".step-email-4").addClass("curr");
                        }else if(data.status == 10011){
                            $("#reset-pwd").nextAll(".input-tips").remove();
                            $("#reset-pwd").after("<span class='input-tips'>验证邮件过期，请重新获取验证邮件</span>");
                        }
                    }
                });
            }
        });

        //微信登录跳转
        $(".third-type").click(function () {
            /*$(".overlay, #wxLogContainer").show();*/
            var type = $(this).attr("data-type");
            var authRedirUrl = encodeURIComponent(forward || global.host.www+"/userCenter");
            authUtil.jumpAuth(type,authRedirUrl);
        });

    });

    function getcode() {
        var curtime = +new Date;
        $(".machine-code").attr("src","/vcode/create?time="+curtime);
    }

    $(".btn-refresh").click(function () {
        //重新刷新图形验证码
        getcode();
    });

    function showTime(cookie,resendArea,sendArea){
        if(fn.cookie(cookie)>0){
            var t = fn.cookie(cookie);
            $(resendArea).show();
            $(sendArea).hide();
            $(resendArea).val(t+"秒后重试");
            fn.cookie(cookie,t-1,t-1,{expireType:"s"});
            setTimeout(function(){
                showTime(cookie,resendArea,sendArea);
            },1000);
        }else{
            $(resendArea).hide();
            $(sendArea).show();
            return false;
        }
    }

});




