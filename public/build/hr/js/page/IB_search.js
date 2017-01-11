//公司搜索及职位搜索
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        }
    }
});

require(['js/lib/IB_jquery','js/lib/jquery-ui/widgets/IB_autocomplete', 'js/lib/IB_fastclick', 'js/common/IB_fn','js/common/IB_job_type'], function ($, autocomplete, FastClick, fn, job_types) {
    $(function () {
        $(".active .btn-more").hover(function () {
            $(this).parent().nextAll(".more").show();
        });
        $(document).on("mouseleave", ".more", function () {
            $(this).hide();
        });

        //分页绑定
        fn.pagingBind();

        getTypeList();
        /*职位搜索*/

        //根据关键字检索
        var k = fn.getUrlPara("k");//关键词
        $("#searchInput").autocomplete({source: []});
        var showSearchSuggest = function () {
            var key = encodeURIComponent($("#searchInput").val().trim());
            $.ajax({
                type: "get",
                url: "/j/search/suggest",
                dataType: "json",
                data: {
                    key: key
                },
                success: function (data) {
                    if (data.status == 10000) {
                        if (data.data.length > 0) {
                            $("#searchInput").autocomplete({
                                source: data.data
                            });
                        }
                    }
                }
            });
        };
        fn.inputListener($("#searchInput"), showSearchSuggest);
        $("#searchInput").autocomplete({
            source: [],
            select: function (event, ui) {
                var sKey = "k=" + ui.item.label;
                url = url.replace("k=" + k, sKey).replace("page=" + page, "page=1");
                location.href = url;
            }
        });

        $(".intern-search-box-btn").click(function () {
            var sKey = "k=" + encodeURIComponent($("#searchInput").val().trim());
            url = url.replace("k=" + k, sKey).replace("page=" + page, "page=1");
            location.href = url;
        });
        $("#searchInput").bind('keypress', function (event) {
            if (event.keyCode == "13") {
                var sKey = "k=" + encodeURIComponent($("#searchInput").val().trim());
                url = url.replace("k=" + k, sKey).replace("page=" + page, "page=1");
                location.href = url;
            }
        });

        //职位搜索
        if (location.href.indexOf("/j/search") > -1) {
            var jt = decodeURIComponent(fn.getUrlPara("jt"));//职位类型
            var pt = fn.getUrlPara("pt");//薪水类型
            var cid = decodeURIComponent(fn.getUrlPara("cid"));//工作城市
            var wk = fn.getUrlPara("wk");//每周工作天数
            var et = fn.getUrlPara("et");//学历要求类型
            var page = fn.getUrlPara("page");//页数
            var lt = fn.getUrlPara("lt");//排序类型,hot和time
            var url = "/j/search?lt=" + lt + "&k=" + k + "&jt=" + jt + "&pt=" + pt + "&cid=" + cid + "&wk=" + wk + "&et=" + et + "&page=" + page;


            //根据热度与时间检索
            $(".title-option").click(function () {
                url = url.replace("page=" + page, "page=1");
                if ($(this).hasClass("title-option-new")) {
                    url = url.replace("lt=" + lt, "lt=time");
                    location.href = url;
                } else {
                    url = url.replace("lt=" + lt, "lt=hot");
                    location.href = url;
                }
            });

            if (jt) {
                var type = $(".job-type[data-id=" + jt + "]").attr("data-type");
                if (type) {
                    $(".job-class-area").append("<li class='job-type selected' data-type='" + type + "' data-id='" + jt + "'>" + type + "</li>");
                }
            }

            //根据城市检索
            /*        if(city){
             $(".job-city").each(function(){
             if($(this).data("c") == city){
             $(this).addClass("selected");
             if($(this).parent().hasClass("other")){
             $(".item-city .active").append("<li class='job-city selected' data-c='"+city+"'>"+city+"</li>");
             $(".item-city .hot").append("<li class='job-city selected' data-c='"+city+"'>"+city+"</li>");
             }
             }
             });
             }else{
             $(".job-city").eq(0).addClass("selected");
             }*/
            $(document).on("click", ".job-city", function () {
                var id = "cid=" + $(this).attr("data-cid");
                url = url.replace("cid=" + cid, id).replace("page=" + page, "page=1");
                location.href = url;
            });

            //根据分类检索
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
            $(".job-type").on("click", function () {
                var sJt = "jt=" + $(this).attr("data-id");
                var sKey = "k=";
                url = url.replace("k="+k,sKey).replace("jt="+jt,sJt).replace("page="+page,"page=1");
                // url = url.replace("jt=" + jt, sJt).replace("page=" + page, "page=1");
                location.href = url;
            });
            $(".job-name").on("click", function (e) {
                var event = window.event || e;
                event.stopPropagation();
                var sJt = "jt=" + $(this).attr("data-id");
                var sKey = "k=" + $(this).attr("data-name");
                url = url.replace("k=" + k, sKey).replace("jt=" + jt, sJt).replace("page=" + page, "page=1");
                location.href = url;
            });
            //根据薪资检索
            $(".job-salary").click(function () {
                var sp = "pt=" + $(this).attr("data-s");
                url = url.replace("pt=" + pt, sp).replace("page=" + page, "page=1");
                location.href = url;
            });

            //根据实习天数检索
            $(".job-times").click(function () {
                var sTimes = "wk=" + $(this).attr("data-t");
                url = url.replace("wk=" + wk, sTimes).replace("page=" + page, "page=1");
                location.href = url;
            });

            //根据学历要求检索
            $(".job-edu").click(function () {
                var sEt = "et=" + $(this).attr("data-e");
                url = url.replace("et=" + et, sEt).replace("page=" + page, "page=1");
                location.href = url;
            });
        }
        /*公司搜索*/
        else if (location.href.indexOf("/c/search" > -1)) {
            var ct = decodeURIComponent(fn.getUrlPara("ct"));//公司类型
            var st = decodeURIComponent(fn.getUrlPara("st"));//公司规模
            var cid = decodeURIComponent(fn.getUrlPara("cid"));//公司地址
            var page = fn.getUrlPara("page");
            var url = "/c/search?k=" + k + "&ct=" + ct + "&st=" + st + "&cid=" + cid + "&page=" + page;


            //根据城市检索
            $(document).on("click", ".company-city", function () {
                var id = "cid=" + $(this).attr("data-cid");
                url = url.replace("cid=" + cid, id).replace("page=" + page, "page=1");
                location.href = url;
            });
            //根据公司类型检索
            $(document).on("click", ".company-type", function () {
                var sCt = "ct=" + $(this).attr("data-type-id");
                url = url.replace("ct=" + ct, sCt).replace("page=" + page, "page=1");
                location.href = url;
            });

            //根据公司规模搜索
            $(document).on("click", ".company-scale", function () {
                var sSt = "st=" + $(this).attr("data-scale");
                url = url.replace("st=" + st, sSt).replace("page=" + page, "page=1");
                location.href = url;
            });
        }
    });

    //鼠标离开事件
    /*$(".intern-search-sel").hover(function(e){
        if(!$(this).hasClass("cur")) {
            $(this).addClass("cur");
            $(this).find(".intern-search-prev").remove(".icon-drop-down").append("<span class='.icon-drop-up'></span>");
            $(".intern-search-next").css("display","block");
        } else {
            $(this).removeClass("cur");
            $(".intern-search-next").css("display","none");
        }
    });*/
    $(".intern-search-sel").hover(function(){
        $(".icon-drop-down").remove();
        if(!$(".icon-drop-up").length>0)
         $(this).append("<span class='icon-drop-up'></span>");
        $(".intern-search-next").css("display","block");
    },function () {
        $(".icon-drop-up").remove();
        $(this).append("<span class='icon-drop-down'></span>");
        $(".intern-search-next").css("display","none");
    });

    function getTypeList() {
        var parent_list = "<ul class='job-class-area'><li class='title'>实习分类:</li> <li class='job-type' data-type='' >不限</li>";
        for (var i = 0, len = job_types.length; i < len; i++) {
            parent_list += "<li class='job-class' data-class='" + job_types[i].parent_type_name + "'>" + job_types[i].parent_type_name + "</li>";
        }
        parent_list += "</ul>";
        var sub_list = "<div class='type-detail-area'>";
        var listArr = [];
        for ( i = 0, len = job_types.length; i < len; i++) {
            listArr[i] = "<ul class='type-detail' data-class='" + job_types[i].parent_type_name + "'>";
            for (var j = 0, sub_len = job_types[i].sub_types.length; j < sub_len; j++) {
                var sub = job_types[i].sub_types[j];
                var id = sub.group_id;
                var detail_list = "<li class='stage2rd-title job-type' data-type=" + sub.group_name + " data-id=" + id + "><span class='job-sub-type'>" + sub.group_name + "</span>";
                for (var k = 0, detail_len = sub.group_values.length; k < detail_len; k++) {
                    detail_list += "<span class='job-name' data-name='" + sub.group_values[k].sub_type_name + "' data-id=" + id + ">" + sub.group_values[k].sub_type_name + "</span>";
                }
                detail_list +="</li>";
                listArr[i] += detail_list;
            }
            listArr[i] += "</ul>";
        }
        for (i = 0, len = listArr.length; i < len; i++) {
            sub_list += listArr[i];
        }
        sub_list += "</div>";
        $(".item-job-type").append(sub_list);
        return parent_list + sub_list;
    }
});