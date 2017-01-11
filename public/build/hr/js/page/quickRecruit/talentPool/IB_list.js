require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn','js/page/quickRecruit/IB_common','js/common/IB_job_type'], function ($, FastClick, fn, quickRecruit,job_types) {
    $(function () {
        var can_request = true;
        fn.popBoxBind();
        fn.backTopBind();
        fn.pagingBind();

        //显示更多城市
        $(".active .btn-more").hover(function () {
            $(this).parent().nextAll(".more").show();
        });
        $(document).on("mouseleave", ".more", function () {
            $(this).hide();
        });

        getTypeList();

        //职位搜索
        if (location.href.indexOf("/talentPool/list") > -1) {
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
            var url = "/talentPool/list?cid=" + cid +"&jt="+ jt + "&mp=" + mp + "&wk=" + wk + "&dt=" + dt + "&et=" + et + "&ava=" + ava + "&page=" + pages;

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
        detailURL = "/talentPool/detail/";
        /* getMore(page);
         $(window).on('scroll', function () {
         if($(document).height() == $(window).scrollTop() + $(window).height()){
         if(ifNext){
         $(".talentPool").append("<div class='loading'></div>");
         ifNext = 0;
         page += 1;
         getMore(page);
         }
         }
         });*/
        function getMore(page) {
            $.ajax({
                type: "get",
                url: "/api/talentPool/list",
                dataType: "json",
                data: {
                    page: page
                },
                success: function (data) {
                    if (data.status == 10000) {
                        $(".loading").remove();
                        var resumes = data.data.resumes;
                        var len = resumes.length;
                        if (len > 0) {
                            ifNext = (len == 10) ? 1 : 0;
                            for (var i = 0; i < len; i++) {
                                var rid = resumes[i].rid;
                                var uid = resumes[i].user_id;
                                var version = resumes[i].version;
                                var avatar = resumes[i].avatar;
                                var sex = resumes[i].male ? "male" : "female";
                                var name = resumes[i].name;
                                var education_detail = JSON.parse(resumes[i].education_detail);
                                var school = education_detail[0].school;
                                var major = education_detail[0].major;
                                var stage = education_detail[0].stage;
                                var intern_expect = JSON.parse(resumes[i].intern_expect);
                                var hope_job = intern_expect.position;
                                var hope_city = intern_expect.city;
                                var hope_payment = intern_expect.payment == "不限" ? intern_expect.payment : intern_expect.payment + "/天";
                                var hope_days = intern_expect.days;
                                var self_state = "我暂时无法实习";
                                switch (parseInt(resumes[i].work_state)) {
                                    case 0:
                                        self_state = "我在学校，可实习";
                                        break;
                                    case 1:
                                        self_state = "我在实习，想换份实习";
                                        break;
                                    case 2:
                                        self_state = "我在公司所在城市，可来实习";
                                        break;
                                    case 3:
                                        self_state = "我暂时无法实习";
                                        break;
                                }
                                var self_desc = $.trim(resumes[i].self_desc.replace(/(<[^>]*>)/g, ''));
                                self_desc = self_desc.length > 30 ? self_desc.substr(0, 30) + "..." : self_desc;
                                var typeClass = (i % 2) > 0 ? "even" : "odd";
                                var id = (page - 1) * 10 + i;
                                var backgroundImg = avatar ? "background-image:url(" + avatar + ")" : "";
                                var invite_tag = resumes[i].employer_user_id ? "<span class='invite-tag'></span>" : "";
                                var newResume = "<div class='talent-info talent-info-hr talent-info-" + id + "'>\
                                                " + invite_tag + "\
                                                <div class='info-content clearfix'>\
                                                    <div class='info-l'>\
                                                        <div class='avatar " + sex + "' style='" + backgroundImg + "'></div>\
                                                        <h3 class='name'></h3>\
                                                        <p class='school'></p>\
                                                        <p class='clearfix edu-detail'><span class='major ellipsis'></span><span class='ellipsis'>-</span><span class='stage ellipsis'></span></p>\
                                                    </div>\
                                                    <div class='info-r'>\
                                                        <p class='info-line clearfix'>\
                                                            <span class='title'>期待职位&nbsp;:&nbsp;</span>\
                                                            <span class='hope-position ellipsis'></span><span>-</span><span class='hope-city ellipsis'></span>\
                                                        </p>\
                                                        <p class='info-line clearfix'>\
                                                            <span class='title'>实习薪资&nbsp;:&nbsp;</span>\
                                                            <span class='hope-payment'></span>\
                                                        </p>\
                                                        <p class='info-line clearfix'>\
                                                            <span class='title'>实习时间&nbsp;:&nbsp;</span>\
                                                            <span class='hope-days'></span>\
                                                        </p>\
                                                        <p class='info-line clearfix'>\
                                                            <span class='title'>求职状态&nbsp;:&nbsp;</span>\
                                                            <span class='self-state'></span>\
                                                        </p>\
                                                        <p class='info-line clearfix'>\
                                                            <span class='title'>自我评价&nbsp;:&nbsp;</span>\
                                                            <em class='self-desc'>这家伙很懒，什么都没有写...</em>\
                                                        </p>\
                                                        <div class='btn-area'>\
                                                            <a href='/talentPool/detail/" + uid + "' target='_blank' class='btn btn-more'>查看详情</a>\
                                                            <span class='btn btn-invite' data-rid=" + rid + " data-version=" + version + "><i></i>邀请</span>\
                                                        </div>\
                                                    </div>\
                                                </div>\
                                            </div>";
                                if (typeClass == "even") {
                                    $(".list-right").append(newResume);
                                } else {
                                    $(".list-left").append(newResume);
                                }
                                var _tag = $(".talent-info-" + id);
                                _tag.find(".name").text(name);
                                _tag.find(".school").text(school);
                                _tag.find(".major").text(major);
                                _tag.find(".stage").text(stage);
                                _tag.find(".hope-position").text(hope_job);
                                _tag.find(".hope-city").text(hope_city);
                                _tag.find(".hope-payment").text(hope_payment);
                                _tag.find(".hope-days").text(hope_days);
                                _tag.find(".self-state").text(self_state);
                                if (self_desc) {
                                    _tag.find(".self-desc").text(self_desc);
                                }
                            }
                        } else {
                            ifNext = 0;
                            if (page == 1) {
                                $(".empty-area").show();
                            }
                        }
                    }
                }
            });
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