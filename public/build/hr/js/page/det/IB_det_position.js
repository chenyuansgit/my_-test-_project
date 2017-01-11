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

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie','js/common/IB_map','js/lib/IB_fastclick', 'js/common/IB_fn', 'js/lib/IB_jweixin','js/lib/IB_wxAuth'], function ($, cookie,mapUtil, FastClick, fn, wx ,wxAuth) {
    $(function () {
        var can_request = true;
        fn.popBoxBind();
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}

        //加载地图
        var desc = $("#location").attr("data-desc");
        var map = mapUtil.mapInit("location");
        mapUtil.locationAnalyze(map, desc);

        $(".inputText").click(function (e) {
            var $this = $(this);
            if(!$this.hasClass("curr")) {
                $this.addClass("curr");
                $this.parent().find(".icon-down-arrow").remove();
                $this.parent().append("<span class='icon-up-arrow'></span>");
                $this.parent().find(".report-list").show();
            } else {
                $this.removeClass("curr");
                $this.parent().find(".icon-up-arrow").remove();
                $this.parent().append("<span class='icon-down-arrow'></span>");
                $this.parent().find(".report-list").hide();
            }
            e.stopPropagation();
        });

        $(".report-list li").click(function (e) {
            var $this = $(this);
            var text = $this.text();
            $this.parents(".text").find(".inputText").removeClass("curr").val(text);
            $this.parents(".text").find(".icon-up-arrow").remove();
            $this.parents(".text").append("<span class='icon-down-arrow'></span>");
            $this.parents(".text").find(".report-list").hide();

            e.stopPropagation();
        });

        //投递简历
        $(".position-deliver-btn.on").click(function () {
            $(".overlay").show();
            $(".popBox-confirm").show();
        });

        //收藏该职位
        /*$(".position-favorite").hover(function () {
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
                var det_id = $(this).attr("data-id");
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/add",
                    dataType: "json",
                    data: {
                        option: {
                            type: "det",
                            id: det_id
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $(this).removeClass("icon-favorite").addClass("icon-isfavorite");
                            location.reload();
                            /*$(".no-favorite").hide();
                             $(".is-favorite").show();*/
                        }
                    }
                });
            }
        });
        
        //职位已收藏  取消收藏
       /* $(".position-isfavorite").hover(function () {
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
                var det_id = $(this).attr("data-id");
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/cancel",
                    dataType: "json",
                    data: {
                        option: {
                            type: "det",
                            id: det_id
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $(this).removeClass("icon-isfavorite").addClass("icon-favorite");
                            location.reload();
                            /*$(".is-favorite").hide();
                             $(".no-favorite").show();*/
                        }
                    }
                });
            }
        });

        //举报该职位
        $(".report-icon").on({
           mouseover: function () {
               $(".is-report").show();
           },
            mouseout: function () {
                $(".is-report").hide();
            },
            click: function () {
                $(".overlay").show();
                $(".popBox-report").show();
            }
        });

        /*$(".report-icon").hover(function () {
            $(".is-report").show();
        },function () {
            $(".is-report").hide();
        });*/
        //举报该职位
        /*$(".report-icon").click(function () {
            $(".overlay").show();
            $(".popBox-report").show();
        });*/

        /*$(".isFavorite").click(function () {
            var $this = $(this);
            var det_id = $this.attr("data-id");
            if($this.hasClass("icon-favorite")) {    //收藏该职位
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/add",
                    dataType: "json",
                    data: {
                        option: {
                            type: "det",
                            id: det_id
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
                            type: "det",
                            id: det_id
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
            if (can_request) {
                can_request = false;
                $this.val("投递中...");
                $.ajax({
                    type: "post",
                    url: "/api/det/resumeDelivery",
                    dataType: "json",
                    data: {
                        option: {
                            det_id: global.det.jid
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
                            window.location.href = account_host+"/login?forward=" + encodeURIComponent(window.location.href);
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
                        }else if(data.status == 10008) {
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

        //举报
        $(".popBox-report .btn-report").click(function () {
            var $this = $(this);
            var text = $this.val();
            var title = $(".inputText").val();
            var desc = $(".report-text").val();
            if (can_request) {
                can_request = false;
                $this.val("举报中...");
                $.ajax({
                    type: "post",
                    url: "/api/det/report/"+global.det.jid,
                    dataType: "json",
                    data: {
                        option: {
                            det_id: global.det.jid,
                            title:title,
                            desc:desc
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        $this.val(text);
                        if (data.status == 10000) {
                            $this.parents(".report-jobs").append("<div class='input-tips success-edit'><span class='icon-speed'></span>举报成功！</div>");
                            setTimeout(function () {
                                $this.parents(".report-jobs").find(".input-tips").remove();
                                $(".overlay, .popBox").hide();
                                $(".inputText, .report-text").val("");
                            }, 2000);
                        } else {
                            //location.reload();
                        }
                    }
                });
            }
        });

        //微信分享
        var data_src = $(".share-back").attr("data-avatar");
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
