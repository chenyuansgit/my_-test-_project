require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn'], function ($, FastClick, fn) {
    $(function () {
        /*1:投递成功,2:被查看,3:带沟通,4:通知面试,5:不合适*/
        var by = "state", state = 1;
        var data = {};
        var listType = parseInt(fn.getUrlPara("status"));//获取我的求职列表状态
        if (!listType) {
            $(".nav.curr").removeClass("curr");
            $(".icon-sel-up").remove();
            $(".nav-0").addClass("curr").append("<span class='icon-sel-up'></span>");
        } else {
            $(".nav.curr").removeClass("curr");
            $(".icon-sel-up").remove();
            $(".nav-" + (listType)).addClass("curr").append("<span class='icon-sel-up'></span>");
            data = {status: listType};
        }

        //显示电话号码
        $(".icon-phone").hover(function () {
            var $this = $(this);
            var top = $this.position().top;
            var left = $this.position().left;
            $(this).parents(".job-info-w398").find(".phone-box").show().css({"left":left-25+"px","top":top-32+"px"});
        },function () {
            $(this).parents(".job-info-w398").find(".phone-box").hide();
        });

        //显示邮箱
        $(".icon-email").hover(function () {
            var $this = $(this);
            var top = $this.position().top;
            var left = $this.position().left;
            $(this).parents(".job-info-w398").find(".email-box").show().css({"left":left-21+"px","top":top-32+"px"});
        },function () {
            $(this).parents(".job-info-w398").find(".email-box").hide();
        });

        //流程状态显示
        $(".deliver-state").click(function () {
            var $this = $(this);
            var jid = $this.attr("data-jid");
            var company = $this.attr("data-company");
            if(!$this.hasClass("cur")) {
                $this.addClass("cur");
                $this.parents(".job").find(".process-box").show();
                $this.find(".icon-down-arrow").remove();
                $this.append("<span class='icon-up-arrow'></span>");
                $.ajax({
                    type: "get",
                    url: "/api/job/getDeliveryDetail?jid="+jid,
                    dataType: "json",
                    beforeSend:function(){
                        $(".loading").show();
                    },
                    success: function (data) {
                        $(".loading").hide();
                        if(data.status == 10000) {
                          //投递成功
                            var processlist;
                            if( data.data.status == 1 ) {
                               processlist = '<div class="process-box-text">\
                                <div class="process-icon">\
                                <div class="process-line"></div><span class="icon-speed status-1 success"></span><span class="icon-speed status-2"></span><span class="icon-speed status-3"></span></div>\
                                <div class="process-title">\
                                <span class="success status-1">投递成功</span><span class="status-2">待沟通</span><span class="status-3">邀请面试</span>\
                                </div>\
                                <div class="process-item-box">\
                                <div class="process-item"><div class="process-item-title"><span class="circle"></span>'+new Date(data.data.create_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                <div class="process-item-info"><p><span class="company">'+company+'</span>已经成功接收了您的简历</p></div></div></div></div>';
                            }else if(data.data.status == 2) {
                                processlist = '<div class="process-box-text">\
                                <div class="process-icon">\
                                    <div class="process-line"></div>\
                                    <span class="icon-speed status-1 success"></span><span class="icon-speed status-2 success"></span><span class="icon-speed status-3"></span>\
                                    </div>\
                                    <div class="process-title"><span class="success status-1">投递成功</span><span class="status-2">待沟通</span><span class="status-3">邀请面试</span></div>\
                                    <div class="process-item-box"></div><div class="process-item"><div class="process-line process-line-status-1"></div><div class="process-item-title"><span class="circle"></span>'+new Date(JSON.parse(data.data.contact_info).update_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                    <div class="process-item-info">\
                                    <p class="success">简历已通过初筛，三个工作日之内HR将与您沟通。</p></div></div>\
                                <div class="process-item"><div class="process-line2 process-line-status-1"></div>\
                                    <div class="process-item-title"><span class="circle-gray"></span>'+new Date(data.data.create_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                    <div class="process-item-info"><p class="next"><span class="company">'+company+'</span>已经成功接收了您的简历</p></div></div></div></div>';
                            }else if(data.data.status == 3) {
                                processlist = '<div class="process-box-text">\
                                <div class="process-icon">\
                                    <div class="process-line"></div>\
                                    <span class="icon-speed status-1 success"></span><span class="icon-speed status-2 success"></span><span class="icon-speed status-3 success"></span></div>\
                                    <div class="process-title"><span class="success status-1">投递成功</span><span class="status-2">待沟通</span><span class="status-3">邀请面试</span></div>\
                                    <div class="process-item-box">\
                                    <div class="process-item"><div class="process-line process-line-status-1"></div><div class="process-item-title"><span class="circle"></span>'+new Date(JSON.parse(data.data.interview_info).update_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                    <div class="process-item-info">\
                                    <p class="success">HR给您发来面试通知</p><p>面试时间：'+new Date(parseInt(JSON.parse(data.data.interview_info).interview_time)).format("yyyy-MM-dd hh:ss")+' </p><p>面试地点：'+JSON.parse(data.data.interview_info).address+'</p><p>联系人：'+JSON.parse(data.data.interview_info).hr_name+'</p><p>联系电话：'+JSON.parse(data.data.interview_info).hr_phone+'</p>\
                                </div></div>\
                                <div class="process-item"><div class="process-line3 process-line-status-2"></div><div class="process-line2 process-line-status-1"></div>\
                                    <div class="process-item-title"><span class="circle-gray"></span>'+new Date(JSON.parse(data.data.contact_info).update_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                    <div class="process-item-info">\
                                    <p class="next">简历已通过初筛，三个工作日之内HR将与您沟通。</p>\
                                </div></div>\
                                <div class="process-item"><div class="process-line2 process-line-status-2"></div>\
                                    <div class="process-item-title"><span class="circle-gray"></span>'+new Date(data.data.create_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                    <div class="process-item-info"><p class="next"><span class="company">'+company+'</span>已经成功接收了您的简历</p></div></div></div></div>';
                            }else if(data.data.status == 4) {
                                if(data.data.contact_info.length > 0) {
                                    processlist = '<div class="process-box-text">\
                                    <div class="process-icon">\
                                        <div class="process-line"></div>\
                                        <span class="icon-speed status-1 success"></span><span class="icon-speed status-2 success"></span><span class="icon-corner status-3 fail"></span>\
                                        </div>\
                                        <div class="process-title">\
                                        <span class="success status-1">投递成功</span><span class="status-2">待沟通</span><span class="status-3">不合适</span>\
                                        </div>\
                                        <div class="process-item-box">\
                                        <div class="process-item"><div class="process-line process-line-status-1"></div><div class="process-item-title"><span class="circle"></span>'+new Date(JSON.parse(data.data.improper_info).update_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                        <div class="process-item-info"><p class="success">HR觉得您的简历和该职位不匹配，感谢您的投递。</p><p>'+JSON.parse(data.data.improper_info).reason_title+'</p></div></div>\
                                    <div class="process-item"><div class="process-line3 process-line-status-2"></div><div class="process-line2 process-line-status-1"></div>\
                                        <div class="process-item-title"><span class="circle-gray"></span>'+new Date(JSON.parse(data.data.contact_info).update_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                        <div class="process-item-info"><p class="next">简历已通过初筛，三个工作日之内HR将与您沟通。</p></div></div>\
                                    <div class="process-item"><div class="process-line2 process-line-status-2"></div>\
                                        <div class="process-item-title"><span class="circle-gray"></span>'+new Date(data.data.create_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                        <div class="process-item-info"><p class="next"><span class="company">'+company+'</span>已经成功接收了您的简历</p></div></div></div></div>';
                                } else {
                                    processlist = '<div class="process-box-text">\
                                    <div class="process-icon">\
                                        <div class="process-line"></div>\
                                        <span class="icon-speed status-1 success"></span><span class="icon-speed status-2 success"></span><span class="icon-corner status-3 fail"></span>\
                                        </div>\
                                        <div class="process-title">\
                                        <span class="success status-1">投递成功</span><span class="status-2">待沟通</span><span class="status-3">不合适</span>\
                                        </div>\
                                        <div class="process-item-box">\
                                        <div class="process-item"><div class="process-line process-line-status-1"></div><div class="process-item-title"><span class="circle"></span>'+new Date(JSON.parse(data.data.improper_info).update_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                        <div class="process-item-info"><p class="success">HR觉得您的简历和该职位不匹配，感谢您的投递。</p><p>'+JSON.parse(data.data.improper_info).reason_title+'</p></div></div>\
                                        <div class="process-item"><div class="process-line2 process-line-status-1"></div>\
                                        <div class="process-item-title"><span class="circle-gray"></span>'+new Date(data.data.create_time).format("yyyy-MM-dd hh:ss")+'</div>\
                                        <div class="process-item-info"><p class="next"><span class="company">'+company+'</span>已经成功接收了您的简历</p></div></div></div></div>';
                                }
                            }else if(data.data.status == 5) {
                            }
                            $this.parents(".job").find(".process-box").append(processlist);
                        }
                    }
                });
            } else {
                $this.removeClass("cur");
                $this.parents(".job").find(".process-box").hide();
                $this.find(".icon-up-arrow").remove();
                $this.append("<span class='icon-down-arrow'></span>");
                $this.parents(".job").find(".process-box-text").remove();   //移除已存在的数据
            }
        });

        //分页事件绑定
        fn.pagingBind();
    });
});