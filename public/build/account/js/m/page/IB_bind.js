/**
 * Created by zhphu on 16/8/12.
 */
require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/m/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/m/lib/IB_zepto', 'js/m/lib/IB_fastclick', 'js/m/lib/IB_fn', "js/m/lib/IB_reg"], function ($, FastClick, fn, reg) {
    var bindUtil = {
      bind:function (type,option,callback) {
          var url = "/oauth/"+type+"/bind";
          $.ajax({
             type:"post",
             url:url,
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
    $(function () {
        FastClick.attach(document.body);
        var can_request = true;
        var platform = decodeURIComponent(fn.getQueryString("account_type")) || "";
        if(!platform){
            showPopTips("链接失效啦!");
        }
        var avatar = decodeURIComponent(fn.getQueryString("avatar"));
        var nickname = decodeURIComponent(fn.getQueryString("nickname"));
        var forward = decodeURIComponent(fn.getQueryString("forward")) || global.host.m;
        var token = fn.getQueryString("token") || "";
        var type = fn.getQueryString("type") || "";
        if(avatar && avatar!="undefined"){
            $(".avatar").css({"background-image":"url('"+avatar+"')"});
        }
        if(nickname){
            $(".nick-name").text(nickname);
        }
        $(".btn-select-bind").click(function () {
            $(".page-1").hide();
            $(".page-2").show();
        });
        $(".step-leap-back").click(function () {
            $(".page-2").hide();
            $(".page-1").show();
        });

        $(".btn-bind").click(function(){
            var account_name = $.trim($(".account-name").val());
            var password = $.trim($(".account-pwd").val());
            if(!account_name || !password){
                showPopTips("请输入有效的账户名和密码");
            }else if(!reg.phone_reg.test(account_name) && !reg.email_reg.test(account_name)){
                showPopTips("账户名格式错误");
            }else if(!reg.pwd_reg.test(password)){
                showPopTips("密码错误");
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
                        showPopTips("账号已绑定");
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
        $(".popTips").show().text(text).addClass("fadeIn");
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
});