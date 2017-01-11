require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_fastclick','js/lib/IB_wxAuth', 'js/lib/IB_jweixin', 'js/lib/IB_lazyload'], function (fn, FastClick, wxAuth, wx) {

    $(function () {
        FastClick.attach(document.body);


        //微信分享
        wxAuth.jsApiAuth({
            url: window.location.href.split('#')[0]
        }, function (err) {
            console.log(err);
            wx.onMenuShareTimeline({
                title: "【暑期实习专题第一期】那些估值上亿的互联网创业公司", // 分享标题
                desc: "这周开始，将迎来了暑期实习风暴月的第一个主题周——互联网专题周。从今天开始，将会解锁很多互联网公司的暑期实习，还有很多好玩又务实的活动等着你，快告诉你的小伙伴吧。",
                imgUrl: "http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/658670ae231f6ea563d047879276baed.png", // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
            wx.onMenuShareAppMessage({
                title: "【暑期实习专题第一期】那些估值上亿的互联网创业公司", // 分享标题
                desc: "这周开始，将迎来了暑期实习风暴月的第一个主题周——互联网专题周。从今天开始，将会解锁很多互联网公司的暑期实习，还有很多好玩又务实的活动等着你，快告诉你的小伙伴吧。",
                imgUrl: "http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/658670ae231f6ea563d047879276baed.png", // 分享图标
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