require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_map','js/lib/IB_fastclick','js/common/IB_fn', 'js/lib/IB_jweixin', 'js/lib/IB_wxAuth'], function ($, mapUtil,FastClick,fn, wx, wxAuth) {
    $(function () {

        /**快招**/
        /*$(".nav-quickRecruit").hover(function(e) {
            if(e.type=="mouseover") {
                var x = $(this).position().left;  //当前元素x座标
                var t = $(this).position().top;   //当前元素y座标
                var w = $(this).width();        //当前元素宽度
                var h = $(this).height();       //当前元素高度
                $(".sub-nav-quickRecruit").show().css({"left":x+"px","top":t+h+"px","z-index":"1"});
            } else if(e.type=="mouseout") {
                if($(this).next().hasClass("sub-nav-quickRecruit"))
                    return;
                $(".sub-nav-quickRecruit").hide();
            }
        });*/

        var desc = $("#location").attr("data-desc");
        //加载地图
        var map = mapUtil.mapInit("location");
        mapUtil.locationAnalyze(map, desc);
        //微信分享
        var data_src = $('.avatar').attr('data-src');
        var imgUrl = data_src.indexOf('http') > -1 ? data_src : ('http://' + location.hostname + data_src);
        wxAuth.jsApiAuth({
            url: window.location.href.split('#')[0]
        }, function (err) {
            console.log(err);
            wx.onMenuShareTimeline({
                title: $('.share-back').attr('data-title'), // 分享标题
                desc: $('.share-back').attr('data-desc'),
                imgUrl: imgUrl, // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
            wx.onMenuShareAppMessage({
                title: $('.share-back').attr('data-title'), // 分享标题
                desc: $('.share-back').attr('data-desc'),
                imgUrl: imgUrl, // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
        });
    });
});