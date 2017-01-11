require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn','js/page/quickRecruit/IB_common'], function ($, FastClick, fn, quickRecruit) {
    $(function () {
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        var rid = global.rid;
        var forward = encodeURIComponent(window.location.href);
        fn.popBoxBind();

        $(".top-nav .nav").click(function () {
            //location.reload();   //刷新页面，加载出图像
            var $this = $(this);
            $(".top-nav .nav.curr").removeClass("curr");
            $this.addClass("curr");
            var status = $this.find("a").attr("href").substr(1, 1);
            fn.cookie("_user_qr_invite_status", status);
            $(".job").remove();
            $(".empty-area").remove();
            $(".load-tips").remove();
            page = 2;
            _jobUtil.getMore(1, status, function (data) {
                if (data.status == 10000) {
                    var invites = data.data.invites;
                    var len = invites.length;
                    if (!len) {
                        $(".jobs-area").append(_jobUtil.template.emptyArea);
                    } else {
                        if (len == 10) {
                            $(".left-content").append(_jobUtil.template.loadTips);
                        }
                        _jobUtil.pushJob(invites);
                    }
                }
            });
        });

        var page = 2;
        $(document).on("click", ".btn-load", function () {
            var $this = $(this);
            var text = $this.text();
            var status = $(".top-nav .nav.curr").find("a").attr("href").substr(1, 1);
            if (page && status) {
                $this.text("加载中...");
                _jobUtil.getMore(page, status, function (data) {
                    $this.text(text);
                    if (data.status == 10000) {
                        var invites = data.data.invites;
                        if (invites.length == 10) {
                            page += 1;
                        } else {
                            page = 0;
                            $(".load-tips").hide();
                        }
                        if (invites.length) {
                            _jobUtil.pushJob(invites);
                        }
                    }
                });
            }
        });

        //public
        $(".join-tips .btn-join").click(function () {
            var $this = $(this);
            var is_public = 1;
            if (can_request) {
                if ($this.hasClass("on")) {
                    is_public = 0;
                }
                $.ajax({
                    type: "post",
                    url: "/api/resume/update/" + rid,
                    dataType: "json",
                    data: {
                        option: {
                            is_public: is_public
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        if (data.status == 10000) {
                            if (is_public) {
                                $(".btn-join").removeClass("off").addClass("on");
                            } else {
                                $(".btn-join").removeClass("on").addClass("off");
                            }
                            if ($this.hasClass("pop")) {
                                setTimeout(function () {
                                    $(".overlay").hide();
                                    $(".popBox").hide();
                                }, 500);
                            }
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        } else if (data.status == 10006) {
                            window.location.href = "/resumeCreate";
                        }
                    }
                });
            }
        });
        if (!parseInt(global.is_public) && fn.storage("uid_qr_remind") != global.uid) {
            fn.storage("uid_qr_remind", global.uid);
            $(".overlay").show();
            $(".popBox-qr-join").show();
        }

        $(".btn-whatever").click(function () {
            $(".overlay").hide();
            $(".popBox").hide();
        });
        //update
        $(".control-panel .btn-update.on").click(function () {
            var $this = $(this);
            if (can_request && $(".btn-join").hasClass("on")) {
                $.ajax({
                    type: "post",
                    url: "/api/resume/update/" + rid,
                    dataType: "json",
                    data: {
                        option: {
                            refresh_time: +new Date()
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        if (data.status == 10000) {
                            $this.removeClass("on").addClass("off").text("简历已刷新");
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        } else if (data.status == 10006) {
                            window.location.href = "/resumeCreate";
                        }
                    }
                });
            } else if (!$(".btn-join").hasClass("on")) {
                alert("先开通快招才能刷新简历哦~");
            }
        });
        //apply
        $(".control-panel .btn-apply").click(function () {
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


        //响应快招邀请
        $(document).on("click", ".invite-state .btn", function () {
            var $this = $(this);
            var $job = $this.closest(".job");
            var jid = $job.attr("data-jid");
            var id = $job.attr("data-id");
            var term_id = $job.attr("data-tid");
            var type = 1;//接受
            var response = 2;
            if ($(this).hasClass("btn-refuse")) {
                type = 0;
                response = 3;
            }
            if (can_request) {
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type: "post",
                    url: "/api/quickRecruit/response",
                    dataType: "json",
                    data: {
                        option: {
                            id: id,
                            jid: jid,
                            term_id: term_id,
                            response: response
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        if (data.status == 10000 && type) {
                            $job.find(".invite-state .btn,.overdue-tips").remove();
                            $job.find(".invite-state").append('<span class="accepted">已接受</span>');
                        } else if (data.status == 10000 && !type) {
                            $job.find(".invite-state .btn,.overdue-tips").remove();
                            $job.find(".invite-state").append('<span class="refused">已拒绝</span>');
                        } else if (data.status == 10006) {
                            $job.find(".invite-state .btn,.overdue-tips").remove();
                            $job.find(".invite-state").append('<span class="refused">邀请已过期</span>');
                        }
                    }
                });
            }
        });

        $(".apply-state").click(function () {
            $(this).closest(".job-quickRecruit").find(".bottom-info").toggle();
        });
    });

    var can_request = true;
    var _jobUtil = {
        getMore: function (page, status, callBack) {
            if (page && can_request) {
                can_request = false;
                $.ajax({
                    type: "get",
                    url: "/api/quickRecruit/getInviteList",
                    dataType: "json",
                    data: {
                        page: page,
                        status: status
                    },
                    success: function (data) {
                        can_request = true;
                        callBack(data);
                    }
                });
            }
        },
        pushJob: function (invites) {
            var len = invites.length;
            if (len) {
                for (var i = 0; i < len; i++) {
                    var invite = invites[i];
                    var _invite_state = "";
                    var _failure_info = "";
                    var _bottom_info = "";
                    switch (parseInt(invite.status)) {
                        case 1 :
                            _invite_state = "<div class='invite-state'>\
                                         <span class='btn-accept btn'>接受</span>\
                                         <span class='btn-refuse btn'>拒绝</span>\
                                      </div>";
                            var days = 7 - Math.floor((+new Date - parseInt(invites[i].create_time)) / (1000 * 60 * 60 * 24));
                            _failure_info = "<div class='overdue-tips fr'>距离自动失效还有<em>" + days + "</em>天</div>";
                            break;
                        case 2 :
                            _invite_state = "<div class='invite-state'>\
                                         <span class='accepted'>已接受</span>\
                                      </div>";
                            _bottom_info = " <div class='bottom-info company-info'>企业的联系方式为&nbsp;<em class='company-contact'>" + invites[i].hr_email + "</em> </div>"
                            break;
                        case 3 :
                            _invite_state = "<div class='invite-state'>\
                                         <span class='refused'>已拒绝</span>\
                                      </div>";
                            break;
                        case 4 :
                            _invite_state = "<div class='invite-state'>\
                                         <span class='refused'>已过期</span>\
                                      </div>";
                            break;
                    }
                    var _term_info = "";
                    if (parseInt(invite.term_id)) {
                        _term_info = "<div class='invite-term fl'>第" + invite.term_id + "期</div>";
                    }
                    var _avatar = invite.avatar ? "background-image: url(" + invite.avatar + "?imageView2/2/w/120/h/120)" : "";
                    var job_name = invite.job_name;
                    var company_name = invite.company_name;
                    var city = invite.city;
                    var channel_type = invite.channel_type;
                    var payment;
                    if(invite.min_payment == 0 && invite.max_payment ==0) {
                        payment = "面议";
                    } else {
                        if(channel_type == 2) {
                            payment = invite.min_payment/10000 + "-" + invite.max_payment/10000 + "万/年";
                        } else {
                            payment = invite.min_payment + "-" + invite.max_payment + "/天";
                        }
                    }
                    var workdays = "≥" + invite.workdays + "天";
                    var rankKey = fn.randomKey(10);
                    var tag = "<div class='job job-" + rankKey + " job-quickRecruit clearfix' data-jid='" + invite.job_id + "' data-id='" + invite.id + "' data-tid='" + invite.term_id + "'>\
                            <div class='invite-info clearfix'>\
                               " + _term_info + "\
                                <div class='invite-time fl'>邀请时间&nbsp;:&nbsp;" + new Date(invite.create_time).format("yyyy-MM-dd hh:mm") + "</div>\
                                <i class='icon-quick-corner'></i>\
                                " + _failure_info + "\
                            </div>\
                            <div class='clearfix'>\
                                <div class='job-logo'>\
                                    <span class='company-logo' style='" + _avatar + "'></span>\
                                </div>\
                                <div class='job-l'>\
                                    <div class='avatar' style='" + _avatar + "'></div>\
                                    <div class='job-info-top'>\
                                        <span class='job-info-name'><a href='/job/detail/" + invite.job_id + "' target='_blank'></a></span><span>-</span>\
                                        <span  class='job-info-company'><a href='/company/detail/" + invite.company_id + "' target='_blank'></a></span>\
                                    </div>\
                                    <div class='job-info-bottom'>\
                                        <span class='job-info-city'></span>\
                                        <span class='job-info-money'></span>\
                                        <span class='job-info-days'></span>\
                                    </div>\
                                    " + _invite_state + "\
                                </div>\
                            </div>\
                        " + _bottom_info + "\
                    </div>";
                    $(".jobs-area").append(tag);
                    var $job = $(".job-" + rankKey);
                    $job.find(".job-info-name a").text(job_name);
                    $job.find(".job-info-company a").text(company_name);
                    $job.find(".job-info-city").html('<span class="icon-locate"></span>'+city);
                    $job.find(".job-info-money").html('<span class="icon-salary"></span>'+payment);
                    if(channel_type ==1){
                    $job.find(".job-info-days").html('<span class="icon-calendar"></span>'+workdays);
                    }
                }
            }
        },
        template: {
            emptyArea: "<div class='empty-area empty-area-apply'>\
                        <div class='no-apply'>\
                            <div class='bg'></div>\
                            <p class='notice-word'>没有找到符合条件的快招邀约...</p>\
                            <a class='btn btn-apply' href='/quickRecruit' target='_blank'>前往快招</a>\
                        </div>\
                    </div>",
            loadTips: "<div class='load-tips'> <span class='btn-load'>加载更多</span> </div>"
        }
    };
});
