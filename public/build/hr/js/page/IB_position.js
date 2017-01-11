//职位
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        },
        'js/plugin/IB_jquery.cookie': {
            deps:['js/lib/IB_jquery'],
            exports: 'cookie'
        }
    }
});

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie', 'js/common/IB_map','js/lib/IB_fastclick', 'js/common/IB_fn', 'js/lib/IB_jweixin','js/lib/IB_wxAuth'], function ($, cookie,mapUtil, FastClick, fn, wx ,wxAuth) {
    $(function () {
        var can_request = true;
        fn.popBoxBind();

        //加载地图
        var desc = $("#location").attr("data-desc");
        var map = mapUtil.mapInit("location");
        mapUtil.locationAnalyze(map, desc);

        //投递简历
        $(".position-deliver-btn.on").click(function () {
            $(".overlay").show();
            $(".popBox-confirm").show();
        });

        //收藏该职位
      /*  $(".icon-favorite").hover(function () {
           $(".no-favorite").show();
        },function () {
           $(".no-favorite").hide();
        });*/
        $(".position-favorite").on({
            mouseover: function () {
                $(".no-favorite").show();
            },
            mouseout: function () {
                $(".no-favorite").hide();
            },
            click: function () {
                var job_jid = $(this).attr("data-jid");
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/add",
                    dataType: "json",
                    data: {
                        option: {
                            type: "job",
                            id: job_jid
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $(this).removeClass("icon-favorite").addClass("icon-isfavorite");
                            location.reload();
                        }
                    }
                });
            }
        });

        //职位已收藏
       /* $(".icon-isfavorite").hover(function () {
            $(".is-favorite").show();
        },function () {
            $(".is-favorite").hide();
        });*/
        $(".position-isfavorite").on({
            mouseover: function () {
                $(".is-favorite").show();
            },
            mouseout: function () {
                $(".is-favorite").hide();
            },
            click: function () {
                var job_jid = $(this).attr("data-jid");
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/cancel",
                    dataType: "json",
                    data: {
                        option: {
                            type: "job",
                            id: job_jid
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $(this).removeClass("icon-isfavorite").addClass("icon-favorite");
                            location.reload();
                        }
                    }
                });
            }
        });

       /* $(".isFavorite").click(function () {
            var $this = $(this);
            var job_jid = $this.attr("data-jid");
            if($this.hasClass("icon-favorite")) {    //收藏该职位
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/add",
                    dataType: "json",
                    data: {
                        option: {
                            type: "job",
                            id: job_jid
                        }
                    },
                success: function (data) {
                    if(data.status == 10000) {
                        $this.removeClass("icon-favorite").addClass("icon-isfavorite");
                        location.reload();
                        /!*$(".no-favorite").hide();
                        $(".is-favorite").show();*!/
                    }
                  }
                });
            } else {    //取消收藏该职位
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/cancel",
                    dataType: "json",
                    data: {
                        option: {
                            type: "job",
                            id: job_jid
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $this.removeClass("icon-isfavorite").addClass("icon-favorite");
                            location.reload();
                            /!*$(".is-favorite").hide();
                            $(".no-favorite").show();*!/
                        }
                    }
                });
            }
        });*/


        $(".popBox-confirm .btn-confirm").click(function () {
            var $this = $(this);
            var text = $this.val();
            var jid = $(this).attr("data-jid");
            var uid = $(this).attr("data-uid");
            var job_company_id = $(this).attr("data-job-cid");
            if (can_request) {
                can_request = false;
                $this.val("投递中...");
                $.ajax({
                    type: "post",
                    url: "/api/u_resume/resumeDelivery",
                    dataType: "json",
                    data: {
                        option: {
                            job_id: global.job.jid,
                            job_user_id: global.job.uid,
                            job_company_id: global.job.cid
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        $this.val(text);
                        if (data.status == 10000) {
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-success").show();
                            $(".position-deliver-btn").removeClass("on").addClass("off").val("已投递").off("click");
                        } else if (data.status == 10004) {
                            window.location.href = "/login?forward=" + encodeURIComponent(window.location.href);
                        } else if (data.status == 10005) {
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-repeat").show();
                        } else if (data.status == 10006) {
                            window.location.href = "/private/resumeCreate";
                        } else if (data.status == 10007) {
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-upperLimit").show();
                        } else if(data.status == 10008) {
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-offline").show();
                        }else if(data.status == 10009) {
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-over").show();
                        }
                    }
                });
            }
        });
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
