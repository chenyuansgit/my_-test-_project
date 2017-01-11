require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn', 'js/lib/IB_jweixin','js/lib/IB_wxAuth','js/page/quickRecruit/IB_common','js/plugin/IB_lightbox'], function ($, FastClick, fn, wx, wxAuth, quickRecruit) {
    $(function () {
        var can_request = true;
        var uid = global.uid;
        var forward = encodeURIComponent(window.location.href);
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        fn.popBoxBind();
        fn.backTopBind();

        /*$(document).scroll(function () {
            if ($(document).scrollTop() > 60) {
                $(".sidebar").css({"margin-top": "-100px"});
            } else {
                $(".sidebar").css({"margin-top": "0px"});
            }
        });*/

        //邀请
        quickRecruit.inviteInit("common");
        $(".sidebar .btn-invite").click(function () {
            var rid = $(this).attr("data-rid");
            var version = $(this).attr("data-version");
            $(".popBox-quickRecruit .btn-invite").attr({"data-rid": rid, "data-version": version});
            $(".overlay").show();
            $(".popBox-quickRecruit").show();
        });
        $(".popBox .btn-ok").click(function () {
            $(".overlay").hide();
            $(".popBox").hide();
        });

        //点赞
        $(".btn-like.on").click(function () {
            if (can_request) {
                var liked = parseInt($(".num-liked").text());
                can_request = false;
                $.ajax({
                    url: "/api/talentPool/support",
                    type: "post",
                    dataType: "json",
                    data: {
                        option: {
                            support_id: uid
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        if (data.status == 10000) {
                            $(".btn-like").removeClass("on").addClass("off").find("em").text("已支持");
                            $(".num-liked").text(liked + 1);
                        } else if (data.status == 10002) {
                            alert("不能自己支持自己哦~");
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }

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
