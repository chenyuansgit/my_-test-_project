//我的订阅
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fn'], function ($,fn) {
    $(function(){
        //分页绑定
        fn.pagingBind();

    });

    //鼠标切换
    $(".switch-favorite").hover(function(){
        $(".icon-drop-down").remove();
        if(!$(".icon-drop-up").length>0)
            $(this).append("<span class='icon-drop-up'></span>");
        $(".switch-favorite-text").css("display","block");
    },function () {
        $(".icon-drop-up").remove();
        $(this).append("<span class='icon-drop-down'></span>");
        $(".switch-favorite-text").css("display","none");
    });

    //取消收藏
    $(".cancel-btn").click(function () {
        var $this = $(this);
        var favorite_id = $this.attr("data-id");
        var favorite_type = $this.attr("data-type");
        $.ajax({
            type: "post",
            url: "/api/favorite/cancel",
            dataType: "json",
            data: {
                option: {
                    type: favorite_type,
                    id: favorite_id
                }
            },
            success: function (data) {
                if(data.status == 10000) {
                    location.reload();
                }
            }
        });
    });

});