/**
 * Created by zhphu on 16/7/13.
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
require(['js/lib/IB_fn', 'js/lib/IB_zepto','js/lib/IB_fastclick', 'js/lib/IB_wxAuth', 'js/lib/IB_jweixin','js/lib/IB_editor'], function (fn, $,FastClick, wxAuth, wx,editor) {
    var commonUtil = {
        removeSlideBlock :function($slideBlock){
            /*$(".mr").css({"opacity":"1"/!*,"position":"static"*!/});*/
            $slideBlock.removeClass("flipRight").addClass("flipRightOut");
            setTimeout(function () {
                $slideBlock.removeClass("flipRightOut").hide();
            }, 600);
        },
        showSlideBlock : function($slideBlock){
            $slideBlock.show().addClass("animation_600 flipRight");
            setTimeout(function () {
                /*$(".mr").css({"opacity":"0"/!*,"position":"absolute"*!/});*/
                commonUtil.pageScroll();
            }, 600);

        },
        pageScroll : function(){
            window.scrollBy(0, -20);
            var scrollTimer = setTimeout(function() {
                commonUtil.pageScroll();
            }, 1);
            if ($(window).scrollTop() == 0) {
                clearTimeout(scrollTimer);
            }
        },
        showPopTips : function(text){
            $(".popTips").show().text(text).addClass("fadeIn");
            setTimeout(function () {
                $(".popTips").removeClass("fadeIn").hide();
            }, 1000);
        }
    };
    var jobUtil = {
        requestUrl : {
            deliver : "/api/det/resumeDelivery",
            report : "/api/det/report/"//+d_id
        },
        ajaxRequest : function (url , option, callback) {
            $.ajax({
                type: 'post',
                url: url,
                data: {
                    option: option
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status == 10000) return callback(null);
                    callback(data.desc, data.status);
                },
                error: function (err) {
                    callback(err);
                }
            });
        }
    };
    $(function () {
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        FastClick.attach(document.body);
        var forward = decodeURIComponent($.trim(fn.getQueryString('forward')));
        $('.back').attr('href', forward || '/');
        //小键盘bugfix
        $('.required').bind('focus',function(){
            commonUtil.pageScroll();
        });
        /*editor*/
        ue_report = $(".report-editor").editor();
        /*editor*/

        $('.delivery.on').on("click", function (e) {
            e.preventDefault();
            if ($(this).hasClass('ing')) return false;
            if(!isLogin){
                window.location.href = account_host+"/login?forward=" + encodeURIComponent(location.href);
                return;
            }
            $(this).addClass('ing').text('正在投递...');
            jobUtil.ajaxRequest(jobUtil.requestUrl.deliver,{
                det_id: $('#content').attr('data-det-id')
            }, function (err, code) {
                if (err) {
                    $('.delivery.on').removeClass('ing').text('投递');
                    if(code == 10004){
                        return window.location.href = account_host+"/login?forward=" + encodeURIComponent(location.href);
                    }
                    if (code == 10006) {
                        return window.location.href = "/private/resumeCreate?forward=" + encodeURIComponent(location.href);
                    }
                    if (code == 10013) {
                        return alert('您今日的投递已超过上限,请明天再来!');
                    }
                    if (code == 10008) {
                        return alert('该职位已过期');
                    }
                    if (code == 10009) {
                        return alert('该职位投递量已满,看看其它职位吧~');
                    }
                    if (code == 10007) {
                        return alert('您已经投递过该职位!');
                    }
                    return alert('系统错误,请稍后再试!');
                }
                $('.delivery').removeClass('on').removeClass('ing').addClass('off').text('已投递').off("click");
            });
        });
        
        
        $(".option.report").click(function(){
            commonUtil.showSlideBlock($(".slide-block-report"));
        });
        $(".slide-block .back").click(function(){
            commonUtil.removeSlideBlock($(this).closest(".slide-block"));
        });
        $(".slide-block .report-reason-content").click(function(){
            var $this = $(this);
            if($this.hasClass("on")){
                $this.removeClass("on");
                $this.next(".reason-list").hide();
            }else{
                $this.addClass("on");
                $this.next(".reason-list").show();
            }
        });
        $(".reason-list .reason").click(function(){
            var reason = $.trim($(this).text());
            var $reason_content = $(this).parent().prev(".report-reason-content");
            $reason_content.find(".report-reason").text(reason);
            $reason_content.removeClass("on").attr("data-selected","1");
            $(this).closest(".reason-list").hide();
        });
        $(".btn-report").click(function(){
            if(!parseInt($(".report-reason-content").attr("data-selected"))){
                commonUtil.showPopTips("请选择举报原因");
            }else if(!$.trim(ue_report.getValue())){
                commonUtil.showPopTips("请描述举报问题");
            }else{
                var title = $.trim($(".report-reason").text());
                var desc = $.trim(ue_report.getValue());
                var det_id = $('#content').attr('data-det-id');
                jobUtil.ajaxRequest(jobUtil.requestUrl.report+det_id,{
                    title : title,
                    desc : desc
                },function(err, code){
                    if (err) {
                        commonUtil.showPopTips("服务器错误,请稍后重试");
                    }
                    commonUtil.showPopTips("举报成功");
                    var timer = setInterval(function(){
                        commonUtil.removeSlideBlock($(".slide-block-report"));
                        clearInterval(timer);
                    },1000);
                });
            }
        });

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