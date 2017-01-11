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
        var forward = encodeURIComponent(window.location.href);

        $(".top-nav .nav").click(function () {
            var $this = $(this);
            $(".top-nav .nav.curr").removeClass("curr");
            $this.addClass("curr");
            var status = $this.find("a").attr("href").substr(1, 1);
            fn.cookie("_hr_qr_invite_status", status);
            $(".resume-box").remove();
            $(".empty-area").remove();
            $(".load-tips").remove();
            page = 2;
            _resumeUtil.getMore(1, status, function (data) {
                if (data.status == 10000) {
                    var invites = data.data.invites;
                    var len = invites.length;
                    if (!len) {
                        $(".resume-area").append(_resumeUtil.template.emptyArea);
                    } else {
                        _resumeUtil.pushResume(invites);
                        if (len == 10) {
                            $(".left-content").append(_resumeUtil.template.loadTips);
                        }
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
                _resumeUtil.getMore(page, status, function (data) {
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
                            _resumeUtil.pushResume(invites);
                        }

                    }
                });
            }
        });


    });
    var can_request = true;
    var _resumeUtil = {
        //type 0:换状态 1:分页
        getMore: function (page, status, callBack) {
            if (page && can_request) {
                can_request = false;
                $.ajax({
                    type: "get",
                    url: "/api/quickRecruit/inviteList",
                    dataType: "json",
                    data: {
                        page: page,
                        status: status
                    },
                    success: function (data, type) {
                        can_request = true;
                        callBack(data);
                    }
                });
            }
        },
        pushResume: function (invites) {
            var len = invites.length;
            if (len) {
                for (var i = 0; i < len; i++) {
                    try {
                        var invite = invites[i];
                        var rid = invite.resume_id;
                        var jid = invite.job_id;
                        var job_name = invite.job_name;
                        var uid = invite.user_id;
                        var term_id = invite.term_id;
                        var qid = invite.qid;
                        var time = new Date(invite.update_time).format("yyyy-MM-dd hh:mm");
                        var avatar = invite.avatar;
                        var backgroundImg = avatar && avatar!='undefined' ? "background-image:url(" + avatar + "?imageView2/1/w/96/h/96)" : "";
                        var name = invite.name;
                        var sex = invite.male ? "男" : "女";
                        var education_detail = JSON.parse(invite.education_detail);
                        var school = education_detail[0].school || "";
                        var major = education_detail[0].major;
                        var stage = education_detail[0].stage;
                        var base_info = sex + "｜" + school + "｜" + major + "｜" + stage;
                        var status = invite.status;
                        var _resumeLink = "";
                        if (status == 2) {
                            _resumeLink = "<li> <a href='/resume/detail/" + rid + "?jid=" + jid + "' class='fl' target='_blank'>点击查看简历</a></li>";
                        } else if (status == 1) {
                            if (term_id) {
                                _resumeLink = "<li> <a href='/quickRecruit/detail/" + qid + "' class='fl' target='_blank'>点击查看简历</a></li>";
                            } else {
                                _resumeLink = "<li> <a href='/talentPool/detail/" + uid + "' class='fl' target='_blank'>点击查看简历</a></li>";
                            }
                        }
                        var rankKey = fn.randomKey(10);
                        var resumeTag = "<div class='resume-box resume-box-" + rankKey + " resume-box-quickRecruit'>\
                                    <div class='resume-box-top'>\
                                        邀请<span class='position-name'></span>\
                                        <i class='icon-quick-corner'></i>\
                                        <span class='deliver-time'>" + time + "&nbsp;邀请</span>\
                                    </div>\
                                    <div class='resume-info'>\
                                        <div class='resume-head' style='" + backgroundImg + "'></div>\
                                        <ul>\
                                            <li>\
                                                <div class='fl'>\
                                                    <span class='resume-name'></span>\
                                                    <span class='base-info'></span>\
                                                </div>\
                                            </li>\
                                            " + _resumeLink + "\
                                        </ul>\
                                    </div>\
                                </div>";
                        $(".resume-area").append(resumeTag);
                        var $box = $(".resume-box-" + rankKey);
                        $box.find(".position-name").text(job_name);
                        $box.find(".resume-name").text(name);
                        $box.find(".base-info").text(base_info);
                    } catch (e) {

                    }
                }
            }
        },
        template: {
            emptyArea: "<div class='empty-area empty-area-invite'>\
                    <div class='no-invite'>\
                        <div class='bg'></div>\
                        <p class='notice-word'>没有找到符合条件的快招简历信息...</p>\
                        <a class='btn btn-invite' href='/talentPool/list' target='_blank'>前往快招</a>\
                    </div>\
                   </div>",
            loadTips: "<div class='load-tips'> <span class='btn-load'>加载更多</span> </div>"
        }
    };
});
