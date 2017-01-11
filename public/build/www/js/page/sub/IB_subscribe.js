//我的订阅
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fn','js/common/IB_city','js/common/IB_job_type'], function ($,fn,cities,job_types) {
    $(function(){
        var forward = encodeURIComponent(window.location.href);
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        //分页绑定
        fn.pagingBind();
        //职位列表
        getTypeList();
        //城市选择
        $(".city-wrap").citySelector({
            isProvince: false
        });
        //点击事件
        $(".input-text").click(function (e) {
            if(!$(".province").hasClass("no-province")) {
                $(".selector-city").find(".province-list").append("<li class='province no-province' data-pid='' data-name='不限'>不限</li>");
                $(".selector-city").append("<ul class='city-list no-city-list fl ' data-pid='' data-name='不限'> <li class='clearfix'><span class='city fl' data-cid='0' data-name='不限'>不限</span></li></ul>");
            }

            if(!$(this).hasClass("cur")) {
                $(this).addClass("cur");
                if($(this).parent().next().hasClass("selector-city")) {
                    $(this).parent().next().show();
                } else {
                    $(this).parent().find(".selector").show();
                }
                $(this).parent().find(".icon-down-arrow").remove();
                $(this).parent().append('<span class="icon-up-arrow"></span>');
            } else {
                $(this).removeClass("cur");
                if($(this).parent().next().hasClass("selector-city")) {
                    $(this).parent().next().hide();
                } else {
                    $(this).parent().find(".selector").hide();
                }
                $(this).parent().find(".icon-up-arrow").remove();
                $(this).parent().append('<span class="icon-down-arrow"></span>');
            }
            e.stopPropagation();
        });

        $(document).on("click",".no-province",function(){
            //$(".no-city-list").addClass("curr");
        });

        //职位类型左侧切换卡
        $(".selector-jt .jt-1st").click(function (e) {
            $(".jt-1st").removeClass("curr");
            $(this).addClass("curr");
            var i = $(this).index();
            $(".sub-box .type-detail").removeClass("curr").hide();
            $(".sub-box .type-detail").eq(i).addClass("curr").show();
            e.stopPropagation();
        });
        //选择类型
        $(".job-name").click(function () {
            var jn = $(this).attr("data-name");
            var jt = $(this).attr("data-type");//type
            var jid = $(this).attr("data-id");//id
            $(".input-type").val(jn).attr("data-id", jid);
            $(".selector-jt").hide();
            $(this).parents(".sub-item-input").find(".icon-up-arrow").remove();
            $(this).parents(".sub-item-input").find(".input-text").removeClass("cur");
            $(this).parents(".sub-item-input").append("<span class='icon-down-arrow'></span>");
        });

        //切换选择城市
        $(document).on("click",".city-list .city",function () {
            $(this).parents(".selector-city").prev().find(".input-city").removeClass(" cur selected");
            $(this).parents(".selector-city").prev().find(".icon-up-arrow").remove();
            $(this).parents(".selector-city").prev().append("<span class='icon-down-arrow'></span>");
        });

        //实习时间 学历要求
        $(".selector-days li, .selector-education li, .selector-payment-min li").click(function (e) {
            var text = $(this).text();
            var dataId = $(this).attr("data-id");
            $(this).parent().hide();
            $(this).parents(".sub-item-input").find(".icon-up-arrow").remove();
            $(this).parents(".sub-item-input").find(".input-text").val(text).attr("data-id",dataId).removeClass("cur");
            $(this).parents(".sub-item-input").append("<span class='icon-down-arrow'></span>");

            e.stopPropagation();
        });

        //选择发送周期
        $(".send-cycle").click(function () {
           if(!$(this).hasClass("cur")) {
               $(".send-cycle").removeClass("cur");
               $(this).addClass("cur");
           } else {
               return;
           }
        });

        //完成订阅
        $(".save-btn").click(function () {
            var $this = $(this);
            var key =  $.trim($(".input-type").val());   //关键字
            var key_id = parseInt($.trim($(".input-type").attr("data-id")));  //关键字ID
            var min_payment = $.trim($(".input-payment-min").val());//最低日薪
            var min_payment_id = parseInt($.trim($(".input-payment-min").attr("data-id")));//最低日薪 ID
            var city = $.trim($(".input-city").val());    //实习城市
            var city_id = parseInt($.trim($(".input-city").attr("data-cid")));  //城市ID
            var workdays = $.trim($(".input-time").val());   //实习天数
            var workdays_id =  parseInt($.trim($(".input-time").attr("data-id")));  //实习天数 ID
            var education = $.trim($(".input-education").val());  //教育经历
            var education_id = parseInt($.trim($(".input-education").attr("data-id")));  //教育经历 ID
            var noError =  isInputNull(key, min_payment,city,workdays,education );
            //验证通过
            if(noError) {
                $.ajax({
                    type: "post",
                    url: "/api/sub/setting",
                    dataType: "json",
                    data: {
                        option: {
                            key:key,
                            key_id: key_id,
                            min_payment:min_payment_id,
                            city:city,
                            city_id:city_id,
                            workdays:workdays_id,
                            education:education_id
                        }
                    },
                    success: function (data) {
                        $this.text("订阅中...");
                        if(data.status == 10000 ) {
                            location.href = '/sub/list';
                           // $(".input-type, .input-payment-min, .input-city, .input-time, .input-education").val("");
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        } else {
                           alert("参数错误!");
                        }
                    }
                })
            }
        });

    });

    function isInputNull(key, min_payment,city,workdays,education ) {
        var flag = true;
        if(key == "") {
            $(".input-type").parent().append("<span class='input-error'><span class='icon-prompt'></span>职位类别不能为空!</span>");
            flag = false;
        }
        /*if(min_payment == 0 || max_payment == 0 ) {
            $(".input-payment-min").parent().append("<span class='input-error'><span class='icon-prompt'></span>最低薪资/最高薪资不能为空!</span>");
            flag = false;
        }else if(min_payment > max_payment) {
            $(".input-payment-min").parent().append("<span class='input-error'><span class='icon-prompt'></span>最高日薪不能小于最低日薪!</span>");
            flag = false;
        }else if( max_payment/min_payment >2 ) {
            $(".input-payment-min").parent().append("<span class='input-error'><span class='icon-prompt'></span>最高日薪不能大于最低日薪的二倍!</span>");
            flag = false;
        }else if (min_payment > 1000 || max_payment > 1000 ) {
            $(".input-payment-min").parent().append("<span class='input-error'><span class='icon-prompt'></span>日薪不能超过1000!</span>");
            flag = false;
        }*/
        if(min_payment == "") {
            $(".input-payment-min").parent().append("<span class='input-error'><span class='icon-prompt'></span>最低日薪不能为空!</span>");
            flag = false;
        }
        if(city == "") {
            $(".input-city").parent().append("<span class='input-error'><span class='icon-prompt'></span>实习城市不能为空!</span>");
            flag = false;
        }
        if(workdays == "") {
            $(".input-time").parent().append("<span class='input-error'><span class='icon-prompt'></span>实习不能不能为空!</span>");
            flag = false;
        }
        if(education == "") {
            $(".input-education").parent().append("<span class='input-error'><span class='icon-prompt'></span>学历要求不能为空!</span>");
            flag = false;
        }
        if($(".input-error").length>0) {
            setTimeout(function(){
                $(".input-error").remove();
            },1500);
        }
        return flag;
    }

    $("[data-type='int']").on("keyup",function(){
        $(this).val($(this).val().replace(/\D+/g,''));
    });

    $(document).click(function (e) {
        if($(".icon-up-arrow").length>0) {
            $(".icon-up-arrow").parent().find(".input-text").removeClass("cur");
            $(".icon-up-arrow").parent().append("<span class='icon-down-arrow'></span>");
            $(".icon-up-arrow").parent().find(".icon-up-arrow").remove();
            $(".selector, .selector-city").hide();
        }
        var event = e || window.event;
        event.stopPropagation();
    });

    function isEmptyObject(e) {
        var t;
        for (t in e)
            return !1;
        return !0
    }

    //加载职位列表
    function getTypeList() {
        var sub_box = "";
        for (var i = 0, len = job_types.length; i < len; i++) {
            var sub_list;
            if (i == 0) {
                sub_list = "<div class='type-detail curr' data-class='" + job_types[i].parent_type_name + "'>";
            } else {
                sub_list = "<div class='type-detail' data-class='" + job_types[i].parent_type_name + "'>";
            }
            var sub_types = job_types[i].sub_types;
            for (var j = 0, sub_len = sub_types.length; j < sub_len; j++) {
                var group = sub_types[j].group_values;
                var id = sub_types[j].group_id;
                var group_list = "<dl class='clearfix'> <dt class='stage2rd-title job-type fl' data-parent-type=" + job_types[i].parent_type_name + " data-parent-type-id=" + job_types[i].parent_type_id + " data-id=" + id + " data-type='" + sub_types[j].group_name + "'>" + sub_types[j].group_name + "</dt><dd class='fl'>";
                for (var k = 0, group_len = group.length; k < group_len; k++) {
                    group_list += "<a class='job-name' data-name='" + group[k].sub_type_name + "'data-parent-type=" + job_types[i].parent_type_name + " data-parent-type-id=" + job_types[i].parent_type_id + " data-id=" + id + " data-type='" + sub_types[j].group_name + "'>" + group[k].sub_type_name + "</a>";
                }
                group_list += "</dd></dl>";
                sub_list += group_list;
            }
            sub_list += "</div>";
            sub_box += sub_list;
        }
        $(".sub-box").html(sub_box);
        return sub_box;
    }

});