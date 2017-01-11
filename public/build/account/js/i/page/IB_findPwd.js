/**
 * Created by zhphu on 16/5/27.
 */
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/i/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/i/lib/IB_fn', 'js/i/lib/IB_zepto' ,'js/i/lib/IB_fastclick',"js/i/lib/IB_reg"], function (fn,$,FastClick,reg) {
    var account,can_request,code;
    var findUtil = {
        showPopTips : function(text){
            $(".popTips").show().text(text).addClass("fadeIn");
            setTimeout(function () {
                $(".popTips").removeClass("fadeIn").hide();
            }, 1000);
        },
        ajaxRequest : function(url,option,callback){
            if(can_request){
                can_request = false;
                $.ajax({
                    type:"post",
                    url:url,
                    dataType:"json",
                    data:{
                        option:option
                    },
                    success : function(data){
                        can_request = true;
                        callback(data);
                    },
                    error : function(){
                        findUtil.showPopTips("服务器错误,请稍后重试");
                    }
                });
            }
        },
        checkAccount : function(account,vcode){
            var flag = true;
            var phoneFlag = reg.phone_reg.test(account);
            var emailFlag = reg.email_reg.test(account);
            if(!account || !(phoneFlag || emailFlag)){
                flag = false;
                findUtil.showPopTips("请输入有效的注册账号");
            }else if(!reg.vcode_reg.test(vcode)){
                flag = false;
                findUtil.showPopTips("请输入正确的图片验证码");
            }
            return flag;
        },
        sendCode : function(account,vcode){
            $(".btn-resendCode").text("发送中...");
            findUtil.ajaxRequest("/api/sendFindPwdCode",{
                account_name:account,
                vcode : vcode
            },function(data){
                localStorage.setItem("codeTime_findPWD_m", 60);
                findUtil.showTime("codeTime_findPWD_m", ".btn-resendCode", ".btn-sendCode");
                if(data.status == 10000){
                    findUtil.showPopTips("验证码发送成功");
                    $(".account-rem").text(account);
                }else if(data.status==10002){
                    findUtil.showPopTips("请输入有效的注册账号");
                }else if(data.status==10006){
                    findUtil.showPopTips("该账号不存在");
                }else if(data.status == 10003 || data.status == 10005){
                    findUtil.showPopTips("服务器错误,请稍后重试");
                }else if(data.status == 10007){
                    findUtil.showPopTips("请输入正确图片验证码");
                }
            });
        },
        checkCode : function(code){
            if(!reg.code_reg.test(code)){
                findUtil.showPopTips("请输入4位有效验证码");
            }else{
                findUtil.ajaxRequest("/api/validateFindPwdCode",{
                    account_name : account,
                    code : code
                },function(data){
                    if(data.status == 10000){
                        localStorage.setItem("codeTime_findPWD_m", 0);
                        $(".step-1").hide();
                        $(".step-2").show();
                    }else if(data.status==10002){
                        findUtil.showPopTips("请输入有效的注册账号");
                    }else if(data.status==10011){
                        findUtil.showPopTips("验证码已过期,请重新发送");
                    }else if(data.status==10011){
                        findUtil.showPopTips("验证码错误");
                    }else if(data.status == 10003 || data.status == 10005){
                        findUtil.showPopTips("服务器错误,请稍后重试");
                    }
                });
            }
        },
        resetPwd : function(pwd,pwd_confirm){
            if(!reg.pwd_reg.test(pwd)){
                findUtil.showPopTips("请输入6到22位密码");
            }else if(pwd!=pwd_confirm){
                findUtil.showPopTips("两次密码输入不一致");
            }else{
                findUtil.ajaxRequest("/api/pwd/reset",{
                    account_name : account,
                    code : code,
                    password : pwd
                },function(data){
                    if(data.status == 10000){
                        findUtil.showPopTips("密码修改成功");
                        fn.storage("user_rem_i",account);
                        setTimeout(function(){
                            location.href = global.host.i+"/login?type=companyMobile"
                        },1500);
                    }else if(data.status==10002){
                        findUtil.showPopTips("请输入有效的注册账号");
                    }else if(data.status == 10006){
                        findUtil.showPopTips("该用户不存在");
                        $(".step-2").hide();
                        $(".step-1").show();
                    }else if(data.status==10011){
                        findUtil.showPopTips("验证码已过期,请重新发送");
                        $(".step-2").hide();
                        $(".step-1").show();
                    }else if(data.status==10011){
                        findUtil.showPopTips("验证码错误");
                    }else if(data.status == 10003 || data.status == 10005){
                        findUtil.showPopTips("服务器错误,请稍后重试");
                    }
                });
            }
        },
        showTime : function(name, resendArea, sendArea){
            if (localStorage.getItem(name) > 0) {
                var t = localStorage.getItem(name);
                $(resendArea).show();
                $(sendArea).hide();
                $(resendArea).text(t + "秒后重试");
                setTimeout(function () {
                    localStorage.setItem(name, t - 1);
                    findUtil.showTime(name, resendArea, sendArea);
                }, 1000);
            } else {
                $(resendArea).hide();
                $(sendArea).show();
                return false;
            }
        }
    };
    $(function () {
        FastClick.attach(document.body);
        can_request = true;
        if (localStorage.getItem("codeTime_findPWD_m") > 0) {
            findUtil.showTime("codeTime_findPWD_m", ".btn-resendCode", ".btn-sendCode");
        }
        $(".btn-sendCode").click(function(){
            account = $.trim($(".account").val());
            var vcode = $.trim($(".vcode").val());
            if(findUtil.checkAccount(account,vcode)){
                findUtil.sendCode(account,vcode);
            }
        });
        $(".btn-checkCode").click(function(){
            code = $.trim($(".code").val());
            findUtil.checkCode(code);
        });
        $(".btn-reset").click(function(){
            var pwd = $.trim($(".pwd").val());
            var pwd_confirm = $.trim($(".pwd-confirm").val());
            findUtil.resetPwd(pwd,pwd_confirm);
        });
        $(".btn-refresh").click(function () {
            var curtime = +new Date;
            $(".machine-code").attr("src","/vcode/create?time="+curtime);

        });
    });
});