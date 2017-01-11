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

require(['js/web/lib/IB_jquery', 'js/web/plugin/IB_jquery.cookie','js/web/lib/IB_fastclick','js/web/common/IB_fn','js/web/common/IB_regex','js/web/common/IB_input_limit'], function ($, cookie, FastClick, fn, regex) {
    $(function(){
        //type 1:邮箱及手机号 2:修改密码
        var can_request = true;
        if(global.type == 1){
            //邮箱及手机号绑定
            var phone = global.phone;
            var email= global.email;
            if(name){
                $(".setting-name").val(name);
            }

            var email_validated = global.email_validated;
            if(email_validated !="false" && email_validated){
                $(".setting-email").val(email).attr({"disabled":true});
                $(".remind-err-email").hide();
                $(".remind-succ-email").show();
                $(".btn-change-email").val("更换邮箱号码");
                $.cookie("codeTime_email",0);
            }else if(email){
                $(".setting-email").val(email).attr({"disabled":false});
                $(".remind-err-email").show();
                $(".remind-succ-email").hide();
                $(".btn-change-email").val("验证邮箱号码");
            }
            if(phone){
                $(".setting-phone").val(phone).attr({"disabled":"disabled"});
                $(".remind-err-phone").hide();
                $(".remind-succ-phone").show();
                $(".btn-change-phone").val("更换手机号码");
                $.cookie("codeTime_phone",0);
            }
            if($.cookie("codeTime_email")>0){
                showTime("codeTime_email",".remind-resend-email",".btn-change-email");
            }
            if($.cookie("codeTime_phone")>0){
                showTime("codeTime_phone",".remind-resend-code",".btn-change-phone");
            }

            //修改用户名
            $(".btn-change-uname").click(function(){
                var user_name = $.trim($(".setting-name").val());
                if(regex.username.test(user_name)){
                    $.ajax({
                        type:"POST",
                        url:"/api/user/base",
                        dataType:"json",
                        data:{
                            option:{
                                user_name:user_name
                            }
                        },
                        success: function (data) {
                            if(data.status == 10000){
                                $.cookie("u_name",user_name);
                                $(".unick").text(user_name);
                            }
                        }
                    });
                }
            });

            //绑定邮箱
            $(".setting-email").change(function(){
                if($(".setting-email").val() == email && email){
                    $(".remind-err-email").hide();
                    $(".remind-succ-email").show();
                }else{
                    $(".remind-err-email").show();
                    $(".remind-succ-email").hide();
                }
            });
            $(".btn-change-email").click(function(){
                if($(this).val() == "更换邮箱号码"){
                    $(".setting-email").attr({"disabled":false}).focus();
                    $(this).val("验证邮箱号码");
                }else{
                    var newEmail = $.trim($(".setting-email").val());
                    if((regex.email.test(newEmail)&& email_validated == "false")||(email_validated == "true" && regex.email.test(newEmail) && newEmail != email)){
                        $.cookie("codeTime_email",60,60);
                        showTime("codeTime_email",".remind-resend-email",".btn-change-email");
                        if( can_request){
                            can_request = false;
                            $.ajax({
                                type:"POST",
                                url:"/api/sendEmail",
                                dataType:"json",
                                data:{
                                    option:{
                                        address:newEmail
                                    }
                                },
                                success:function(data){
                                    can_request = true;
                                    if(data.status == 10000){
                                        $(".remind-succ-email-2").show();
                                        $(".mail-box").hide();
                                        location.reload();
                                    }else if(data.status = 10001){
                                        $.cookie("codeTime_email",0);
                                        alert("该邮箱已经被绑定");
                                    }
                                }
                            });
                        }

                    }else if(email == newEmail && email){
                        $(".remind-err-email-3").show();
                        setTimeout(function(){
                            $(".remind-err-email-3").hide();
                            $(".remind-err-email").hide();
                            $(".remind-succ-email").show();
                        },1500);
                    }else{
                        $(".remind-err-email-2").show();
                        setTimeout(function(){
                            $(".remind-err-email-2").hide();
                            if(email){
                                $(".setting-email").val(email).attr({"disabled":"disabled"});
                                $(".btn-change-email").val("更换邮箱号码");
                            }
                        },1500);
                    }
                }
            });

            //绑定手机号
            var newPhone = "";
            $(".setting-phone").change(function(){
                if($(".setting-phone").val() == phone && phone){
                    $(".remind-err-phone").hide();
                    $(".remind-succ-phone").show();
                }else{
                    $(".remind-err-phone").show();
                    $(".remind-succ-phone").hide();
                }
            });
            $(".btn-change-phone").click(function(){
                if($(this).val() == "更换手机号码"){
                    $(".setting-phone").attr({"disabled":false}).focus();
                    $(this).val("验证手机号码");
                }else{
                    newPhone = $.trim($(".setting-phone").val());
                    var machine = $(".reg-code-machine").val().trim();
                    if(regex.phone.test(newPhone)&& newPhone!=phone && machine.length>0){
                        if( can_request){
                            can_request = false;
                            $.ajax({
                                type:"POST",
                                url:"/api/sendCode",
                                dataType:"json",
                                data:{
                                    option:{
                                        phone:newPhone,
                                        vcode:machine
                                    }
                                },
                                success:function(data){
                                    can_request = true;
                                    if(data.status == 10000){
                                        $(".code-area").show();
                                        fn.cookie("codeTime_phone",60,60,{expireType:"s"});
                                        showTime("codeTime_phone",".remind-resend-code",".btn-change-phone");
                                    }else if(data.status == 10001){
                                        $.cookie("codeTime_phone",0);
                                        $(".remind-err-phone-4").show();
                                        setTimeout(function(){
                                            $(".remind-err-phone-4").hide();
                                        },1500);
                                    }else if(data.status == 10007) {
                                        if(!$(".reg-code-machine").nextAll().hasClass("input-tips")) {
                                            $(".reg-code-machine").parent().append("<div class='input-tips'><span class='icon-prompt'></span>图片验证码不正确!</div>");
                                            setTimeout(function(){
                                                $(".reg-code-machine").parent().find(".input-tips").remove();
                                            },1500);
                                        }
                                    }
                                }
                            });
                        }
                    } if(phone == newPhone && phone){
                        $(".remind-err-phone-3").show();
                        setTimeout(function(){
                            $(".remind-err-phone-3").hide();
                            $(".remind-err-phone").hide();
                            $(".remind-succ-phone").show();
                            $(".btn-change-phone").val("更换手机号码");
                            $(".setting-phone").attr({"disabled":"disabled"});
                        },1500);
                    }else if(!regex.phone.test(newPhone)) {
                        $(".remind-err-phone-2").show();
                        setTimeout(function(){
                            $(".remind-err-phone-2").hide();
                            if(phone){
                                $(".setting-phone").val(phone).attr({"disabled":"disabled"});
                                $(".btn-change-phone").val("更换手机号码");
                            }
                        },1500);
                    }
                    if(!machine.length>0) {
                        if(!$(".reg-code-machine").nextAll().hasClass("input-tips")) {
                            $(".reg-code-machine").parent().append("<div class='input-tips'><span class='icon-prompt'></span>请输入图片验证码</div>");
                            setTimeout(function(){
                                $(".reg-code-machine").parent().find(".input-tips").remove();
                            },1500);
                        }
                    }
                }
            });
            $(".phone-code").focus(function () {
                $(".code-area").find(".input-tips").remove();
            });
            $(".send-code").click(function(){
                var $this = $(this);
                var text = $this.val();
                var code = $.trim($(".phone-code").val());
                if(regex.code.test(code)){
                    if(can_request){
                        can_request = false;
                        $this.val("处理中..");
                        $.ajax({
                            type:"POST",
                            url:"/api/code/validate",
                            dataType:"json",
                            data:{
                                option:{
                                    code:code,
                                    phone:newPhone
                                }
                            },
                            success:function(data){
                                can_request = true;
                                $this.val(text);
                                if(data.status == 10000){
                                    $(".remind-err-phone").hide();
                                    $(".remind-succ-phone").show();
                                    $(".code-area").hide();
                                    $.cookie("codeTime_phone",0);
                                    $(".setting-phone").val(newPhone).attr({"disabled":"disabled"});
                                    $(".btn-change-phone").val("更换手机号码");
                                    $(".replace-phone").text("更换手机号码");
                                    $(".phone-box").hide();
                                    location.reload();
                                }else if(data.status == 10011){
                                    $(".code-area").find(".input-tips").remove();
                                    $(".code-area").append("<div class='input-tips'><span class='icon-prompt'></span>验证码错误或过期</div>");
                                }else if(data.status == 10012){
                                    $(".code-area").find(".input-tips").remove();
                                    $(".code-area").append("<div class='input-tips'><span class='icon-prompt'></span>验证码错误</div>");
                                }
                            }
                        });
                    }
                }else{
                    $(".code-area").find(".input-tips").remove();
                    $(".code-area").append("<div class='input-tips'><span class='icon-prompt'></span>验证码格式错误</div>");
                }
            });
        }else if(global.type == 2){
            //密码修改
            $(".setting-sub").click(function(){
                var $this = $(this);
                var text = $this.val();
                var pwd_old = $.trim($(".pwd-old").val());
                var pwd = $.trim($(".pwd").val());
                if(check(pwd_old,pwd)){
                    if( can_request){
                        can_request = false;
                        $this.val("处理中...");
                        $.ajax({
                            type:"post",
                            url:"/api/user/pass",
                            dataType:"json",
                            data:{
                                option:{
                                    old_pass:pwd_old,
                                    new_pass:pwd
                                }
                            },
                            success:function(data){
                                can_request = true;
                                $this.val(text);
                                if(data.status == 10000){
                                    $(".pwd").nextAll(".input-tips").remove();
                                    $(".pwd").after("<div class='remind-succ' style='display:block;'><span class='icon-speed'></span>密码修改成功,请重新登录</div>");
                                    setTimeout(function(){
                                        $.ajax({
                                            type:"get",
                                            url:"/api/quitLogin",
                                            dataType:"json",
                                            success:function(data){
                                                if(data.status == 10000){
                                                    window.location.href ="/login?forward="+encodeURIComponent(window.location.href);
                                                }
                                            }
                                        });
                                    },1000);
                                }else if(data.status == 10003){
                                    $(".pwd-old").nextAll(".input-tips").remove();
                                    $(".pwd-old").after("<div class='input-tips'><span class='icon-prompt'></span>原密码错误</div>");
                                }else if(data.status == 10004){
                                    $(".pwd-old").nextAll(".input-tips").remove();
                                    $(".pwd-old").after("<div class='input-tips'><span class='icon-prompt'></span>原密码错误</div>");
                                }
                            }
                        });
                    }

                }
            });
            function check(pwd_old,pwd){
                if(pwd_old == pwd){
                    $(".pwd").nextAll(".input-tips").remove();
                    $(".pwd").after("<div class='input-tips'><span class='icon-prompt'></span>与原密码一致,无需修改</div>");
                    return false;
                }
                $(".setting-input").each(function(){
                    if($(this).val() == ""){
                        $(this).nextAll(".input-tips").remove();
                        $(this).after("<div class='input-tips'><span class='icon-prompt'></span>密码不能为空</div>");
                        return false;
                    }else if(!regex.pwd.test($(this).val())){
                        $(this).nextAll(".input-tips").remove();
                        $(this).after("<div class='input-tips'><span class='icon-prompt'></span>密码格式错误(6-22位)</div>");
                        return false;
                    }

                });

                $(".setting-input").blur(function(){
                    var pwd = $(this).val();
                    if(pwd == ""){
                        $(this).nextAll(".input-tips").remove();
                        $(this).after("<div class='input-tips'><span class='icon-prompt'></span>密码不能为空</div>");
                    }else if(!regex.pwd.test(pwd)){
                        $(this).nextAll(".input-tips").remove();
                        $(this).after("<div class='input-tips'><span class='icon-prompt'></span>密码格式错误</div>");
                    }
                });
                $(".setting-input").focus(function(){
                    $(this).nextAll(".input-tips").remove();
                });
                return true;
            }
        }
    });

    //刷新验证码
    $(".btn-refresh").click(function () {
        var curtime = +new Date;
        $(".machine-code").attr("src","/vcode/create?time="+curtime);

    });

    $(".replace-email").click(function () {
        var $this = $(this);
        if(!$this.hasClass("cur")) {
            $this.addClass("cur");
            $(".mail-box").show();
        } else {
            $this.removeClass("cur");
            $(".mail-box").hide();
        }
    });

    $(".replace-phone").click(function () {
        var $this = $(this);
        if(!$this.hasClass("cur")) {
            $this.addClass("cur");
            $(".phone-box").show();
        } else {
            $this.removeClass("cur");
            $(".phone-box").hide();
        }
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
