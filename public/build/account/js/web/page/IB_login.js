//用户登录
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/web/lib/IB_jquery':{
            exports:'$'
        },
        'js/web/plugin/IB_jquery.cookie': {
            deps:['js/web/lib/IB_jquery'],
            exports: 'cookie'
        },
        'js/web/lib/IB_wxLogin':{
            exports:'WxLogin'
        }
    }
});

require(['js/web/lib/IB_jquery','js/web/plugin/IB_jquery.cookie', 'js/web/lib/IB_fastclick', 'js/web/common/IB_fn','js/web/page/setting/IB_auth', 'js/web/common/IB_regex','js/web/lib/IB_wxLogin'], function ($, cookie, FastClick, fn,authUtil, regex,WxLogin) {

    $(function () {

        //二维码
        $(".qrcode-title").hover(
            function (e) {
                var x = $(this).position().left;  //当前元素x座标
                var t = $(this).position().top;   //当前元素y座标
                var w = $(this).width();        //当前元素宽度
                var h = $(this).height();       //当前元素高度
                $(".qrcode").show().css({"left":x+69+"px","top":t+h+30+"px"});
            },
            function () {
                $(".qrcode").hide();
            }
        );



        /*$(".nav-quickRecruit").hover(function() {
         if(e.type=="mouseover") {
             var x = $(this).position().left;  //当前元素x座标
             var t = $(this).position().top;   //当前元素y座标
             var w = $(this).width();        //当前元素宽度
             var h = $(this).height();       //当前元素高度
            $(".sub-nav-quickRecruit").show().css({"left":x+"px","top":t+h+"px","z-index":"1"});
         } else if(e.type=="mouseout") {
             $(".sub-nav-quickRecruit").hide();
         }
         });*/


        var can_request = true;
        if (!!$.cookie("user_rem")) {
            $(".enter-name").val($.cookie("user_rem"));
        }
        $(".enter-input").blur(function () {
            if ($(this).hasClass("enter-name")) {
                if (!(regex.phone.test($(this).val().trim()) || regex.email.test($(this).val().trim()))) {
                    $(this).after("<span class='input-tips'>请输入正确的账号</span>");
                }
            } else if ($(this).hasClass("enter-pwd")) {
                if (!regex.pwd.test($(this).val().trim())) {
                    $(this).after("<span class='input-tips'>请输入6-22位的密码</span>");
                }
            }
        });
        $(".enter-input").focus(function () {
            $(this).nextAll(".input-tips").remove();
        });
        var forward = decodeURIComponent(fn.getUrlPara("forward"));

        function login() {
            var uname = $(".enter-name").val().trim();
            var pwd = $(".enter-pwd-login").val().trim();

            if (!(regex.phone.test(uname) || regex.email.test(uname))) {
                $(".enter-name").nextAll(".input-tips").remove();
                $(".enter-name").after("<span class='input-tips'>请输入正确的注册号码</span>");
            } else if (!regex.pwd.test(pwd)) {
                $(".enter-pwd-login").nextAll(".input-tips").remove();
                $(".enter-pwd-login").after("<span class='input-tips'>请输入6-22位的密码</span>");
            } else {
                if (can_request) {
                    can_request = false;
                    $(".btn-login").val("登录中...");
                    $.ajax({
                        type: "post",
                        url: "/api/login",
                        dataType: "json",
                        data: {
                            option: {
                                user: uname,
                                password: pwd
                            }
                        },
                        success: function (data) {
                            can_request = true;
                            $(".btn-login").val("登录");
                            if (data.status == 10000) {
                                $.cookie("user_rem", uname, {expires: 10000});
                                if (forward) {
                                    location.href = forward;
                                } else {
                                    location.href = global.host.www;
                                }

                            } else if (data.status == 10007) {
                                $(".enter-name").nextAll(".input-tips").remove();
                                $(".enter-name").after("<span class='input-tips'>用户名或者密码错误</span>");
                            } else if (data.status == 10006) {
                                $(".enter-name").nextAll(".input-tips").remove();
                                $(".enter-name").after("<span class='input-tips'>用户名不存在</span>");
                            }
                            else if (data.status == 10005) {
                                $(".enter-name").nextAll(".input-tips").remove();
                                $(".enter-name").after("<span class='input-tips'>服务器错误，请稍后重试</span>");
                            }
                        }
                    });
                }

            }
        }

        $(".enter-pwd-login").bind('keypress', function (event) {
            if (event.keyCode == "13") {
                login();
            }
        });
        $(".btn-login").click(function () {
            login();
        });

        $(".overlay").click(function(){
            $(".overlay").hide();
            $("#wxLogContainer").hide();
        });

        $(".third-type").click(function () {
            var type = $(this).attr("data-type");
            var authRedirUrl = encodeURIComponent(forward || global.host.www);
            window.open(authUtil.getAuthUrl(type,authRedirUrl));
        });

    });
});