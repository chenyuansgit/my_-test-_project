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

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie','js/common/IB_fileUpLoad','js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_date','js/common/IB_city', 'js/common/IB_regex','js/common/IB_jobTypeSelector'], function ($, cookie, fileUpload, FastClick, fn, dateSelector, cities, regex) {
    $(function () {
        var can_request = true;
        selectorBind();
        var forward = encodeURIComponent(window.location.href);
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}

        var mr_info = JSON.parse(fn.storage("mr_info"));
        setInterval(function () {
            fn.storage("mr_info", JSON.stringify(mr_info));
        }, 30 * 1000);

        var uid = global.uid;

        if ($.cookie("create_step") && mr_info && uid == mr_info.uid) {
            $(".step-content-0,.step-content-1,.step-content-2,.step-content-3").hide();
            $(".step-content-" + $.cookie("create_step")).show();
            $("#avatar").removeAttr("id");
            $(".step-content-" + $.cookie("create_step") + " .avatar").attr("id", "avatar");
        }
        //城市选择加载
        $(".address-wrap").citySelector({
            isProvince: true
        });
        $(".hope-city-wrap").citySelector({
            isProvince: false
        });
        //日期选择
        $("#birthday").dateSelector({
            endYear: new Date().getFullYear() - 11,
            startYear: new Date().getFullYear() - 31
        });
        $("#edu-start").dateSelector({
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 12,
            upToToday: false,
            isDouble: true,
            lowerThan: "#edu-end"
        });
        $("#edu-end").dateSelector({
            endYear: new Date().getFullYear() + 10,
            startYear: new Date().getFullYear() - 12,
            upToToday: false,
            isDouble: true,
            higherThan: "#edu-start"
        });
        //职位类别
        $(".position-type").jobTypeSelector({
            default_val:"期待职位类型"
        });

        //加载简历缓存数据
        if (mr_info) {
            if (uid == mr_info.uid) {
                for (var item in mr_info) {
                    if (item == "male") {
                        $(".tab.on").removeClass("on");
                        $(".tab").eq(Math.abs(parseInt(mr_info.male) - 1)).addClass("on");
                    } else if (item == "birthday") {
                        var birthday = new Date(parseInt(mr_info.birthday)).format("yyyy.MM").toString();
                        $(".birthday").val(birthday).addClass("selected");
                    } else if (item == "education_detail") {
                        var edu = mr_info.education_detail[0];
                        for (var item_edu in edu) {
                            try{
                                $("." + item_edu).val(edu[item_edu]).addClass("selected");
                            }catch (e){
                                console.log(e);
                            }

                        }
                    } else if (item == "intern_expect") {
                        var expect = JSON.parse(mr_info.intern_expect);
                        for (var item_exp in expect) {
                            try{
                                $("." + item_exp).val(expect[item_exp]).addClass("selected");
                            }catch (e){
                                console.log(e);
                            }
                        }
                        $(".hope-city").val(expect.city).addClass("selected");
                        $(".hope-city").attr("data-cid", expect.city_id || 0);
                    } else if (item == "avatar") {
                        $(".resume-pic").css({"background-image": "url('" + mr_info.avatar + "')"});
                    } else if(item == "intern_expect_position_type"){
                        var type_id = mr_info[item].split(",");
                        var type_text = [];
                        var selected_num = type_id[0]?type_id.length:0;
                        $(".selector-jt").find(".selected-num").text(selected_num);
                        for(var i=0,len=type_id.length;i<len;i++){
                            var $subType = $(".selector-jt .sub-type[data-id='"+type_id[i]+"']");
                            $subType.addClass("on");
                            type_text.push($subType.text());
                        }
                        $(".position-type").attr("data-id",mr_info[item]).val(type_text.toString()).css("color","#000").addClass("selected");
                    }else {
                        try{
                            $("." + item).val(mr_info[item]).addClass("selected");
                        }catch (e){
                            console.log(e);
                        }
                    }
                    $(".duration").attr("data-type", mr_info.intern_expect_dur_type || 0);
                    $(".days").attr("data-type", mr_info.intern_expect_days_type || 0);
                    $(".payment").attr("data-type", mr_info.intern_expect_min_payment || 0);
                    $(".stage").attr("data-type", mr_info.highest_degree_stage || 0);
                }
            }
        } else {
            mr_info = {};
        }

        var sex = 1;
        $(".tab").click(function () {
            $(".tab.on").removeClass("on");
            $(this).addClass("on");
            sex = $(this).attr("data-sex");
        });
        //头像上传
        fileUpload(uid, "avatar", function (error, avatar) {
            if (!error && avatar != "undefined") {
                $(".resume-pic .loading").remove();
                $(".resume-pic").css({"background-image": "url('" + avatar + "')"});
                mr_info.avatar = avatar;
                mr_info.uid = uid;
                fn.storage("mr_info", JSON.stringify(mr_info));
            }
        }, function () {
            $(".resume-pic").append("<div class='loading'></div>");
        });

        //下一步
        $(".step-r").on("click", function () {
            var $this = $(this);
            var text = $this.text();
            var nextStep = parseInt($(this).attr("data-step"));
            var thisStep = nextStep - 1;
            var flag = true;
            $(".step-content-" + thisStep + " .required").each(function () {
                flag = mrCreateError($(this));
                if (!flag) {
                    return false;
                }
            });
            $(".step-content-" + thisStep + " .required").on("focus", function () {
                $(this).nextAll(".input-tips").remove();
            });
            if (flag) {
                $("#avatar").removeAttr("id");
                if (nextStep <= 3) {
                    $(".step-content-" + nextStep + " .avatar").attr("id", "avatar");
                }
                if (thisStep == 1) {
                    mr_info.name = $.trim($(".name").val());//姓名
                    mr_info.phone = $.trim($(".phone").val());//手机号
                    mr_info.email = $.trim($(".email").val());//邮箱
                    mr_info.male = sex;//性别
                    mr_info.address = $.trim($(".address").val());//籍贯
                    mr_info.birthday = ($(".birthday").val()).toTimeStamp();//生日
                    mr_info.uid = uid;
                    fn.storage("mr_info", JSON.stringify(mr_info));
                } else if (thisStep == 2) {
                    mr_info.education_detail = [];
                    var detail = {};
                    detail.edu_id = 1;
                    detail.school = $.trim($(".school").val());//学校
                    detail.major = $.trim($(".major").val());//专业
                    detail.stage = $.trim($(".stage").val());//学历
                    detail.start_time = $.trim($(".start_time").val());//开始时间
                    detail.end_time = $.trim($(".end_time").val());//毕业时间
                    mr_info.education_detail.push(detail);
                    mr_info.highest_degree_stage = $(".stage").attr("data-type");
                    fn.storage("mr_info", JSON.stringify(mr_info));
                } else if (thisStep == 3) {
                    mr_info.intern_expect_cid = $(".hope-city").attr("data-cid");
                    mr_info.intern_expect_city = $.trim($(".hope-city").val());
                    mr_info.intern_expect_position = $.trim($(".position").val());
                    mr_info.intern_expect_position_type = $(".position-type").attr("data-id");
                    mr_info.intern_expect_dur_type = $(".duration").attr("data-type");
                    mr_info.intern_expect_days_type = $(".days").attr("data-type");
                    mr_info.intern_expect_min_payment = $(".payment").attr("data-type");

                    mr_info.intern_expect = {};
                    mr_info.intern_expect.city = $.trim($(".hope-city").val());//实习城市
                    mr_info.intern_expect.city_id = $(".hope-city").attr("data-cid");
                    mr_info.intern_expect.position = $.trim($(".position").val());//实习岗位
                    mr_info.intern_expect.position_type = $.trim($(".position-type").val());//实习岗位类型
                    mr_info.intern_expect.days = $.trim($(".days").val());//每周实习时间
                    mr_info.intern_expect.duration = $.trim($(".duration").val());//持续实习时间
                    mr_info.intern_expect.payment = $.trim($(".payment").val());//实习薪资
                    mr_info.intern_expect = JSON.stringify(mr_info.intern_expect);
                    fn.storage("mr_info", JSON.stringify(mr_info));
                    if (can_request) {
                        can_request = false;
                        $this.text("创建中...");
                        $.ajax({
                            type: "post",
                            url: "/api/resume/add",
                            dataType: "json",
                            data: {
                                option: {
                                    name: mr_info.name,
                                    avatar: mr_info.avatar,
                                    phone: mr_info.phone,
                                    email: mr_info.email,
                                    male: mr_info.male,
                                    address: mr_info.address,
                                    birthday: mr_info.birthday,
                                    education_detail: JSON.stringify(mr_info.education_detail),
                                    highest_degree_stage: mr_info.highest_degree_stage,
                                    intern_expect: mr_info.intern_expect,
                                    intern_expect_cid: mr_info.intern_expect_cid,
                                    intern_expect_city: mr_info.intern_expect_city,
                                    intern_expect_position: mr_info.intern_expect_position,
                                    intern_expect_position_type:mr_info.intern_expect_position_type,
                                    intern_expect_dur_type: mr_info.intern_expect_dur_type,
                                    intern_expect_days_type: mr_info.intern_expect_days_type,
                                    intern_expect_min_payment: mr_info.intern_expect_min_payment
                                }
                            },
                            success: function (data) {
                                can_request = true;
                                $this.text(text);
                                if (data.status == 10000) {
                                    if(global.forward&&global.forward!='undefined'){
                                        location.href = decodeURIComponent(global.forward);
                                    }else{
                                        location.href = "/myResume";
                                    }
                                    $.cookie("mr_info", "");
                                    $.cookie("create_step", "");
                                } else if (data.status == 10004) {
                                    window.location.href = account_host+"/login?forward=" + forward;
                                }
                            }
                        });
                    }
                }
                if (nextStep <= 3) {
                    $.cookie("create_step", nextStep);
                    $(".step-content-" + thisStep).hide();
                    $(".step-content-" + nextStep).show();
                }
            }
        });
        //上一步
        $(".step-l").on("click", function () {
            var prevStep = parseInt($(this).attr("data-step"));
            $("#avatar").removeAttr("id");
            $(".step-content-" + prevStep + " .avatar").attr("id", "avatar");
            $(".step-content-" + (prevStep + 1)).hide();
            $(".step-content-" + prevStep).show();
        });

    });
