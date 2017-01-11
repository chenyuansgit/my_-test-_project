//公司
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

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie', 'js/lib/IB_fastclick', 'js/common/IB_fn', 'js/common/IB_map', 'js/lib/IB_jweixin','js/lib/IB_wxAuth'], function ($, cookie, FastClick, fn, mapUtil, wx ,wxAuth) {
    $(function(){
        var can_request = true;
        fn.popBoxBind();
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}

        //如果实习职位为空
        if(!$(".intern_item").length>0) {
            $(".campus_li").addClass("cur").append('<span class="icon-sel-up"></span>');
            $(".campus_item").show();
        }

        //加载地图
        var map = mapUtil.mapInit("location");
        var location_arr = $(".location-detail");
        var location = $.trim($(location_arr).eq(0).find(".location-desc").text());
        mapUtil.locationAnalyze(map,location);

        $(".location-desc").on("click",function(){
            var  location_new = $.trim($(this).text());
            if(location == location_new){
                return false;
            }else{
                location = location_new;
                mapUtil.locationAnalyze(map,location);
            }
        });
        //一键投递简历
        $(".btn-deliver.on").click(function(){
            var jid = $(this).attr("data-jid");
            var uid = $(this).attr("data-uid");
            var data_channel_type = $(this).attr("data-channel-type");
            $(".btn-deliver.on.curr").removeClass("curr");
            $(this).addClass("curr");
            var job_company_id = $(this).attr("data-job-cid");
            $(".confirm-deliver .btn-confirm").attr({"data-jid":jid,"data-uid":uid,"data-job-cid":job_company_id,"data-channel-type":data_channel_type});
            $(".overlay").show();
            $(".popBox-confirm").show();
        });

        //收藏该职位
        /*$(".icon-favorite").hover(function () {
            $(".no-favorite").show();
        },function () {
            $(".no-favorite").hide();
        });*/
        $(".company-favorite").on({
           mouseover: function () {
               $(".no-favorite").show();
           },
            mouseout: function () {
                $(".no-favorite").hide();
            },
            click: function () {
                var company_cid = $(this).attr("data-cid");
                $.ajax({
                    type: "post",
                    url: "/api/favorite/add",
                    dataType: "json",
                    data: {
                        option: {
                            type: "company",
                            id: company_cid
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $(this).removeClass("icon-favorite").addClass("icon-isfavorite");
                            window.location.reload();
                            /*$(".no-favorite").hide();
                             $(".is-favorite").show();*/
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
        $(".company-isfavorite").on({
           mouseover: function () {
               $(".is-favorite").show();
           },
            mouseout: function () {
                $(".is-favorite").hide();
            },
            click: function () {
                var company_cid = $(this).attr("data-cid");
                $.ajax({
                    type: "post",
                    url: "/api/favorite/cancel",
                    dataType: "json",
                    data: {
                        option: {
                            type: "company",
                            id: company_cid
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $(this).removeClass("icon-isfavorite").addClass("icon-favorite");
                            window.location.reload();
                            /*$(".is-favorite").hide();
                             $(".no-favorite").show();*/
                        }
                    }
                });
            }
        });

        /*$(".isFavorite").click(function () {
            var $this = $(this);
            var company_cid = $this.attr("data-cid");
            if($this.hasClass("icon-favorite")) {    //收藏该公司
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/add",
                    dataType: "json",
                    data: {
                        option: {
                            type: "company",
                            id: company_cid
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $this.removeClass("icon-favorite").addClass("icon-isfavorite");
                            window.location.reload();
                            /!*$(".no-favorite").hide();
                             $(".is-favorite").show();*!/
                        }
                    }
                });
            } else {    //取消收藏该公司
                $.ajax({
                    type: "post",
                    url: "/api/private/favorite/cancel",
                    dataType: "json",
                    data: {
                        option: {
                            type: "company",
                            id: company_cid
                        }
                    },
                    success: function (data) {
                        if(data.status == 10000) {
                            $this.removeClass("icon-isfavorite").addClass("icon-favorite");
                            window.location.reload();
                            /!*$(".is-favorite").hide();
                             $(".no-favorite").show();*!/
                        }
                    }
                });
            }
        });*/


        $(".confirm-deliver .btn-confirm").click(function(){
            var $this = $(this);
            var text = $this.val();
            var jid = $(this).attr("data-jid");
            var uid = $(this).attr("data-uid");
            var job_company_id = $(this).attr("data-job-cid");
            var data_channel_type = parseInt($(this).attr("data-channel-type"));
            var url;
            if(data_channel_type === 1) {
                url= "/api/job/delivery";
                option = {
                    job_id:jid,
                    job_user_id:uid,
                    job_company_id:job_company_id
                }
            }
            else {
                url = "/api/det/delivery";
                option = {
                    det_id:jid
                }
            }
            if(can_request){
                can_request = false;
                $this.val("投递中..");
                $.ajax({
                    type:"post",
                    url: url,
                    dataType:"json",
                    data:{
                        option:option
                    },
                    success:function(data){
                        $this.val(text);
                        can_request = true;
                        if(data.status==10000){
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-success").show();
                            $(".btn-deliver.on.curr").removeClass("on").addClass("off").text("已投递").off("click");
                        }else if(data.status== 10013){
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-times").show();
                        }else if(data.status == 10004){
                            window.location.href = account_host+"/login?forward="+encodeURIComponent(window.location.href);
                        }else if(data.status== 10005){
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-repeat").show();
                        }else if(data.status== 10006){
                            window.location.href = "/resumeCreate";
                        }else if(data.status== 10007){
                            $(".overlay").show();
                            $(".popBox").hide();
                            $(".popBox-upperLimit").show();
                        }
                    }
                });
            }
        });

        //职位切换
        $(".intern_li").click(function () {
            var $this = $(this);
            if($this.hasClass("cur"))
                return;
            else {
                $(".campus_li").removeClass("cur").parent().find(".icon-sel-up").remove();
                $this.addClass("cur").append("<span class='icon-sel-up'></span>");
                $(".intern_item").show();
                $(".campus_item").hide();
            }
        });
        $(".campus_li").click(function () {
            var $this = $(this);
            if($this.hasClass("cur"))
                return;
            else {
                $(".intern_li").removeClass("cur").parent().find(".icon-sel-up").remove();
                $this.addClass("cur").append("<span class='icon-sel-up'></span>");
                $(".campus_item").show();
                $(".intern_item").hide();
            }
        });

        //职位分页
        $(".pages .page").on("click",function(){
            var page = parseInt($(this).text());
            var pages, box;
            if($(this).parents(".intern_item").length>0) {
                pages = $(".intern_item .pages .page").length;
                box = ".intern_item";
            }
            else {
                pages = $(".campus_item .pages .page").length;
                box = ".campus_item";
            }
            pageChange(page, pages, box);
        });
        $(document).on("click",".pages .on",function(){
            var page,pages, box;
            if($(this).parents(".intern_item").length>0) {
                box = ".intern_item";
                pages = $(box+" .pages .page").length;
                page = parseInt($(box+" .pages .active").text());
                if(pages<=10){
                    if($(this).hasClass("prev")){
                        page -= 1;
                    }else{
                        page += 1;
                    }
                } else {    //当页数大于10条时
                    if($(this).hasClass("prev")){
                        if(!$(box+" .pages .page").eq(0).hasClass("none") && !$(box+" .pages .page").eq(10-1).hasClass("none")) {
                            page -= 1;
                        } else {
                            var s = parseInt($(box+" .pages .page.display").last().text())-1;
                            $(box+" .pages .page").eq(s-10).removeClass("none").addClass("display");
                            $(box+" .pages .page").eq(s).addClass("none").removeClass("display");
                            page -= 1;
                        }
                    }else{
                        if(page>=10) {
                            $(box+" .pages .page").eq(page-10).addClass("none").removeClass("display");
                            $(box+" .pages .page").eq(page).removeClass("none").addClass("display");
                        }
                        page += 1;
                    }
                }
            }
            else {
                box = ".campus_item";
                pages = $(box+" .pages .page").length;
                page = parseInt($(box+" .pages .active").text());
                if(pages<=10) {
                    if ($(this).hasClass("prev")) {
                        page -= 1;
                    } else {
                        page += 1;
                    }
                }else {   //当页数大于10条时
                    if($(this).hasClass("prev")){
                        if(!$(box+" .pages .page").eq(0).hasClass("none") && !$(box+" .pages .page").eq(10-1).hasClass("none")) {
                            page -= 1;
                        } else {
                            var n = parseInt($(box+" .pages .page.display").last().text())-1;
                            $(box+" .pages .page").eq(n-10).removeClass("none").addClass("display");
                            $(box+" .pages .page").eq(n).addClass("none").removeClass("display");
                            page -= 1;
                        }
                    }else{
                        if(page>=10) {
                            $(box+" .pages .page").eq(page-10).addClass("none").removeClass("display");
                            $(box+" .pages .page").eq(page).removeClass("none").addClass("display");
                        }
                        page += 1;
                    }
                }
            }
            if(page>0 && page<=pages){
                pageChange(page, pages, box);
            }

        });
        function pageChange(page, pages, box){
            $(box+" .page.active").removeClass("active");
            $(box+" .pages .page").eq(page-1).addClass("active");
            $(box+" .job-page").hide();
            $(box+" .job-page-"+page).show();
            if(page == 1){
                $(box+" .pages .prev").addClass("off").removeClass("on");
                //$(box+" .pages .next").removeClass("off").addClass("on");
            }else {
                $(box+" .pages .prev").removeClass("off").addClass("on");
            }
            if(page == pages){
                $(box+" .pages .next").addClass("off").removeClass("on");
            } else {
                $(box+" .pages .next").removeClass("off").addClass("on");
            }
        }

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