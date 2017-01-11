/**
 * Created by zhphu on 16/5/19.
 */
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_zepto','js/lib/IB_fastclick', 'js/lib/IB_wxAuth', 'js/lib/IB_jweixin'], function (fn, $,FastClick, wxAuth, wx) {
    $(function () {
        FastClick.attach(document.body);
        var jid = $('.share-back').attr('data-jid');
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
        if (wxAuth.isWeixin) {
            $('.share-back').on("click", function (e) {
                e.preventDefault();
                $(this).addClass('none');
            });
            $("#share").on("click", function () {
                $('.share-back').removeClass('none');
            });
        }
    });
});