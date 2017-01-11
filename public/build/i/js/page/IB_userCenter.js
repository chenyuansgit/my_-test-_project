/**
 * Created by zhphu on 16/5/12.
 */
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            exports: '$'
        },
        'js/lib/IB_iscroll': {
            exports: 'IScroll'
        },
        'js/lib/IB_plupload.full': {
            exports: 'plupload'
        }
    }
});
require(['js/lib/IB_zepto','js/lib/IB_fastclick','js/lib/IB_fn', 'js/lib/IB_fileUpload'], function ($, FastClick,fn,fileUpload) {
    function quitLogin(callback){
        $.ajax({
            type:'get',
            url: global.account_host+'/api/quitLogin',
            dataType:'jsonp',
            jsonpCallback:"call",
            success:function(data){
                if(data.status == 10000) return callback(null);
                callback(data.desc);
            },
            error:function(err){
                callback(err);
            }
        });
    }
    function updateAvatar(avatar,callback){
        if(!avatar){
            return callback('no avatar');
        }
        $.ajax({
            type:'post',
            url:'/api/employer/updateBase',
            data:{
                option:{
                    avatar:avatar
                }
            },
            dataType:'json',
            success:function(data){
                if(data.status == 10000) {
                    return callback(null);
                }else if(data.status == 10010){
                    $(".avatar").removeClass('loading-img');
                    $(".popTips").show().text("请到实习鸟官网验证企业信息").addClass("fadeIn");
                    removePopTips();
                }
                callback(data.desc);
            },
            error:function(err){
                callback(err);
            }
        });
    }
    function removePopTips() {
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
    $(function () {
        FastClick.attach(document.body);
        fileUpload($('#sign').attr('data-uid'),'file-avatar',function(err,avatar){
            if(!err){
                updateAvatar(avatar,function(e){
                    if(!e){
                        var img = document.createElement('img');
                        img.src = avatar;
                        img.onload = function(){
                            $(".avatar").removeClass('loading-img').css({"background-image": "url('" + avatar + "')"});
                        };
                    }
                });
            }
        },function(){
            $(".avatar").addClass('loading-img');
        });
        $('#quit').on("click",function(e){
            e.preventDefault();
            quitLogin(function(err){
                if(!err) location.reload();
            });
        });
    });
});