require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/m/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/m/lib/IB_zepto', 'js/m/lib/IB_fastclick', 'js/m/lib/IB_fn', "js/m/lib/IB_reg","js/m/page/setting/IB_auth"], function ($, FastClick, fn, reg,authUtil) {
    $(function () {
        FastClick.attach(document.body);
        var can_request = true;
        $(".btn").data("click", true);
        $(".input-sign").on("focus", function () {
            $(this).next(".input-error").hide();
        });
        $(".sign-line").on("click", function (e) {
            e.preventDefault();
            $(this).find("input-sign").focus();
        });
        var forward = decodeURIComponent(fn.getQueryString("forward"));
        var user_rem = fn.storage("user_rem_m") || "";
        if(user_rem){
            $(".user").val(user_rem);
        }
        /*登录*/
        $(".btn-login").on("click", function (e) {
            e.preventDefault();
            var user = $(".user").val().trim();
            var pwd = $(".password").val().trim();
            if (!(reg.phone_reg.test(user) || reg.email_reg.test(user))) {
                $(".user").next(".input-error").show();
            } else if (!reg.pwd_reg.test(pwd)) {
                $(".password").next(".input-error").show();
            } else {
                if (can_request) {
                    can_request = false;
                    $.ajax({
                        type: "post",
                        url: "/api/login",
                        dataType: "json",
                        data: {
                            option: {
                                user: user,
                                password: pwd
                            }
                        },
                        success: function (data) {
                            can_request = true;
                            if (data.status == 10000) {
                                fn.storage("user_rem_m",user);
                                if (forward) {
                                    window.location.href = forward;
                                } else {
                                    window.location.href = global.host.m;
                                }
                            } else if (data.status == 10005) {
                                showPopTips("服务器错误，请稍后重试");
                            } else if (data.status == 10006) {
                                showPopTips("该用户名不存在");
                            } else if (data.status == 10007) {
                                showPopTips("密码错误");
                            }
                        }
                    });
                }
            }
        });
        /*注册*/
        if (localStorage.getItem("codeTime_phone_reg") > 0) {
            showTime("codeTime_phone_reg", ".btn-resendCode", ".btn-sendCode");
        }
        $(".btn-sendCode").on("click", function (e) {
            e.preventDefault();
            var phone = $.trim($(".phone").val());
            var vcode = $.trim($(".reg-code-machine").val());
            if (!reg.phone_reg.test(phone)) {
                $(".phone").next(".input-error").show();
            }else if(!vcode || !reg.vcode_reg.test(vcode)){
                showPopTips("请输入正确图形验证码");
            } else if (can_request) {
                can_request = false;
                $.ajax({
                    type: "post",
                    url: "/api/sendCode",
                    dataType: "json",
                    data: {
                        option: {
                            phone: phone,
                            vcode : vcode
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        localStorage.setItem("codeTime_phone_reg", 60);
                        showTime("codeTime_phone_reg", ".btn-resendCode", ".btn-sendCode");
                        if (data.status == 10000) {
                            showPopTips("验证码发送成功");
                        } else if (data.status == 10001) {
                            showPopTips("该手机号已被注册");
                        } else if (data.status == 10003 || data.status == 10005) {
                            showPopTips("服务器错误，请稍后重试");
                        } else if(data.status == 10007){
                            showPopTips("请输入正确图形验证码");
                        }
                    }
                });
            }
        });
        $(".btn-register").on("click", function (e) {
            e.preventDefault();
            var phone = $(".phone").val().trim();
            var code = $(".code").val().trim();
            var pwd = $(".password").val().trim();
            if (!reg.phone_reg.test(phone)) {
                $(".phone").next(".input-error").show();
            } else if (!reg.code_reg.test(code)) {
                showPopTips("验证码错误");
            } else if (!reg.pwd_reg.test(pwd)) {
                $(".password").next(".input-error").show();
            } else if ($(this).data("click")) {
                $.ajax({
                    type: "post",
                    url: "/api/register",
                    dataType: "json",
                    data: {
                        option: {
                            phone: phone,
                            code: code,
                            password: pwd
                        }
                    },
                    success: function (data) {
                        $(".btn").data("click", true);
                        console.log(JSON.stringify(data));
                        if (data.status == 10000) {
                            if (forward) {
                                window.location.href = forward;
                            } else {
                                window.location.href = global.host.m+"/private/resumeCreate";
                            }
                        } else if (data.status == 10001) {
                            showPopTips("该手机号已被注册");
                        } else if (data.status == 10003 || data.status == 10005) {
                            showPopTips("服务器错误，请稍后重试");
                        } else if (data.status == 10011) {
                            showPopTips("验证码已过期");
                        } else if (data.status == 10012) {
                            showPopTips("验证码错误");
                        }
                    }
                });
            }
        });
        $(".btn-refresh").click(function () {
            var curtime = +new Date;
            $(".machine-code").attr("src","/vcode/create?time="+curtime);

        });
        $(".third-login-btn").click(function(){
            var type = $(this).attr("data-type");
            var authRedirUrl = encodeURIComponent(forward || global.host.m+"/userCenter");
            window.open(authUtil.getAuthUrl(type,authRedirUrl));
        });
        
    });
    //验证码倒计时
    function showTime(name, resendArea, sendArea) {
        if (localStorage.getItem(name) > 0) {
            var t = localStorage.getItem(name);
            $(resendArea).show();
            $(sendArea).hide();
            $(resendArea).text(t + "秒后重试");
            setTimeout(function () {
                localStorage.setItem(name, t - 1);
                showTime(name, resendArea, sendArea);
            }, 1000);
        } else {
            $(resendArea).hide();
            $(sendArea).show();
            return false;
        }
    }

    function showPopTips(text) {
        $(".popTips").show().text(text).addClass("fadeIn");
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
});