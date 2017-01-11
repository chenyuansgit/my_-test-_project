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

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie', 'js/common/IB_map','js/common/IB_city','js/common/IB_job_type','js/common/IB_jobSelector','js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_regex','js/common/IB_ueditor','js/common/IB_input_limit'], function ($, cookie, mapUtil,cities,job_types,jobSelector, FastClick, fn,regex,ueUtil) {
    $(function () {
        var can_request = true;
        fn.popBoxBind();

        var forward = encodeURIComponent(window.location.href);
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        var ue = ueUtil.getEditorPosition("pos-content", 300, 1000);
        ue.ready(function () {
            $(".pos-content-area").show();
        });
        ue.addListener("focus", function () {
            $(".input-error-content").hide();
        });

        //城市选择
        $(".city-wrap").citySelector({
            isProvince: false
        });

        //选项
        $(".selector li").on("click",function(e){
            var event = e || window.event;
            event.stopPropagation();
            var oSelector = $(this).parent();
            var btnSel = $(oSelector).prev(".btn-selector").find("input");
            $(btnSel).css({"color":"#000"});
            if($(this).hasClass("ct")){
                var id = $(this).attr("data-type-id");
                $(btnSel).attr("data-type-id",id);
            }

            //切换下拉箭头
            $(this).parents(".selector").prev().removeClass("cur").append("<span class='icon-down-arrow'></span>");
            $(this).parents(".selector").prev().find(".icon-up-arrow").remove();

            $(btnSel).val($(this).text());
            $(oSelector).hide();
        });

        //切换选择城市
        $(document).on("click",".city-list .city",function () {
            $(this).parents(".selector-city").prev().removeClass("cur").append("<span class='icon-down-arrow'></span>");
            $(this).parents(".selector-city").prev().find(".icon-up-arrow").remove();
        });
        $(".pos-type").jobSelector({
            jobNameInput : $(".pos-name")
        });

        $(document).click(function (e) {
            if($(".icon-up-arrow").length>0) {
                $(".icon-up-arrow").parent().removeClass("cur").append("<span class='icon-down-arrow'></span>");
                $(".icon-up-arrow").parent().next().hide();
                $(".icon-up-arrow").parent().find(".icon-up-arrow").remove();
            }
            var event = e || window.event;
            event.stopPropagation();
        });


        try {
            var jid = global.jid;
        } catch (e) {
            var jid = 0;
        }

        var url = "";
        if (jid) {
            url = "/api/jobs/update/" + jid;
        } else {
            url = "/api/jobs/add";
        }

        //实习与包打听判断
        $("#xz-det").click(function () {
            if($(this).hasClass("cur"))
                return;
            else {
                $("#sx-det").removeClass("cur");
                $(this).addClass("cur");
                $(".sel-payment,.tip-my").show();
                $(".is-check-time, .jobs-chance, .input-error").hide();
                $(".payment-type").text("年薪范围");
                $(".unit-payment").text("万元/年");
                $(".pos-time-request").val("校招");
            }
        });
        $("#sx-det").click(function () {
            if($(this).hasClass("cur"))
                return;
            else {
                $("#xz-det").removeClass("cur");
                $(this).addClass("cur");
                $(".sel-payment,.tip-my, .input-error").hide();
                $(".is-check-time, .jobs-chance").show();
                $(".payment-type").text("日薪范围");
                $(".unit-payment").text("元/天");
                $(".pos-time-request").val("");
            }
        });

        //添加下拉样式
        $(".pos-drop-down").click(function (e) {
            var $this = $(this);
            if(!$this.hasClass("cur")) {
                $this.find(".icon-down-arrow").remove();
                $this.addClass("cur").append("<span class='icon-up-arrow'></span>");
                $this.next(".selector").show();
            } else {
                $(this).find(".icon-up-arrow").remove();
                $(this).removeClass("cur").append("<span class='icon-down-arrow'></span>");
                $this.next().hide();
                $(".selector-jt").hide();
            }
            e.stopPropagation();
        });

        //选择是否提供转正机会
        $(".jobs-chance .btn").click(function () {
            var $this = $(this);
            if(($this).hasClass("cur"))
                return;
            else {
                $(".jobs-chance .btn").removeClass("cur");
                $this.addClass("cur");
                $(".jobs-chance").find(".input-error").hide();
            }
        });

        //地图
        var map = mapUtil.mapInit("map");
        $(".map-preview").click(function () {
            $(".overlay").show();
            $(".popBox-address").show();
            var address = $.trim($(".pos-address").val());
            mapUtil.locationAnalyze(map, address);
        });
        $(".pos-address").click(function (e) {
            var event = e || window.event;
            event.stopPropagation();
            $(".addresses").show();
        });
        $(document).click(function (e) {
            var event = e || window.event;
            event.stopPropagation();
            $(".addresses").hide();
        });
        $(".addresses .address").click(function (e) {
            var event = e || window.event;
            event.stopPropagation();
            var address = $(this).text();
            $(".pos-address").val(address);
            $(".addresses").hide();
        });

        $(document).on("click", ".btn-add-pos", function (){
            var $this = $(this);
            var noError = isInputNull(ue);
            if (noError) {
                var type = $(".pos-type").attr("data-type");//类型
                var type_id = $(".pos-type").attr("data-id");
                var parent_type = $(".pos-type").attr("data-pt");
                var parent_type_id = $(".pos-type").attr("data-pid");
                var name = $.trim($(".pos-name").val());//职位名称
                var city = $.trim($(".pos-city").val());//实习城市
                var city_id = $(".pos-city").attr("data-cid");
                var edu = $.trim($(".pos-education").val());//学历要求
                var address = $.trim($(".pos-address").val());
                var days, regular,channel_type,payment_l, payment_h;
                if($("#xz-det").hasClass("cur")) {
                    days = "";
                    regular = "";
                    channel_type = 3;
                    payment_l = parseInt($.trim($(".pos-payment-l").val())) * 10000;//最低日薪
                    payment_h = parseInt($.trim($(".pos-payment-h").val())) * 10000;//最高日薪
                }else {
                    days = parseInt($.trim($(".pos-time-request").val()).charAt(0));//实习时间
                    regular = parseInt($(".jobs-chance .cur").attr("data-type"));    //是否提供转正机会
                    channel_type = 1;
                    payment_l = parseInt($.trim($(".pos-payment-l").val()));//最低日薪
                    payment_h = parseInt($.trim($(".pos-payment-h").val()));//最高日薪
                }
                var education = 0;
                switch (edu) {
                    case "不限":
                        education = 0;
                        break;
                    case "大专":
                        education = 1;
                        break;
                    case "本科":
                        education = 2;
                        break;
                    case "硕士":
                        education = 3;
                        break;
                    case "博士":
                        education = 4;
                        break;
                }
                var profession = $.trim($(".pos-profession").val());//专业要求
                var recruitment = $.trim($(".pos-recruitment").val());//招聘人数
                var content = ueUtil.getPlainContent(ue.getContent());//实习内容
                var attr = $.trim($(".pos-attr").val());//职位诱惑
                var remarks = JSON.stringify({"attr": attr});
                var deadline = $.trim($(".pos-deadline").val()).toTimeStamp() + 24 * 60 * 60 * 1000 - 1000;
                if (attr.length > 20) {
                    $(".pos-attr").parent().next(".input-error").show();
                } else if(checkPayment(payment_l, payment_h)) {
                    var mapGeo = new BMap.Geocoder();
                    mapGeo.getPoint(address, function (point) {
                        if (point) {
                            if (can_request) {
                                can_request = false;
                                $this.val("发布中...");
                                $.ajax({
                                    type: "post",
                                    url: url,
                                    dataType: "json",
                                    data: {
                                        option: {
                                            type: type,
                                            type_id: type_id,
                                            parent_type_id: parent_type_id,
                                            parent_type: parent_type,
                                            name: name,
                                            address: address,
                                            min_payment: payment_l,
                                            max_payment: payment_h,
                                            workdays: days,
                                            city: city,
                                            city_id: city_id,
                                            education: education,
                                            profession: profession,
                                            recruitment:recruitment,
                                            regular: regular,
                                            remarks: remarks,
                                            channel_type:channel_type,
                                            content: content,
                                            deadline: deadline
                                        }
                                    },
                                    success: function (data) {
                                        can_request = true;
                                        $this.val("发布");
                                        if (data.status == 10000) {
                                            location.href = '/job/list';
                                            $(".pos-type, .pos-name, .pos-city").val("");
                                        } else if (data.status == 10004) {
                                            window.location.href = account_host+"/login?forward=" + forward;
                                        } else if (data.status == 10013) {
                                            $(".overlay").show();
                                            $(".popBox").hide();
                                            $(".popBox-upperLimit").show();
                                        }
                                    }
                                });
                            }
                        } else {
                            alert("请输入详细有效的工作地址");
                        }
                    });
                }
            }
        });
        $(".btn-add-preview").click(function () {
            if (isInputNull(ue)) {
                var obj = {};
                obj.type = $(".pos-type").attr("data-type");//类型
                obj.name = $.trim($(".pos-name").val());//职位名称
                if (name.length > 15) {
                    obj.name = name.substr(0, 16);
                }
                /*obj.payment_l = parseInt($.trim($(".pos-payment-l").val()));//最低日薪
                obj.payment_h = parseInt($.trim($(".pos-payment-h").val()));//最高日薪*/

                if($("#xz-det").hasClass("cur")) {
                    obj.days = "";
                    obj.regular = "";
                    obj.channel_type = 3;
                    obj.payment_l = parseInt($.trim($(".pos-payment-l").val())) * 10000;//最低日薪
                    obj.payment_h = parseInt($.trim($(".pos-payment-h").val())) * 10000;//最高日薪
                }else {
                    obj.days = parseInt($.trim($(".pos-time-request").val()).charAt(0));//实习时间
                    obj.regular = parseInt($(".jobs-chance .cur").attr("data-type"));    //是否提供转正机会
                    obj.channel_type = 1;
                    obj.payment_l = parseInt($.trim($(".pos-payment-l").val()));//最低日薪
                    obj.payment_h = parseInt($.trim($(".pos-payment-h").val()));//最高日薪
                }

               /* obj.days = parseInt($.trim($(".pos-time-request").val()).charAt(0));//实习时间*/
                obj.recruitment = $.trim($(".pos-recruitment").val());//招聘人数
                obj.city = $.trim($(".pos-city").val());//实习城市
                obj.education = $.trim($(".pos-education").val());//学历要求
                obj.profession = $.trim($(".pos-profession").val());//专业要求
                obj.content = ueUtil.getPlainContent(ue.getContent());//实习内容
                obj.attr = $.trim($(".pos-attr").val());//职位诱惑
                obj.deadline = $.trim($(".pos-deadline").val());
                /*obj.regular = parseInt($(".jobs-chance .cur").attr("data-type"));    //是否提供转正机会*/
                if (obj.payment_h / obj.payment_l > 2) {
                    $(".input-error-payment").html("<span class='icon-prompt'></span>最高薪水不能大于最低薪水的二倍").show();
                } else if (obj.payment_h < obj.payment_l) {
                    $(".input-error-payment").html("<span class='icon-prompt'></span>最高薪水不能小于最低薪水").show();
                } else if ((obj.payment_h > 1000 || obj.payment_l > 1000) && $("#sx-det").hasClass("cur")) {
                    $(".input-error-payment").html("<span class='icon-prompt'></span>薪水不能超过1000").show();
                } else if (obj.attr.length > 20) {
                    $(".pos-attr").parent().next(".input-error").show();
                } else {
                    var job = JSON.stringify(obj);
                    fn.storage("job", job);
                    window.open("/job/preview");
                }
                //console.log(job);
            }
        });
    });

    //薪水判断
    function checkPayment(payment_l, payment_h) {
        var flag = true;
        if (payment_h / payment_l > 2) {
            $(".input-error-payment").html("<span class='icon-prompt'></span>最高薪水不能大于最低薪水的二倍").show();
            flag = false;
        } else if (payment_h < payment_l) {
            $(".input-error-payment").html("<span class='icon-prompt'></span>最高薪水不能小于最低薪水").show();
            flag = false;
        } else  if ((payment_h > 1000 || payment_l > 1000) && $("#sx-det").hasClass("cur")) {
            $(".input-error-payment").html("<span class='icon-prompt'></span>日薪不能超过1000").show();
            flag = false;
        }else if((payment_h > 1000000 || payment_l > 1000000) && $("#xz-det").hasClass("cur")) {
            $(".input-error-payment").html("<span class='icon-prompt'></span>包打听最高薪水不能超过100万").show();
            flag = false;
        }
        return flag;
    }

    //职位发布信息不全
    function isInputNull(ue) {
        $(document).on("focus", ".pos-item", function () {
            $(this).parent().nextAll(".input-error").hide();
        });
        var flag = true;
        $(".add-area .pos-item").each(function () {
            if ($.trim($(this).val()) == "") {
                $(this).parent().nextAll(".input-error").eq(0).show();
                flag = false;
            }
            if(!$(".jobs-chance span").hasClass("cur") && $("#sx-det").hasClass("cur")) {
                $(".jobs-chance").find(".input-error").show();
                flag = false;
            }
            //校招
            if((($(".pos-payment-l").val() == "" && $(".pos-payment-h").val() != "") || ($(".pos-payment-h").val() == "" && $(".pos-payment-l").val() != "")) && $("#xz-det").hasClass("cur")) {
                $('.pos-payment').find(".input-error").eq(0).show();
                flag = false;
            }
            //实习
            if((parseInt($.trim($(".pos-payment-l").val())) == 0 || parseInt($.trim($(".pos-payment-h").val())) == 0) && $("#sx-det").hasClass("cur") ) {
                $(".pos-payment").find(".input-error-zero").show();
                flag = false;
            }
        });
        if (!$.trim(ue.getContentTxt())) {
            flag = false;
            $(".input-error-content").html("<span class='icon-prompt'></span>请输入岗位职责，任职要求等，尽量使用短句并分条列出").show();
        } else {
            if (regex.email.exec($.trim(ue.getContentTxt()), "g") || regex.phone.exec($.trim(ue.getContentTxt()), "g") || regex.phone_2.exec($.trim(ue.getContentTxt()), "g")) {
                flag = false;
                $(".input-error-content").html("<span class='icon-prompt'></span>职位描述中请勿输入邮箱、电话等联系方式").show();
            } else {
                $(".input-error-content").hide();
            }
        }
        return flag;
    }

});