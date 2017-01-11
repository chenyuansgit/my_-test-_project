require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        },
        'js/plugin/IB_jquery.cookie': {
            deps:['js/lib/IB_jquery'],
            exports: 'cookie'
        }
    }
});

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie', 'js/lib/IB_fastclick','js/common/IB_fn','js/page/quickRecruit/IB_common'], function ($, cookie, FastClick, fn, quickRecruit) {
    $(function () {
        var can_request = true;
        var forward = encodeURIComponent(window.location.href);
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        fn.pagingBind();
        fn.popBoxBind();
        var listType = $.trim(fn.getUrlPara("by"));
        if (listType == "state") {
            var state = fn.getUrlPara("state");
            $(".btn-state-" + state).addClass("curr");
        } else if (listType == "resume") {
            var resume = fn.getUrlPara("hasResume");
            $(".btn-resume-" + resume).addClass("curr");
            if (resume == "0") {
                $(".btn-position-resume").hide();
            }
        } else {
            $(".btn-state").addClass("curr");
        }

        var url = location.href;
        var page = $(".page.active").data("page");
        if (url.indexOf("page=") < 0) {
            if (url.indexOf("?") < 0) {
                url += "?page=" + page;
            } else {
                url += "&page=" + page;
            }
        }

        //删除职位
        $(document).on("click", ".position-delete", function () {
            var $this = $(this);
            var text = $this.text();
            var positionNums = parseInt($("#position-nums").text());
            var jobArea = $this.closest('.position-detail');
            var jobID = $(jobArea).attr("data-jid");
            if (can_request) {
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type: "POST",
                    url: "/api/jobs/delete/" + jobID,
                    dataType: "json",
                    success: function (data) {
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            jobArea.remove();
                            positionNums = positionNums -1;
                            $("#position-nums").text(positionNums);
                            if(positionNums == 0) {
                                $(".all-position").hide();
                                $(".position-list").append("<div class='empty-area'><div class='no-position'>没有找到符合条件的职位信息</div></div>")
                            }
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });
        //下线职位
        $(document).on("click", ".position-offline", function () {
            var $this = $(this);
            var text = $this.text();
            var jobArea = $this.closest('.position-detail');
            var jobID = $(jobArea).attr("data-jid");
            var positionNums = parseInt($("#position-nums").text());
            if (can_request) {
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type: "POST",
                    url: "/api/jobs/offline/" + jobID,
                    dataType: "json",
                    success: function (data) {
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            jobArea.remove();
                            positionNums = positionNums -1;
                            $("#position-nums").text(positionNums);
                            if(positionNums == 0) {
                                $(".all-position").hide();
                                $(".position-list").append("<div class='empty-area'><div class='no-position'>没有找到符合条件的职位信息</div></div>")
                            }
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });
        //上线职位
        $(document).on("click", ".position-online", function () {
            var jobArea = $(this).closest('.position-detail');
            var jobID = $(jobArea).attr("data-jid");
            var deadline = parseInt($(jobArea).attr("data-deadline"));
            var now = new Date().getTime();
            var oneDay = 24 * 60 * 60 * 1000;
            var timeDiff = parseInt((deadline - now) / oneDay) + 1;
            if (new Date(deadline).format("yyyy-MM-dd") == new Date(now).format("yyyy-MM-dd")) {
                timeDiff = 0;
            }
            $(".popBox-online .btn-online").attr("data-jid", jobID);
            $(".popBox-online .btn-edit").attr("href", "/job/edit/" + jobID);
            if (timeDiff >= 0) {
                $(".popBox-online .online-top").html("<i class='icon-warn'></i><span>该职位的截止日期为&nbsp;<i class='deadline'>" + new Date(deadline).format("yyyy-MM-dd") + "</i>，距离今日还有<i class='time-differ'>" + timeDiff + "</i>天。</span>");
                $(".overlay").show();
                $(".popBox-online").show();
            } else {
                $(".popBox-online .online-top").html(" <i class='icon-warn'></i><span>该职位已过期，重新选定截止日期后方可发布。</span>");
                $(".overlay").show();
                $(".popBox-online").show();
            }
        });
        $(".popBox-online .btn-online").click(function () {
            var $this = $(this);
            var text = $this.text();
            var jid = $this.attr("data-jid");
            var positionNums = parseInt($("#position-nums").text());
            var deadline = $.trim($("#online-time").val()).toTimeStamp() + 24 * 60 * 60 * 1000;
            if (deadline) {
                if (can_request) {
                    can_request = false;
                    $this.text("处理中...");
                    $.ajax({
                        type: "POST",
                        url: "/api/jobs/online/" + jid,
                        dataType: "json",
                        data: {
                            option: {
                                deadline: deadline
                            }
                        },
                        success: function (data) {
                            can_request = true;
                            $this.text(text);
                            if (data.status == 10000) {
                                $(".position-detail[data-jid='" + jid + "']").remove();
                                positionNums = positionNums -1;
                                $("#position-nums").text(positionNums);
                                if(positionNums == 0) {
                                    $(".all-position").hide();
                                    $(".position-list").append("<div class='empty-area'><div class='no-position'>没有找到符合条件的职位信息</div></div>")
                                }
                                $(".overlay").hide();
                                $(".popBox-online").hide();
                                location.reload();
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        }
                    });
                }
            } else {
                $(".timepicker").nextAll(".input-tips").remove();
                $(".timepicker").after("<div class='input-tips'>必填</div>");
            }
        });
        $(".timepicker,.online-time").click(function () {
            $(".timepicker").nextAll(".input-tips").remove();
        });
        //刷新职位
        $(document).on("click", ".position-refresh", function () {
            var $this = $(this);
            var text = $this.text();
            if ($this.attr('refresh-state') == 0) {
                return;
            }
            var jobArea = $this.parent().parent();
            var jobID = $(jobArea).attr("data-jid");
            if (can_request) {
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type: "POST",
                    url: "/api/jobs/refresh/" + jobID,
                    dataType: "json",
                    success: function (data) {
                        can_request = true;
                        if (data.status == 10000) {
                            $this.text('已刷新').attr('refresh-state', 0).css({"color": "#999"});
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });
        
        /*
        $(".quick-recruit-recommend .btn-invite").click(function () {
            $(".overlay").show();
            $(".popBox-quickRecruit").show();
            var content_id = $(this).attr("data-content-id");
            $(".popBox-quickRecruit .btn-invite").attr("data-content-id", content_id);
        });
        $(".popBox .btn-ok").click(function () {
            $(".overlay").hide();
            $(".popBox").hide();
        });
        quickRecruit.inviteInit("special");*/
    });
});