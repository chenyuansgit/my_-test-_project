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
    var account_host;
    try{
        account_host = global.account_host;
    }catch(e){}

    function showPopTips(text) {
        $(".popTips").show().text(text).addClass("fadeIn");
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
    function updateInfo(option,callback){
        $.ajax({
            type:'post',
            url:'/api/user/updateBase',
            data:{
                option:option
            },
            dataType:'json',
            success:function(data){
               if(data.status == 10000) return callback(null);
               callback(data.desc);
            },
            error:function(err){
                callback(err);
            }
        });
    }
    function quitLogin(callback){
        $.ajax({
            type:'get',
            url:account_host+'/api/quitLogin',
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

    $(function(){
        FastClick.attach(document.body);
        var can_request = true;
        $('#quit').on("click",function(e){
            e.preventDefault();
            quitLogin(function(err){
                if(!err) location.reload();
            });
        });

        fileUpload($('#sign').attr('data-uid'),'file-avatar',function(err,avatar){
            if(!err){
                if(!avatar){
                    showPopTips("头像上传失败");
                }else if(can_request = true){
                    can_request = false;
                    updateInfo({avatar:avatar},function(e){
                        can_request = true;
                        if(!e){
                            var img = document.createElement('img');
                            img.src = avatar;
                            img.onload = function(){
                                $(".avatar").removeClass('loading-img').css({"background-image": "url('" + avatar + "')"});
                            };
                        }
                    });
                }

            }
        },function(){
            $(".avatar").addClass('loading-img');
        });

        $(".icon-uname-edit").click(function(){
            $(".popBox-uname-change").show().addClass("fadeIn");
            $(".overlay").show();
            var nick_name = $.trim($(".nick-name").text());
            $(".uname-set").val(nick_name);
        });
        $(".popBox .btn-cancel,.overlay").click(function(){
            $(".popBox").removeClass("fadeIn").hide();
            $(".overlay").hide();
        });

        $(".popBox-uname-change .btn-confirm").click(function(){
            var nick_name = $.trim($(".uname-set").val());
            if(!nick_name){
                showPopTips("昵称不能为空");
            }else if(can_request){
                can_request = false;
                updateInfo({nick_name:nick_name},function(e){
                    can_request = true;
                    if(!e){
                        $(".nick-name").text(nick_name);
                        showPopTips("昵称修改成功");
                        $(".popBox").removeClass("fadeIn").hide();
                        $(".overlay").hide();
                    }else{
                        showPopTips("修改失败,请稍后重试");
                    }
                });
            }
        });
    });
});
