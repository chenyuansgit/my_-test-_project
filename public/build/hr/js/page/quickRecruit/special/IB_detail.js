require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn','js/lib/IB_jweixin','js/lib/IB_wxAuth','js/page/quickRecruit/IB_common'], function ($, FastClick, fn, wx, wxAuth, quickRecruit ) {
    $(function () {
        fn.popBoxBind();
        fn.backTopBind();

        /*$(document).scroll(function () {
            if ($(document).scrollTop() > 0) {
                $(".quick-recruit-bar").css({"margin-top": "-100px"});
            } else {
                $(".quick-recruit-bar").css({"margin-top": "0px"});
            }
        });*/

        //申请
        $(".join").click(function () {
            $(".overlay").show();
            $(".popBox-join").show();
            var term_id = global.term_id;
            $(".popBox-join .btn-apply").attr("data-term-id", term_id);
        });
        $(".popBox .btn-ok").click(function () {
            $(".overlay").hide();
            $(".popBox").hide();
        });
        quickRecruit.applyBind();

        //快招邀请
        quickRecruit.inviteInit("special");
        $(".quick-recruit-bar .btn-invite").click(function () {
            $(".overlay").show();
            $(".popBox-quickRecruit").show();
            var content_id = $(this).attr("data-content-id");
            $(".popBox-quickRecruit .btn-invite").attr("data-content-id", content_id);
        });
        //微信分享
        var data_src = $('.share-back').attr('data-img');
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
