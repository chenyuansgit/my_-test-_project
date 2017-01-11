require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/i/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/i/lib/IB_zepto', 'js/i/lib/IB_fastclick', 'js/i/lib/IB_fn', "js/i/lib/IB_reg"], function ($, FastClick, fn, reg) {
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
        var user_rem = fn.storage("user_rem_i") || "";
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
                                fn.storage("user_rem_i",user);
                                if (forward) {
                                    window.location.href = forward;
                                } else {
                                    window.location.href = global.host.i;
                                }
                            } else if (data.status == 10005) {
                                $(".popTips").show().text("服务器错误，请稍后重试").addClass("fadeIn");
                                removePopTips();
                            } else if (data.status == 10006) {
                                $(".popTips").show().text("该用户名不存在").addClass("fadeIn");
                                removePopTips();
                            } else if (data.status == 10007) {
                                $(".popTips").show().text("密码错误").addClass("fadeIn");
                                removePopTips();
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
            var phone = $(".phone").val().trim();
            if (!reg.phone_reg.test(phone)) {
                $(".phone").next(".input-error").show();
            } else if ($(this).data("click")) {
                localStorage.setItem("codeTime_phone_reg", 60);
                showTime("codeTime_phone_reg", ".btn-resendCode", ".btn-sendCode");
                $(".btn").data("click", false);
                $.ajax({
                    type: "post",
                    url: "/api/sendCode",
                    dataType: "json",
                    data: {
                        option: {
                            phone: phone
                        }
                    },
                    success: function (data) {
                        $(".btn").data("click", true);
                        if (data.status == 10000) {
                            $(".popTips").show().text("验证码发送成功").addClass("fadeIn");
                            removePopTips();
                        } else if (data.status == 10001) {
                            $(".popTips").show().text("该手机号已被注册").addClass("fadeIn");
                            removePopTips();
                        } else if (data.status == 10003 || data.status == 10005) {
                            $(".popTips").show().text("服务器错误，请稍后重试").addClass("fadeIn");
                            removePopTips();
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
                $(".popTips").show().text("验证码错误").addClass("fadeIn");
                removePopTips();
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
                                window.location.href = global.host.i;
                            }
                        } else if (data.status == 10001) {
                            $(".popTips").show().text("该手机号已被注册").addClass("fadeIn");
                            removePopTips();
                        } else if (data.status == 10003 || data.status == 10005) {
                            $(".popTips").show().text("服务器错误，请稍后重试").addClass("fadeIn");
                            removePopTips();
                        } else if (data.status == 10011) {
                            $(".popTips").show().text("验证码已过期").addClass("fadeIn");
                            removePopTips();
                        } else if (data.status == 10012) {
                            $(".popTips").show().text("验证码错误").addClass("fadeIn");
                            removePopTips();
                        }
                    }
                });
            }
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

    function removePopTips() {
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
});