//简历创建信息错误处理
    function mrCreateError(requiredInput) {
        if ($.trim($(requiredInput).val()) == "" ||(($(requiredInput).attr("type")=="button") && !$(requiredInput).hasClass("selected"))) {
            $(requiredInput).nextAll(".input-tips").remove();
            $(requiredInput).after("<div class='input-tips'><span class='icon-prompt'></span>必填</div>");
            return false;
        } else if ($(requiredInput).hasClass("phone") && !regex.phone.test($.trim($(requiredInput).val()))) {
            $(requiredInput).nextAll(".input-tips").remove();
            $(requiredInput).after("<div class='input-tips'><span class='icon-prompt'></span>请填写正确的手机号</div>");
            return false;
        } else if ($(requiredInput).hasClass("email") && !regex.email.test($.trim($(requiredInput).val()))) {
            $(requiredInput).nextAll(".input-tips").remove();
            $(requiredInput).after("<div class='input-tips'><span class='icon-prompt'></span>请填写正确的邮箱号码</div>");
            return false;
        }
        return true;
    }

    function selectorBind() {
        $(document).click(function (e) {
            var event = e || window.event;
            if (!$(".btn-selector").is(event.target) && $(".btn-selector").has(event.target).length === 0) {
                $(".selector").hide();
            }
        });
        $(".btn-selector").on("click", function (e) {
            var event = e || window.event;
            $(".selector").hide();
            $(this).next(".selector").show();
        });
        $(".selector li").on("click", function (e) {
            var event = e || window.event;
            event.stopPropagation();
            var $this = $(this);
            var oSelector = $this.parent();
            var btnSel = $(oSelector).prev("span.btn-selector").find("input");
            $(btnSel).val($this.text()).attr("data-type", $this.attr("data-type")).addClass("selected");
            $(oSelector).hide();
        });
    }
});
