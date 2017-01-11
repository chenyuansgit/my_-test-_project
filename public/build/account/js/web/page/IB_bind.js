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

require(['js/web/lib/IB_jquery','js/web/plugin/IB_jquery.cookie', 'js/web/lib/IB_fastclick', 'js/web/common/IB_fn', 'js/web/common/IB_regex'], function ($, cookie, FastClick, fn, regex) {
    var bindUtil = {
        bind:function (type,option,callback) {
            $.ajax({
                type:"post",
                url:"/oauth/"+type+"/bind",
                dataType:"json",
                data:{
                    option:option
                },
                success:function(data){
                    callback(data);
                },
                error: function(err){

                }
            });
        }
    };
    $(function(){
        $(".enter-input").blur(function () {
            if ($(this).hasClass("enter-name")) {
                if (!(regex.phone.test($(this).val().trim()) || regex.email.test($(this).val().trim()))) {
                    $(this).after("<span class='input-tips'><span class='icon-prompt'></span>请输入正确的手机号或邮箱</span>");
                }
            } else if ($(this).hasClass("enter-pwd")) {
                if (!regex.pwd.test($(this).val().trim())) {
                    $(this).after("<span class='input-tips'><span class='icon-prompt'></span>请输入6-22位的密码</span>");
                }
            }
        });
        $(".enter-input").focus(function () {
            $(this).nextAll(".input-tips").remove();
        });

        //绑定账号
        var can_request = true;
        var platform = decodeURIComponent(fn.getUrlPara("account_type")) || "";
        if(!platform){
            showPopTips("链接失效啦!");
        }
        var avatar = decodeURIComponent(fn.getUrlPara("avatar"));
        var nickname = decodeURIComponent(fn.getUrlPara("nickname"));
        var forward = decodeURIComponent(fn.getUrlPara("forward")) || global.host.www;
        var token = fn.getUrlPara("token") || "";
        var type = fn.getUrlPara("type") || "";
        if(avatar && avatar!="undefined"){
            $(".avatar").css({"background-image":"url('"+avatar+"')"});
        }
        if(nickname){
            $(".nick-name").text(nickname);
        }
        $(".btn-select-bind").click(function () {
            $(".step-1").hide();
            $(".step-2").show();
        });
        $(".step-leap-back").click(function () {
            $(".step-2").hide();
            $(".step-1").show();
        });

        $(".btn-bind").click(function(){
            var account_name = $.trim($(".enter-name").val());
            var password = $.trim($(".enter-pwd").val());
            if(!account_name || !password){
                showPopTips("请输入有效的账户名和密码");
            }else if(!(regex.phone.test(account_name) || regex.email.test(account_name))){
                showPopTips("手机号或邮箱格式错误");
            }else if(!regex.pwd.test(password)){
                showPopTips("密码格式不正确");
            }else if(can_request){
                can_request = false;
                bindUtil.bind(platform,{
                    bind: 1,
                    account_name:account_name,
                    password:password,
                    token:token,
                    type:type
                },function (data) {
                    can_request = true;
                    if(data.status == 10000){
                        showPopTips("绑定成功");
                        setTimeout(function () {
                            window.location.href = forward;
                        },1000)
                    }else if(data.status == 10006){
                        showPopTips("用户名不存在");
                    }else if(data.status == 10007){
                        showPopTips("密码错误");
                    }else if(data.status == 10008){
                        showPopTips("微信已绑定");
                        setTimeout(function () {
                            window.location.href = forward;
                        },1000)
                    }else if(data.status == 10011){
                        showPopTips("链接过期,请重新授权");
                    }else if(data.status == 10005){
                        showPopTips("服务器错误,请稍后重试");
                    }
                })
            }
        });

        $(".btn-ignore").click(function () {
            if(can_request){
                can_request = false;
                bindUtil.bind(platform,{
                    bind: 0,
                    token:token,
                    type:type
                },function (data) {
                    can_request = true;
                    if(data.status == 10000){
                        window.location.href = forward;
                    }else if(data.status == 10011){
                        showPopTips("链接过期,请重新授权");
                    }else if(data.status == 10005){
                        showPopTips("服务器错误,请稍后重试");
                    }
                })
            }
        });


    });
    function showPopTips(text) {
        $(".popTips").show().html("<span class='input-tips'><span class='icon-prompt'></span>"+text+"</span>");
        setTimeout(function () {
            $(".popTips").hide();
        }, 1000);
    }
});