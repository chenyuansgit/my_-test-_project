require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            exports: '$'
        },
        'js/lib/IB_iscroll': {
            exports: 'IScroll'
        },
        'js/lib/IB_dateScroller': {
            exports: '$.fn.dateScroller'
        },
        'js/lib/IB_plupload.full': {
            exports: 'plupload'
        }
    }
});
require(['js/lib/IB_zepto', 'js/lib/IB_fn','js/lib/IB_fastclick', "js/lib/IB_reg","js/lib/IB_fileUpload",'js/lib/IB_citySelector',"js/lib/IB_jobTypeSelector",'js/lib/IB_dateScroller'], function ($, fn,FastClick, reg, fileUpload) {
    $(function () {
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        FastClick.attach(document.body);
        var forward = decodeURIComponent(fn.getQueryString("forward"));
        $(".header .back").attr("href",forward || '/userCenter');
        /*time*/
        $('#birth').attr("data-date", "1994-01").dateScroller({
            title: '出生年月',
            date: "1994-01",
            dateSpan: 22,//默认前后50年
            confirm: function (data) {
                $("#birth").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#edu-start').attr("data-date", "2012-09").dateScroller({
            title: '入学时间',
            date: '2012-09',
            dateSpan:10,//默认前后10年
            confirm: function (data) {
                $("#edu-start").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#edu-end').attr("data-date", '2016-06').dateScroller({
            title: '毕业时间',
            date: '2016-06',
            dateSpan:10,//默认前后10年
            confirm: function (data) {
                $("#edu-end").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        /*time end*/

        /*city*/
        $("#address").citySelector({
            isProvince : 1
        });
        $("#hope-city").citySelector({
            isProvince : 0
        });
        /*city end*/

        /*jt selector*/
        $("#position-type").jobTypeSelector();
        /*jt selector end*/

        /*selector*/
        $(".selector").addClass("animation_600");
        $(".selector .btn-console").on("click",function(e){
            e.preventDefault();
            $(".selector").removeClass("flipRight").addClass("flipRightOut");
            setTimeout(function () {
                $(".selector").removeClass("flipRightOut").css({"opacity": 1}).hide();
            }, 600);
        });
        $(".select-block").on("click", function (e) {
            e.preventDefault();
            $("input").blur();
            var selector = $(this).attr("data-selector");
            var id = $(this).attr("id");
            $(".selector-" + selector).show().addClass("flipRight").attr("data-tag", id);
        });
        $(".sel-content .sel-tab").on("click", function (e) {
            e.preventDefault();
            $(this).closest(".sel-content").find(".sel-tab.curr").removeClass("curr");
            $(this).addClass("curr");
            var data = $(this).find("span").text().trim();
            var type = $(this).attr("data-type");
            var sel_block = $(this).closest(".selector").attr("data-tag");
            $("#" + sel_block).find(".required").text(data).attr("data-type",type);
            setTimeout(function () {
                $(".selector").removeClass("flipRight").addClass("flipRightOut");
                setTimeout(function () {
                    $(".selector").removeClass("flipRightOut").css({"opacity": 1}).hide();
                }, 600);
            }, 500);
        });
        /*selector end*/

        try {
            localStorage.setItem("item", 0);
        } catch (e) {
            alert("您处于无痕浏览，无法为您保存已填写的信息，请一次性填写完所有信息");
        }

        $(".btn").data("click", true);

        $(".sex").on("click", function (e) {
            e.preventDefault();
            $(".sex.curr").removeClass("curr");
            $(this).addClass("curr");
        });
        var uid = $(".main").attr("data-uid");
        var mr_info = {};
        mr_info.uid = uid;
        if (localStorage.getItem("mr_info")) {
            var pre_info = JSON.parse(localStorage.getItem("mr_info"));
            if(pre_info.create_step && pre_info.uid == uid){
                mr_info = pre_info;
                $(".step").hide();
                $(".step-" + mr_info.create_step).show();
            }
        }
        setInterval(function () {
            localStorage.setItem("mr_info", JSON.stringify(mr_info));
        }, 30 * 1000);

        function showPopTips(tips){
            $(".popTips").show().text(tips).addClass("fadeIn");
            setTimeout(function () {
                $(".popTips").removeClass("fadeIn").hide();
            }, 1000);
        }

        //简历创建信息错误处理
        function mrCreateError(requiredInput) {
            if ($(requiredInput).hasClass("input") && $(requiredInput).val().trim() == "") {
                $(requiredInput).next(".input-error").remove();
                $(requiredInput).after("<div class='input-error'>必填</div>");
                return false;
            }else if( $(requiredInput).hasClass("select") && $(requiredInput).text().trim() == ""){
                $(requiredInput).next(".input-error").remove();
                $(requiredInput).after("<div class='input-error'>必填</div>");
                return false;
            } else if ($(requiredInput).hasClass("phone") && !reg.phone_reg.test($(requiredInput).val().trim())) {
                showPopTips("请填写正确的大陆手机号码");
                return false;
            } else if ($(requiredInput).hasClass("email") && !reg.email_reg.test($(requiredInput).val().trim())) {
                showPopTips("请填写正确的电子邮箱号码");
                return false;
            } else if ($(requiredInput).hasClass("edu_time")) {
                var startTime = Date.parse($(".start_time").text().trim().replace(/-/g, "/") + "/01");
                var endTime = Date.parse($(".end_time").text().trim().replace(/-/g, "/") + "/01");
                if (startTime >= endTime) {
                    showPopTips("毕业时间要大于入学时间");
                    return false;
                }
            }
            return true;
        }
        //加载简历缓存数据
        if (mr_info) {
            if (uid == mr_info.uid) {
                $(".stage").attr("data-type",mr_info.highest_degree_stage || 0);
                $(".duration").attr("data-type",mr_info.intern_expect_dur_type || 0);
                $(".days").attr("data-type",mr_info.intern_expect_days_type || 0);
                $(".payment").attr("data-type",mr_info.intern_expect_min_payment || 0);
                for (var item in mr_info) {
                    if (item == "male") {
                        $(".sex.curr").removeClass("curr");
                        $(".sex").eq(Math.abs(parseInt(mr_info.male))).addClass("curr");
                    } else if (item == "birthday") {
                        var birthday = new Date(parseInt(mr_info.birthday)).format("yyyy.MM").toString();
                        $(".birthday").text(birthday);
                    } else if (item == "education_detail") {
                        var edu = mr_info.education_detail[0];
                        for (var item_edu in edu) {
                            if(item_edu == "major" || item_edu == "school"){
                                $("." + item_edu).val(edu[item_edu]);
                            }else{
                                $("." + item_edu).text(edu[item_edu]);
                            }
                        }
                    } else if (item == "intern_expect") {
                        var expect = JSON.parse(mr_info.intern_expect);
                        for (var item_exp in expect) {
                            if (item_exp == "city") {
                                $(".hope-city").text(expect.city);
                                $(".hope-city").attr("data-cid",expect.city_id ||0);
                            } else if(item_exp == "days" || item_exp == "payment" || item_exp == "duration"){
                                $("." + item_exp).text(expect[item_exp]);
                            }else{
                                $("." + item_exp).val(expect[item_exp]);
                            }
                        }
                    } else if (item == "avatar") {
                        $(".avatar").css({"background-image": "url('" + mr_info.avatar + "')"});
                    } else if(item == "name" || item == "phone" || item == "email"){
                        $("." + item).val(mr_info[item]);
                    }else if(item == "intern_expect_position_type"){
                        var type_id = mr_info[item].split(",");
                        var type_text = [];
                        var selected_num = type_id[0]?type_id.length:0;
                        $(".selector-jt").find(".selected-num").text(selected_num);
                        for(var i=0,len=type_id.length;i<len;i++){
                            var $subType = $(".selector-jt .sub-type[data-id='"+type_id[i]+"']");
                            $subType.addClass("on");
                            type_text.push($subType.text());
                        }
                        $(".position-type").attr("data-id",mr_info[item]).text(type_text.toString());
                    }else{
                        $("." + item).text(mr_info[item]);
                    }
                }
            }
        }

        $(".required").on("click", function (e) {
            e.preventDefault();
            $(this).next(".input-error").remove();
        });
        //下一步
        $(".btn-next").on("click", function (e) {
            e.preventDefault();
            $("input").blur();
            var nextStep = parseInt($(this).attr("data-step"));
            var thisStep = nextStep - 1;
            var flag = true;
            $(".step-" + thisStep + " .required").each(function () {
                flag = mrCreateError($(this));
                if (!flag) {
                    return false;
                }
            });
            if (flag) {
                if (thisStep == 1) {
                    mr_info.name = $(".name").val().trim();//姓名
                    mr_info.phone = $(".phone").val().trim();//手机号
                    mr_info.email = $(".email").val().trim();//邮箱
                    mr_info.male = parseInt($(".sex.curr").attr("data-type"));//性别
                    mr_info.address = $(".address").text().trim();//籍贯
                    mr_info.birthday = $(".birthday").text().trim().toTimeStamp();//生日
                    try {
                        localStorage.setItem("mr_info", JSON.stringify(mr_info));
                    } catch (e) {
                    }
                } else if (thisStep == 2) {
                    mr_info.education_detail = [];
                    var detail = {};
                    detail.edu_id = 1;
                    detail.school = $(".school").val().trim();//学校
                    detail.major = $(".major").val().trim();//专业
                    detail.stage = $(".stage").text().trim();//学历
                    detail.start_time = $(".start_time").text().trim();//开始时间
                    detail.end_time = $(".end_time").text().trim();//毕业时间
                    mr_info.education_detail.push(detail);
                    mr_info.highest_degree_stage = $(".stage").attr("data-type");
                    try {
                        localStorage.setItem("mr_info", JSON.stringify(mr_info));
                    } catch (e) {
                    }
                } else if (thisStep == 3) {
                    mr_info.intern_expect = {};
                    mr_info.intern_expect.city = $(".hope-city").text().trim();//实习城市
                    mr_info.intern_expect.city_id = $(".hope-city").attr("data-cid");//实习城市
                    mr_info.intern_expect.position = $(".position").val().trim();//实习岗位
                    mr_info.intern_expect.position_type = $(".position-type").text().trim();//实习岗位类型
                    mr_info.intern_expect.days = $(".days").text().trim();//每周实习时间
                    mr_info.intern_expect.duration = $(".duration").text().trim();//持续实习时间
                    mr_info.intern_expect.payment = $(".payment").text().trim();//实习薪资
                    mr_info.intern_expect = JSON.stringify(mr_info.intern_expect);

                    mr_info.intern_expect_cid = $(".hope-city").attr("data-cid");
                    mr_info.intern_expect_city = $(".hope-city").text().trim();
                    mr_info.intern_expect_position = $(".position").val().trim();
                    mr_info.intern_expect_dur_type = $(".duration").attr("data-type");
                    mr_info.intern_expect_days_type = $(".days").attr("data-type");
                    mr_info.intern_expect_min_payment = $(".payment").attr("data-type");
                    mr_info.intern_expect_position_type = $(".position-type").attr("data-id");
                    try {
                        localStorage.setItem("mr_info", JSON.stringify(mr_info));
                    } catch (e) {
                    }
                    if ($(".btn-complete").data("click")) {
                        $(".btn-complete").data("click", false);
                        $.ajax({
                            type: "post",
                            url: "/api/u_resume/add",
                            dataType: "json",
                            data: {
                                option: {
                                    name: mr_info.name,
                                    avatar: mr_info.avatar||'',
                                    phone: mr_info.phone,
                                    email: mr_info.email,
                                    male: mr_info.male,
                                    address: mr_info.address,
                                    birthday: mr_info.birthday,
                                    education_detail: JSON.stringify(mr_info.education_detail),
                                    intern_expect: mr_info.intern_expect,
                                    highest_degree_stage : mr_info.highest_degree_stage,
                                    intern_expect_cid : mr_info.intern_expect_cid,
                                    intern_expect_city : mr_info.intern_expect_city,
                                    intern_expect_position : mr_info.intern_expect_position,
                                    intern_expect_dur_type : mr_info.intern_expect_dur_type,
                                    intern_expect_days_type : mr_info.intern_expect_days_type,
                                    intern_expect_min_payment : mr_info.intern_expect_min_payment,
                                    intern_expect_position_type : mr_info.intern_expect_position_type
                                }
                            },
                            success: function (data) {
                                $(" .btn-complete").data("click", true);
                                if (data.status == 10000) {
                                    if(global.forward&&global.forward!='undefined'){
                                        location.href = decodeURIComponent(global.forward);
                                    }else{
                                        location.href = "/private/resume";
                                    }
                                } else if (data.status == 10004) {
                                    var _page = encodeURIComponent(window.location.href);
                                    window.location.href = account_host+"/login?forward=" + _page;
                                }else if(data.status == 10006){
                                    showPopTips("目前只支持创建一份在线简历~");
                                    setTimeout(function () {
                                        location.href="/private/resume";
                                    }, 1200);

                                }
                            }
                        });
                    }
                }
                if (nextStep <= 3) {
                    mr_info.create_step = nextStep;
                    try {
                        localStorage.setItem("mr_info", JSON.stringify(mr_info));
                    } catch (e) {}
                    $(".step-" + thisStep).hide();
                    $(".step-" + nextStep).show();
                    $("body").scrollTop(0);
                }
            }

        });
        //上一步
        $(".btn-pre").on("click", function (e) {
            e.preventDefault();
            $("input").blur();
            var preStep = $(this).attr("data-step");
            $(".step").hide();
            $(".step-" + preStep).show();
            $("body").scrollTop(0);
        });

        //头像上传
        fileUpload(uid,'file-avatar',function(err,avatar) {
            if(!err){
                mr_info.avatar = avatar;
                var img = document.createElement('img');
                img.src = avatar;
                img.onload = function(){
                    $(".avatar").removeClass('loading-img').css({"background-image": "url('" + avatar + "')"});
                };
                try {
                    localStorage.setItem("mr_info", JSON.stringify(mr_info));
                } catch (e) {}
            }
        },function(){
            $(".avatar").addClass('loading-img');
        });
});
});
