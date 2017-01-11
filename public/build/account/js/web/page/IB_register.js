//用户注册
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/web/lib/IB_jquery':{
            exports:'$'
        },
        'js/web/plugin/IB_jquery.cookie': {
            deps:['js/web/lib/IB_jquery'],
            exports: 'cookie'
        }
    }
});

require(['js/web/lib/IB_jquery','js/web/plugin/IB_jquery.cookie', 'js/web/lib/IB_fastclick', 'js/web/common/IB_fn','js/web/page/setting/IB_auth', 'js/web/common/IB_regex'], function ($, cookie, FastClick, fn,authUtil, regex) {
    $(function(){
        var can_request = true;
        if($.cookie("codeTime_phone_reg")>0){
            showTime("codeTime_phone_reg",".btn-resend-code",".btn-send-code");
        }
        $(".box-head li").click(function(){
            $(".box-head li.curr").removeClass("curr");
            $(".btn-type.on").removeClass("on");
            $(".btn-type[data-type='0']").addClass("on");
            $(this).addClass("curr");
            if($(this).text()=="邮箱注册"){
                $(".enter-input").nextAll(".input-tips").remove();
                $(".enter-body-phone").hide();
                $(".enter-body-email").show();
            }else if($(this).text()=="手机号注册"){
                $(".enter-input").nextAll(".input-tips").remove();
                $(".enter-body-email").hide();
                $(".enter-body-phone").show();
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


        $(".btn-type").click(function(){
            $(".btn-type.on").removeClass("on");
            $(this).addClass("on");
        });
        var forward = decodeURIComponent(fn.getUrlPara("forward"));
        /*邮箱注册*/
        $(".enter-body .btn-reg-email").click(function(){
            var $this = $(this);
            var text = $(this).val();
            if(can_request){
                var email = $(".reg-email").val().trim();
                var password = $(".reg-pwd-email").val().trim();
                if(!regex.email.test(email)){
                    $(".reg-email").nextAll(".input-tips").remove();
                    $(".reg-email").after("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的邮箱号码</div>");
                }else if(!regex.pwd.test(password)){
                    $(".reg-pwd-email").nextAll(".input-tips").remove();
                    $(".reg-pwd-email").after("<div class='input-tips'><span class='icon-prompt'></span>请输入6-22位的密码</div>");
                }else{
                    can_request = false;
                    $this.val("注册中...");
                    $.ajax({
                        type:"post",
                        url:"/api/register?by=email",
                        dataType:"json",
                        data:{
                            option:{
                                email:email,
                                password:password
                            }
                        },
                        success:function(data){
                            $this.val(text);
                            can_request = true;
                            if(data.status == 10000){
                                $.cookie("user_rem",email,{expires:10000});
                                $.ajax({
                                    type:"POST",
                                    url:"/api/sendEmail",
                                    dataType:"json",
                                    data:{
                                        option:{
                                            address:email
                                        }
                                    },
                                    success:function(data){}
                                });
                                if($(".btn-type.on").data("type") == "1"){
                                    location.href= global.host.hr+"/company/validate?step=1";
                                }else if(forward){
                                    location.href = forward;
                                }else{
                                    location.href = global.host.www+'/resumeCreate';
                                }
                            }else if(data.status == 10001){
                                $(".reg-email").nextAll(".input-tips").remove();
                                $(".reg-email").after("<div class='input-tips'><span class='icon-prompt'></span>该邮箱已被注册</div>");
                            }else if(data.status == 10005){
                                $(".reg-email").nextAll(".input-tips").remove();
                                $(".reg-email").after("<div class='input-tips'><span class='icon-prompt'></span>服务器错误，请稍后重试</div>");
                            }
                        }
                    });
                }
            }
        });

        //手机号注册
        $(".btn-send-code").click(function(){
            var phone = $(".reg-phone").val().trim();
            var machine = $(".reg-code-machine").val().trim();
            if(regex.phone.test(phone) && machine.length>0){
                if(can_request){
                    can_request = false;
                    $.ajax({
                        type:"POST",
                        url:"/api/sendCode?type=register",
                        dataType:"json",
                        data:{
                            option:{
                                phone:phone,
                                vcode:machine
                            }
                        },
                        success:function(data){
                            can_request = true;
                            if(data.status == 10001){
                                $(".reg-phone").nextAll(".input-tips").remove();
                                $(".reg-phone").after("<div class='input-tips'><span class='icon-prompt'></span>该手机号码已被注册</div>");
                            }else if(data.status == 10005){
                                $(".reg-phone").nextAll(".input-tips").remove();
                                $(".reg-phone").after("<div class='input-tips'><span class='icon-prompt'></span>服务器错误，请稍后重试</div>");
                            }else if(data.status == 10007) {
                                if(!$(".reg-code-machine").nextAll().hasClass("input-tips"))
                                    $(".reg-code-machine").parent().append("<div class='input-tips'><span class='icon-prompt'></span>图片验证码不正确!</div>");
                                else
                                    return;
                            } else {
                                fn.cookie("codeTime_phone_reg",60,60,{expireType:"s"});
                                showTime("codeTime_phone_reg",".btn-resend-code",".btn-send-code");
                            }
                        }
                    });
                }
            }else{
                /*if(!$(".reg-phone").nextAll(".input-tips")){
                    $(".reg-phone").after("<span class='input-tips'><span class='icon-prompt'></span>请输入正确的11位手机号码</span>");
                }*/
                if(!$(".reg-phone").nextAll().hasClass("input-tips") && !regex.phone.test(phone)){
                    $(".reg-phone").parent().append("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的11位手机号码</div>");
                }
                if(!$(".reg-code-machine").nextAll().hasClass("input-tips") && !machine.length>0){
                    $(".reg-code-machine").parent().append("<div class='input-tips'><span class='icon-prompt'></span>请输入图片验证码</div>");
                }
            }
        });
        $(".enter-body .btn-reg-phone").click(function(){
            var $this = $(this);
            var text = $(this).val();
            var phone = $(".reg-phone").val().trim();
            var password = $(".reg-pwd-phone").val().trim();
            var code = $(".reg-code-phone").val().trim();
            if(!regex.phone.test(phone)){
                $(".reg-phone").nextAll(".input-tips").remove();
                $(".reg-phone").after("<div class='input-tips'><span class='icon-prompt'></span>请输入正确的11位手机号码</div>");
            }else if(!regex.code.test($(".reg-code-phone").val().trim())){
                $(".code-area").find(".input-tips").remove();
                $(".code-area").append("<div class='input-tips fl'><span class='icon-prompt'></span>请输入4位数字验证码</div>");
            }else if(!regex.pwd.test(password)){
                $(".reg-pwd-phone").nextAll(".input-tips").remove();
                $(".reg-pwd-phone").after("<div class='input-tips'><span class='icon-prompt'></span>请输入6-22位的密码</div>");
            }else {
                if(can_request){
                    $this.val("注册中...");
                    can_request = false;
                    $.ajax({
                        type: "post",
                        url: "/api/register?by=phone",
                        dataType: "json",
                        data: {
                            option:{
                                phone: phone,
                                password: password,
                                code: code
                            }
                        },
                        success: function (data) {
                            $this.val(text);
                            can_request = true;
                            if (data.status == 10000) {
                                $.cookie("user_rem",phone,{expires:10000});
                                if($(".btn-type.on").data("type") == "1"){
                                    location.href= global.host.hr+"/company/validate?step=1";
                                }else if(forward){
                                    location.href = forward;
                                }else{
                                    location.href = global.host.www+'/resumeCreate';
                                }
                            }else if(data.status == 10011 || data.status == 10012){
                                $(".code-area").find(".input-tips").remove();
                                $(".code-area").append("<div class='input-tips fl'><span class='icon-prompt'></span>验证码过期或错误</div>");
                            }if(data.status == 10005){
                                $(".code-area").find(".input-tips").remove();
                                $(".code-area").append("<div class='input-tips fl'><span class='icon-prompt'></span>服务器错误，请稍后重试</div>");
                            }
                        }
                    });
                }

            }
        });

        //第三方登录跳转
        $(".third-type").click(function () {
            var type = $(this).attr("data-type");
            var authRedirUrl = encodeURIComponent(forward || global.host.www);
            window.open(authUtil.getAuthUrl(type,authRedirUrl));
        });

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

    //
    $(".btn-refresh").click(function () {
       var curtime = +new Date;
       $(".machine-code").attr("src","/vcode/create?time="+curtime);

    });

});