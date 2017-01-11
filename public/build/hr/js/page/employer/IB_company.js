require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        },
        'js/plugin/IB_jquery.cookie': {
            deps:['js/lib/IB_jquery'],
            exports: 'cookie'
        },
        'js/lib/IB_plupload.full':{
            exports:'plupload'
        }
    }
});

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie', 'js/common/IB_fileUpLoad','js/common/IB_city','js/common/IB_map','js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_ueditor','js/lib/IB_jweixin','js/lib/IB_wxAuth','js/common/IB_input_limit'], function ($, cookie, fileUpload,cities,mapUtil,FastClick,fn,ueUtil,wx,wxAuth) {
    var companyUtil = {
      update:function(option,callback){
          $.ajax({
              type: "post",
              url: "/api/c/update",
              dataType: "json",
              data: {
                  option:option
              },
              success: function (data) {
                  callback(data);
              },
              error :function(){

              }
          });
      }
    };
    $(function () {
        var can_request = true;
        fn.selectorBind();
        var forward = encodeURIComponent(window.location.href);
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        //实例化编辑器
        var ue = ueUtil.getEditor("intro", 300, 1000);

        //如果实习职位为空
        if(!$(".intern_item").length>0) {
            $(".campus_li").addClass("cur").append('<span class="icon-sel-up"></span>');
            $(".campus_item").show();
        }

        /*编辑事件绑定*/
        $(document).on("click", ".btn-company-edit", function () {
            var showState = $(this).parent();
            var editState = $(showState).next();
            if ($(this).hasClass("btn-location-add")) {
                if (address_list.length == 5) {
                    alert("每个公司最多可添加5个地址");
                    return;
                } else {
                    $(".location-area .btn-save").data("type", "add");
                    $("#suggest-input").val("").removeAttr("data-city");
                    mapUtil.locationAnalyze(map_2, "");
                    $(".location-area .delete").hide();
                    $(".edit-state .location-title-icon").text(address_list.length + 1);

                }
            }
            $(showState).hide();
            $(editState).show();
        });
        $(document).on("click", ".btn-company-console", function () {
            var editState = $(this).parent();
            var showState = $(editState).prev();
            $(editState).find(".input-tips").remove();
            $(showState).show();
            $(editState).hide();
        });
        //取消编辑事件绑定
        $(document).on("click", ".btn-console", function () {
            var editArea = $(this).parent().parent();
            $(editArea).prev().show();
            $(editArea).hide();
        });


        //加载地图
        var map = mapUtil.mapInit("location");
        var location_arr = $(".location-detail");
        var location = $(location_arr).eq(0).find(".location-desc").text().trim();
        mapUtil.locationAnalyze(map, location);

        var map_2 = mapUtil.mapInit("location-edit");
        mapUtil.locationAnalyze(map_2, "");
        mapUtil.getSuggest("suggest-input", map_2);


        var address_list = [];
        if ($(".location-detail").length >= 5) {
            $(".btn-location-add").hide();
        }
        for (var i = 0, len = $(".location-detail").length; i < len; i++) {
            var obj = {};
            obj.id = parseInt($(".location-detail").eq(i).find(".btn-edit").attr("data-id"));
            obj.city = $(".location-detail").eq(i).find(".btn-edit").attr("data-city");
            obj.desc = $(".location-detail").eq(i).find(".btn-edit").attr("data-desc");
            address_list.push(obj);
        }
        $(document).on("click", ".location-desc", function () {
            var location_new = $(this).text().trim();
            if (location == location_new) {
                return false;
            } else {
                location = location_new;
                mapUtil.locationAnalyze(map, location);
            }
        });
        /*公司地址编辑*/
        $(document).on("click", ".location-detail .btn-edit", function () {
            $(".location-area .btn-save").data("type", "edit");
            var num = $(this).prevAll(".location-title-icon").text();

            var id = $(this).attr("data-id");
            $(".edit-state .location-title-icon").text(num);
            if (address_list.length > 1) {
                $(".location-area .delete").show().attr("data-id", id);
            } else {
                $(".location-area .delete").hide();
            }
            var desc = $(this).attr("data-desc");
            var city = $(this).attr("data-city");
            $("#suggest-input").val(desc);
            $("#suggest-input").attr("data-city", city);
            mapUtil.locationAnalyze(map_2, desc);

            $(".location-area .btn-save").attr("data-id", id);
            $(".show-state-location").hide();
            $(".edit-state-location").show();
        });
        //添加与修改
        $(".location-area .btn-save").click(function () {
            var $this = $(this);
            var text = $this.text();
            if ($(this).data("type") == "add") {
                var objAddr = {};
                if ($("#suggest-input").val().trim() == "") {
                    $("#suggest-input").nextAll(".input-tips").remove();
                    $("#suggest-input").after("<span class='input-tips'>请输入公司位置</span>");
                } else {
                    if (can_request) {
                        var n = address_list.length;
                        objAddr.id = n >= 1 ? address_list[n - 1].id + 1 : 1;
                        /* objAddr.city = $("#suggest-input").attr("data-city")?$("#suggest-input").attr("data-city"):getCity("suggest-input");*/
                        var mapGeo = new BMap.Geocoder();
                        mapGeo.getPoint($("#suggest-input").val().trim(), function (point) {
                            if (point) {
                                mapGeo.getLocation(point, function (rs) {
                                    var addComp = rs.addressComponents;
                                    objAddr.city = addComp.city + " , " + addComp.district;
                                    objAddr.desc = $("#suggest-input").val().trim();
                                    address_list.push(objAddr);
                                    var address = JSON.stringify(address_list);
                                    can_request = false;
                                    $this.text("保存中...");
                                    companyUtil.update({
                                        address: address
                                    },function(data){
                                        can_request = true;
                                        $this.text(text);
                                        if (data.status == 10000) {
                                            var newLocation = "<li class='location-detail' data-id=" + objAddr.id + ">" +
                                                "<p class='location-title'>" +
                                                /*"<em class='location-title-icon fl'>" + address_list.length + "</em>" +*/
                                                "<span class='icon-locate2'></span>"+
                                                "<span class='location-city'>" + objAddr.city + "</span>" +
                                                "<span class='btn-edit' data-id=" + objAddr.id + " data-desc='" + $("#suggest-input").val().trim() + "' data-city='" + objAddr.city + "'>编辑</span>" +
                                                "</p>" +
                                                "<p class='location-desc'>" +
                                                "</p>" +
                                                "</li>";
                                            $(".location-list").append(newLocation);
                                            $(".location-detail[data-id=" + objAddr.id + "]").find(".location-desc").text(objAddr.desc);
                                            $(".location-total").text(address_list.length);
                                            if (address_list.length >= 5) {
                                                $(".btn-location-add").hide();
                                            }
                                            if (address_list.length == 1) {
                                                mapUtil.locationAnalyze(map, address_list[0].desc);
                                            }
                                            $("#suggest-input").val("");
                                            $(".edit-state-location").hide();
                                            $(".show-state-location").show();
                                        } else if (data.status == 10004) {
                                            window.location.href = account_host+"/login?forward=" + forward;
                                        }
                                    });
                                });
                            } else {
                                $("#suggest-input").nextAll(".input-tips").remove();
                                $("#suggest-input").after("<span class='input-tips'>请输入有效的内地址</span>");
                            }
                        });
                    }
                }
            } else if ($(this).data("type") == "edit") {
                var id = parseInt($(this).attr("data-id"));
                if (can_request) {
                    for (n in address_list) {
                        if (id == address_list[n].id) {
                            address_list[n].city = $("#suggest-input").attr("data-city");
                            address_list[n].desc = $("#suggest-input").val().trim();
                            break;
                        }
                    }
                    var address = JSON.stringify(address_list);
                    can_request = false;
                    $this.text("保存中...");
                    companyUtil.update({
                        address: address
                    },function(data){
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            var newAddr =
                                "<p class='location-title clearfix'>" +
                                "<em class='location-title-icon fl'>" + $(".edit-state-location .location-title-icon").text().trim() + "</em>" +
                                "<span class='location-city fl'>" + $("#suggest-input").attr("data-city") + "</span>" +
                                "<span class='fr btn-edit' data-id=" + id + " data-desc='" + $("#suggest-input").val().trim() + "' data-city='" + $("#suggest-input").attr("data-city") + "'>编辑</span>" +
                                " </p>" +
                                "<p class='location-desc'>" +
                                " </p>";
                            $(".location-detail[data-id=" + id + "]").html(newAddr);
                            $(".location-detail[data-id=" + id + "]").find(".location-desc").text($("#suggest-input").val().trim());
                            if (address_list.length == 1) {
                                mapUtil.locationAnalyze(map, address_list[0].desc);
                            }
                            $(".show-state-location").show();
                            $(".edit-state-location").hide();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }

            }
        });
        //删除
        $(".location-area .delete").click(function () {
            var $this = $(this);
            var text = $this.text();
            var id = parseInt($(this).attr("data-id"));
            for (n in address_list) {
                if (id == address_list[n].id) {
                    address_list.splice(n, 1);
                    break;
                }
            }
            var address = JSON.stringify(address_list);
            if (can_request) {
                can_request = false;
                $this.text("删除中...");
                companyUtil.update({
                    address: address
                },function(data){
                    can_request = true;
                    $this.text(text);
                    if (data.status == 10000) {
                        var other_detail = $(".location-detail[data-id=" + id + "]").nextAll(".location-detail");
                        $(".location-detail[data-id=" + id + "]").remove();
                        $(other_detail).each(function () {
                            $(this).find(".location-title-icon").text(parseInt($(this).text()) - 1);
                        });
                        var total = parseInt($(".location-total").text()) - 1;
                        $(".location-total").text(total);
                        $(".btn-location-add").show();
                        $(".show-state-location").show();
                        $(".edit-state-location").hide();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });

        $("#suggest-input").focus(function () {
            $(this).nextAll(".input-tips").remove();
        });
        $("#suggest-input").blur(function () {
            if ($(this).val() == "") {
                $(this).nextAll(".input-tips").remove();
                $(this).after("<span class='input-tips'>请输入公司位置</span>");
            }
        });
        var desc = "";
        $(document).on("click", ".bnt-edit-location", function () {
            var desc = "";
            $(".show-state-location").hide();
            $(".edit-state-location").show();
        });
        $(".locations .console").click(function () {
            $(".edit-state-location .input-tips").remove();
            $("#suggest-input").val("");
            $(".edit-state-location").hide();
            $(".show-state-location").show();
        });

        //公司标题修改
        $(".edit-state-title .btn-save").click(function () {
            var $this = $(this);
            var text = $this.text();
            var comName = $(".edit-state .company-name input").val().trim();
            var comTitle = $(".edit-state .company-idea input").val().trim();
            $(".edit-state .company-name input").focus(function () {
                $(this).nextAll(".input-tips").remove();
            });
            if (!comName) {
                $(".edit-state .company-name input").nextAll(".input-tips").remove();
                $(".edit-state .company-name input").after("<span class='input-tips' style='display:inline-block; margin-left: 15px;'>必填</span>");
            } else if (can_request) {
                can_request = false;
                $this.text("保存中...");
                companyUtil.update({
                    name: comName,
                    title: comTitle
                },function(data){
                    can_request = true;
                    $this.text(text);
                    if (data.status == 10000) {
                        $(".show-state .company-name").text(comName.length > 20 ? comName.substr(0, 20) + "..." : comName).attr("title", comName);
                        $(".show-state .company-idea").text(comTitle);
                        $(".edit-state-title").hide();
                        $(".show-state-title").show();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        var uid = global.uid ||"";
        fileUpload(uid, "logo", function (error, logo) {
            if (!error && logo != "undefined") {
                $(".edit-state .company-logo .loading").remove();
                companyUtil.update({
                    avatar: logo
                },function (data) {
                    if (data.status == 10000) {
                        $(".company-logo").css({"background-image": "url('" + logo + "')"});
                    }
                });
            }
        }, function () {
            $(".edit-state .company-logo").append("<div class='loading'></div>");
        });

        //公司介绍修改
        $(".city-wrap").citySelector({
            isProvince: false
        });
        $(".edit-state-intro .btn-save").click(function () {
            var $this = $(this);
            var text = $this.text();
            var intro = ueUtil.getPlainContent(ue.getContent());
            if(intro =="") {
                if(!$(".company-detail .btn-save-area").find(".input-tips").length>0) {
                    $(".company-detail .btn-save-area").append("<span class='input-tips'><span class='icon-prompt'></span>公司介绍不能为空!</span>");
                    setTimeout(function () {
                        $(".company-detail .btn-save-area").find(".input-tips").remove();
                    }, 1500);
                }
            } else if (can_request) {
                can_request = false;
                $this.text("保存中...");
                companyUtil.update({
                    introduction: intro
                },function (data) {
                    can_request = true;
                    $this.text(text);
                    if (data.status == 10000) {
                        $(".show-state-intro .company-intro").html(intro);
                        $(".show-state-intro").show();
                        $(".edit-state-intro").hide();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });

        //公司基本信息修改
        $(".edit-state-info .btn-save").click(function () {
            var $this = $(this);
            var text = $this.text();
            if (can_request) {
                var type = $(".edit-state-info .company-type").val();
                var type_id = $(".edit-state-info .company-type").attr("data-type-id");
                var city = $(".edit-state-info .company-city").val();
                var city_id = $(".edit-state-info .company-city").attr("data-cid");
                var scale_type = 1;
                switch ($(".edit-state-info .company-scale").val()) {
                    case "15人以下":
                        scale_type = 1;
                        break;
                    case "15-50人":
                        scale_type = 2;
                        break;
                    case "50-150人":
                        scale_type = 3;
                        break;
                    case "150-500人":
                        scale_type = 4;
                        break;
                    case "500-2000人":
                        scale_type = 5;
                        break;
                    case "2000-5000人":
                        scale_type = 6;
                        break;
                    case "5000人以上":
                        scale_type = 7;
                        break;
                }
                var trade_type = 1;
                switch ($(".edit-state-info .company-trade-type").val()) {
                    case "国企":
                        trade_type = 1;
                        break;
                    case "私企":
                        trade_type = 2;
                        break;
                    case "外企":
                        trade_type = 3;
                        break;
                    case "合资企业":
                        trade_type = 4;
                        break;
                    case "其它":
                        trade_type = 5;
                        break;
                }
                var homepage = $(".edit-state-info .company-page").val();
                can_request = false;
                $this.text("保存中...");
                companyUtil.update({
                    type: type,
                    type_id: type_id,
                    city: city,
                    city_id: city_id,
                    trade_type: trade_type,
                    scale_type: scale_type,
                    homepage: homepage
                },function (data) {
                    can_request = true;
                    $this.text(text);
                    if (data.status == 10000) {
                        $(".company-type").text(type);
                        $(".company-city").text(city);
                        $(".company-trade-type").text($(".edit-state-info .company-trade-type").val());
                        $(".company-scale").text($(".edit-state-info .company-scale").val());
                        if (homepage.indexOf("http:") > -1 || homepage.indexOf("https:") > -1) {
                            var page = homepage.length > 18 ? homepage.substr(0, 18) + "..." : homepage;
                            $(".company-page a").text(page).attr({"href": homepage});
                        } else {
                            var page = homepage.length > 18 ? homepage.substr(0, 18) + "..." : homepage;
                            $(".company-page a").text(page).attr({"href": "http://" + homepage});
                        }
                        $(".edit-state-info").hide();
                        $(".show-state-info").show();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }

        });


        //公司标签管理
        $(".label-suggest .company-label").each(function () {
            var _label = $(this);
            $(".show-state .label-area .company-label").each(function () {
                if ($.trim($(this).text()) == $.trim(_label.text())) {
                    _label.remove();
                }
            });
        });
        $(".edit-state-label .btn-labeling").click(function () {
            var $this = $(this);
            var text = $this.text();
            var newTag = $(".new-label").val();
            if (newTag.length > 5) {
                newTag = newTag.substr(0, 5);
            }
            if (newTag != "") {
                if (can_request) {
                    var tag = "";
                    var num = 0;
                    $(".show-state .label-area .company-label").each(function () {
                        tag += $(this).text() + ",";
                        num += 1;
                    });
                    tag += newTag;
                    num += 1;
                    if (num <= 10) {
                        can_request = false;
                        companyUtil.update( {
                            tag: tag
                        },function(data){
                            can_request = true;
                            if (data.status == 10000) {
                                $(".show-state .label-area").append("<span class='company-label'>" + newTag + "</span>");
                                $(".edit-state .label-labeled").append("<span class='company-label'>" + newTag + "<i class='tag-delete btn'>x</i></span>");
                                $(".btn").data("click", true);
                                $(".label-count").text("(" + num + "/10)");
                                $(".new-label").val("");
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        });
                    } else {
                        alert("最多可添加10个公司标签");
                    }
                }
            }
        });
        $(document).on("click", ".label-suggest .company-label", function () {
            var _tag = $(this);
            if (can_request) {
                var newTag = $.trim(_tag.text());
                var tag = "";
                var num = 0;
                $(".show-state .label-area .company-label").each(function () {
                    tag += $(this).text() + ",";
                    num += 1;
                });
                tag += newTag;
                num += 1;
                if (num <= 10) {
                    can_request = false;
                    companyUtil.update({
                        tag: tag
                    },function (data) {
                        can_request = true;
                        if (data.status == 10000) {
                            $(_tag).remove();
                            $(".show-state .label-area").append("<span class='company-label'>" + newTag + "</span>");
                            $(".edit-state .label-labeled").append("<span class='company-label'>" + newTag + "<i class='tag-delete btn'>x</i></span>");
                            $(".label-count").text("(" + num + "/10)");
                            $(".new-label").val("");
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                } else {
                    alert("最多可添加10个公司标签");
                }
            }
        });
        $(document).on("click", ".tag-delete", function () {
            var obj_delTag = $(this).parent();
            var obj_delTag2;//show_state需要删除的标签
            var delTag = $.trim($(obj_delTag).text());
            var tag = "";
            var num = 0;
            $(".show-state .label-area .company-label").each(function () {
                if ($.trim($(this).text()) + "x" != delTag) {
                    tag += $.trim($(this).text()) + ",";
                    num += 1;
                } else {
                    obj_delTag2 = $(this);
                    num += 1;
                }
            });
            if (can_request) {
                can_request = false;
                companyUtil.update({
                    tag: tag
                },function (data) {
                    can_request = true;
                    if (data.status == 10000) {
                        $(".new-label").val("");
                        $(".label-count").text("(" + (num - 1) + "/10)");
                        $(obj_delTag).remove();
                        $(obj_delTag2).remove();
                        $(".label-suggest").append("<span class='company-label btn'>" + delTag.substr(0, delTag.lastIndexOf('x')) + "</span>");
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
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
            var page, pages, box;
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