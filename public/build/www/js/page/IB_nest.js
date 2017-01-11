//用户登录
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
       /* $(".nav").click(function(){
            $(".nav.curr").removeClass("curr");
            $(".icon-sel-up").remove();
            $(this).addClass("curr").append("<span class='icon-sel-up'></span>");
            /!*var id = $(this).attr("data-id");
            $(".article-list").hide();
            $(".article-list-"+id).show();*!/
        });*/
    });




});