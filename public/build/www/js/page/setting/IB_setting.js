require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        },
        'js/lib/IB_plupload.full':{
            exports:'plupload'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fileUpLoad', 'js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_regex'], function ($,fileUpload, FastClick, fn, regex) {
    $(function(){
        var can_request = true;
        var uid = global.uid;

        $(".new-nickname").focus(function () {
            $(this).parent().nextAll(".input-tips").remove();
        });

        $(".new-nickname").blur(function () {
            $(this).nextAll(".input-tips").remove();
            var newNickname= $.trim($(".new-nickname").val());
            if (!newNickname) {
                $(this).parent().nextAll(".input-tips").remove();
                $(this).parent().append("<div class='input-tips'><span class='icon-prompt'></span>昵称不能为空</div>");
            }
        });

        //头像上传
        fileUpload(uid, "avatar-file", function (error, cover_img) {
            if (!error) {
                $(".avatar .loading").remove();
                $(".avatar").css({"background-image": "url('" + cover_img + "?imageView2/2/w/240/h/240')"}).attr("data-avatar",cover_img);
            }
        }, function () {
            $(".avatar").append("<div class='loading'></div>");
        });

        //修改个人信息
        $(".btn-edit").click(function(){
            var avatar = $(".avatar").attr("data-avatar");
            var $this = $(this);
            var text = $this.val();
            var nick_name = $.trim($(".new-nickname").val());
            if(can_request){
                can_request = false;
                $this.val("处理中...");
                $.ajax({
                    type:"POST",
                    url:"/api/user/updateBase",
                    dataType:"json",
                    data:{
                        option:{
                            avatar:avatar,
                            nick_name:nick_name
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        $this.val(text);
                        if(data.status == 10000){
                            if(!$this.parent().find(".input-tips").length >0) {
                                $this.parent().append("<div class='input-tips success-edit'><span class='icon-speed'></span>修改成功！</div>");
                                setTimeout(function () {
                                    $this.parent().find(".input-tips").remove();
                                }, 3000);
                            }
                        } else {
                            location.reload();
                        }
                    }
                });
            }
        });
    });
});
