require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn','js/page/quickRecruit/IB_common','js/common/IB_job_type'], function ($, FastClick, fn, quickRecruit,job_types ) {
    $(function () {
        var can_request = true;
        fn.popBoxBind();
        fn.backTopBind();
        fn.pagingBind();

        getTypeList();

        //显示更多城市
        $(".active .btn-more").hover(function () {
            $(this).parent().nextAll(".more").show();
        });
        $(document).on("mouseleave", ".more", function () {
            $(this).hide();
        });

        //职位搜索
        if (location.href.indexOf("/employer/summer/resumeList") > -1) {
            var jt = decodeURIComponent(fn.getUrlPara("jt"));//职位类型
            var cid = decodeURIComponent(fn.getUrlPara("cid"));//工作城市
            var mp = fn.getUrlPara("mp");//薪水类型
            var wk = fn.getUrlPara("wk");//每周工作天数
            var dt = fn.getUrlPara("dt");//实习周期
            var et = fn.getUrlPara("et");//学历要求类型
            var ws = fn.getUrlPara("ws");//求职状态  //
            var ava = fn.getUrlPara("ava");//头像显示
            var pages = fn.getUrlPara("page");//页数
            //var lt = fn.getUrlPara("lt");//排序类型,hot和time
            var url = "/employer/summer/resumeList?cid=" + cid + "&jt="+ jt +"&mp=" + mp + "&wk=" + wk + "&dt=" + dt + "&et=" + et + "&ava=" + ava + "&page=" + pages;

            //根据城市检索
            $(".job-city").click(function () {
                var id = "cid=" + $(this).attr("data-cid");
                url = url.replace("cid=" + cid, id).replace("page=" + pages, "page=1");
                location.href = url;
            });

            //根据薪资检索
            $(".job-salary").click(function () {
                var sMp = "mp=" + $(this).attr("data-s");
                url = url.replace("mp=" + mp, sMp).replace("page=" + pages, "page=1");
                location.href = url;
            });

            //根据每周实习天数检索
            $(".job-times").click(function () {
                var sTimes = "wk=" + $(this).attr("data-t");
                url = url.replace("wk=" + wk, sTimes).replace("page=" + pages, "page=1");
                location.href = url;
            });

            //根据实习周期检索
            $(".job-cycle").click(function () {
                var sDt = "dt=" + $(this).attr("data-c");
                url = url.replace("dt=" + dt, sDt).replace("page=" + pages, "page=1");
                location.href = url;
            });

            //根据学历要求检索
            $(".job-edu").click(function () {
                var sEt = "et=" + $(this).attr("data-e");
                url = url.replace("et=" + et, sEt).replace("page=" + pages, "page=1");
                location.href = url;
            });

            //根据求职状态检索
            $(".job-state").click(function () {
                var sWs = "ws=" + $(this).attr("data-s");
                url = url.replace("ws=" + ws, sWs).replace("page=" + pages, "page=1");
                location.href = url;
            });

            //根据头像检索
            $(".job-avatar").click(function () {
                var sAva = "ava=" + $(this).attr("data-a");
                url = url.replace("ava=" + ava, sAva).replace("page=" + pages, "page=1");
                location.href = url;
            });

            //根据分类检索
            if (jt) {
                var type = $(".job-type[data-id=" + jt + "]").attr("data-type");
                if (type) {
                    $(".job-class-area").append("<li class='job-type selected' data-type='" + type + "' data-id='" + jt + "'>" + type + "</li>");
                    $(".job-type[data-id=" + jt + "]").addClass("selected");
                }
            }
            $(document).on("click", ".job-class", function () {
                $(".job-class.selected").removeClass("selected");
                $(this).addClass("selected");
                $(".type-detail").hide();
                var jobClass = $(this).attr("data-class");
                $(".type-detail").each(function () {
                    if ($(this).attr("data-class") == jobClass) {
                        $(this).show();
                    }
                });
            });
            $(document).on("mouseleave", ".type-detail", function () {
                $(this).hide();
                $(".job-class.selected").removeClass("selected");
            });
            $(document).on("click", ".job-type", function () {
                var sJt = "jt=" + $(this).attr("data-id");
                url = url.replace("jt=" + jt, sJt).replace("page=" + pages, "page=1");
                location.href = url;
            });
        }

        //invite
        quickRecruit.inviteInit("common");
        $(document).on("click", ".talent-info .btn-invite", function () {
            var $this = $(this);
            $(".talent-info.now").removeClass("now");
            $this.closest(".talent-info").addClass("now");
            var rid = $this.attr("data-rid");
            var version = $this.attr("data-version");
            $(".popBox-quickRecruit .btn-invite").attr({"data-rid": rid, "data-version": version, "data-type": "list"});
            $(".overlay").show();
            $(".popBox-quickRecruit").show();
        });
        $(".popBox .btn-ok").click(function () {
            $(".overlay").hide();
            $(".popBox").hide();
        });


        //分页
        var ifNext = 1;
        var page = 1;
        var detailURL = "/private/talentPool/detail/";
        if (window.location.href.indexOf("/employer/talentPool") > -1) {
            detailURL = "/employer/talentPool/detail/";
        }
    });
    function getTypeList() {
        var parent_list = "<ul class='job-class-area'><li class='title'>实习分类:</li> <li class='job-type' data-type='' >不限</li>";
        for (var i = 0, len = job_types.length; i < len; i++) {
            parent_list += "<li class='job-class' data-class='" + job_types[i].parent_type_name + "'>" + job_types[i].parent_type_name + "</li>";
        }
        parent_list += "</ul>";
        var sub_list = "<div class='type-detail-area'>";
        var listArr = [];
        for (var i = 0, len = job_types.length; i < len; i++) {
            listArr[i] = "<ul class='type-detail' data-class='" + job_types[i].parent_type_name + "'>";
            for (var j = 0, sub_len = job_types[i].sub_types.length; j < sub_len; j++) {
                var sub = job_types[i].sub_types[j];
                var id = sub.group_id;
                var detail_list = "<li class='stage2rd-title job-type' data-type=" + sub.group_name + " data-id=" + id + ">" + sub.group_name + "</li>";
                listArr[i] += detail_list;
            }
            listArr[i] += "</ul>";
        }
        for (var i = 0, len = listArr.length; i < len; i++) {
            sub_list += listArr[i];
        }
        sub_list += "</div>";
        $(".item-job-type").append(sub_list);
        return parent_list + sub_list;
    }
});