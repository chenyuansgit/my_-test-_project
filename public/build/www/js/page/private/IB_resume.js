require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        },
        'js/lib/IB_plupload.full':{
            exports:'plupload'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fileUpLoad','js/common/IB_fn','js/common/IB_date','js/common/IB_city', 'js/common/IB_regex','js/common/IB_ueditor','js/common/IB_job_type','js/plugin/IB_lightbox','js/common/IB_jobTypeSelector'], function ($, fileUpload, fn, dateSelector, cities, regex,ueUtil,job_types) {
    var resumeUtil = {
        update : function(rid,option,callback){
            $.ajax({
                type: "post",
                url: "/api/resume/update/" + rid,
                dataType: "json",
                data: {
                    option: option
                },
                success: function (data) {
                    callback(data);
                },
                error: function(){

                }
            });
        },
        moveBlock : function (move) {
            //移动元素
            var infoBlock = move.closest(".resume-block");
            var editBlock = move.closest(".resume-edit");
            $(editBlock).insertAfter(infoBlock).css({"display":"none"});   //解决编辑框显示的Bug；
        },
        moveEditBlock : function (move) {
            //移动元素
            var infoBlock = move.closest(".resume-block");
            var titleBlock = move.closest(".show-state");
            var editBlock = $(infoBlock).next();
            $(editBlock).insertAfter(titleBlock);
        },
        check : function (editBlock) {
            var flag = true;
            $(editBlock).find("input[type='text']").each(function () {
                if ($.trim($(this).val()) == "") {
                    flag = false;
                    $(this).addClass("error");
                }
            });
            return flag;
        },
        showEditBtn : function(){
            $(".add-area").show();
            $(".resume-r").show();
            if ($.trim($(".resume-self .self-content").html())) {
                $(".resume-block-self .add-area").hide();
                $(".resume-self .resume-r").show();
            } else {
                $(".resume-block-self .add-area").show();
                $(".resume-self .resume-r").hide();
            }
        },
        showIntegrity : function (mr_integrity) {
            if (mr_integrity <= 30) {
                $(".integrity-solid").css({"width": mr_integrity + "%", "background-color": "#ff2525"});
            } else if (mr_integrity < 60 && mr_integrity > 30) {
                $(".integrity-solid").css({"width": mr_integrity + "%", "background-color": "#ffce42"});
            } else if (mr_integrity >= 60) {
                $(".integrity-solid").css({"width": mr_integrity + "%", "background-color": "rbg(255, 37, 37)"});
            }
        },
        selectorBind : function () {
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
                $(btnSel).css({"color": "#000"});
                $(btnSel).val($this.text()).attr("data-type", $this.attr("data-type"));
                $(oSelector).hide();
            });
        },
        getEduStage : function (stage) {
            switch ($.trim(stage)) {
                case "大专":
                    return 1;
                case "本科" :
                    return 2;
                case "硕士" :
                    return 3;
                case "博士" :
                    return 4;
                case "其他" :
                    return 5;
                default: return 5;
            }
        },
        jtInitial : function (idArr) {
            var type_id = idArr;
            var type_text = [];
            var selected_num = type_id[0]?type_id.length:0;
            $(".selector-jt").find(".selected-num").text(selected_num);
            for(var i=0,len=type_id.length;i<len;i++){
                var pid = parseInt(type_id[i].substring(0,1))-1;
                var sid = parseInt(type_id[i].substring(1)) ;
                if(pid>-1 && sid > -1) {
                    type_text.push(job_types[pid].sub_types[sid].group_name);
                }
                var $subType = $(".selector-jt .sub-type[data-id='"+type_id[i]+"']");
                $subType.addClass("on");
            }
            $(".hope-position-type").text(type_text.toString());
        },
        internExpectInitial : function(){
            var min_payment_type = parseInt($(".hope-payment").attr("data-type"));
            var payment_text = ["不限","50以下","50-100","100-200","200-500","500以上"];
            switch(min_payment_type){
                case 0 :  $(".hope-payment").text(payment_text[0]);break;
                case 1 :  $(".hope-payment").text(payment_text[1]);break;
                case 50 :  $(".hope-payment").text(payment_text[2]);break;
                case 100 :  $(".hope-payment").text(payment_text[3]);break;
                case 200:  $(".hope-payment").text(payment_text[4]);break;
                case 500:  $(".hope-payment").text(payment_text[5]);break;
                default : $(".hope-payment").text(payment_text[0]);break;
            }

            var days_type = parseInt($(".hope-days").attr("data-type"));
            var days_text = ["1-2天","3天","4天","5天","6-7天"];
            $(".hope-days").text(days_text[days_type-1]);

            var dur_type = parseInt($(".hope-duration").attr("data-type"));
            var dur_text = ["1个月以下","2个月","3个月","3个月以上"];
            $(".hope-duration").text(dur_text[dur_type-1]);
        }
    };

    //默认投递及是否对企业可见
    $(".right-wrap-sel").click(function () {
        if($(this).parent().find(".right-wrap-sel").hasClass("cur")) {
            $(this).parent().find(".right-wrap-sel").removeClass("cur");
            $(this).parent().find(".wrap-item").hide();
        } else {
            $(this).parent().find(".right-wrap-sel").addClass("cur");
            $(this).parent().find(".wrap-item").show();
        }
    });
    $(".wrap-item li").click(function () {
        $(this).parent().hide();
        var t = $(this).text();
        $(this).parent().prev().removeClass("cur").text(t).append("<span class='icon-triangle-down'></span>");
    });
    
    $(function () {
        var can_request = true;
        var forward = encodeURIComponent(window.location.href);
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        fn.popBoxBind();
        resumeUtil.selectorBind();

        var rid = global.rid;
        var uid = global.uid;
        var edu_list = [];
        var skill_list = [];
        var project_list = [];
        var school_list = [];
        var intern_list = [];
        var works_list = [];    //作品列表
        var mr_integrity = 20;

        var ue_self = ueUtil.getEditor("content-self", 200, 300);
        var ue_intern = ueUtil.getEditor("content-intern", 200, 300);
        var ue_school = ueUtil.getEditor("content-school", 200, 300);
        var ue_project = ueUtil.getEditor("content-project", 200, 300);

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
            endYear: new Date().getFullYear() + 6,
            startYear: new Date().getFullYear() - 12,
            upToToday: false,
            isDouble: true,
            higherThan: "#edu-start"
        });
        $("#pro-start").dateSelector({
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 12,
            isDouble: true,
            lowerThan: "#pro-end"
        });
        $("#pro-end").dateSelector({
            isToday: true,
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 12,
            isDouble: true,
            higherThan: "#pro-start"
        });
        $("#school-start").dateSelector({
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 12,
            isDouble: true,
            lowerThan: "#school-end"
        });
        $("#school-end").dateSelector({
            isToday: true,
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 12,
            isDouble: true,
            higherThan: "#school-start"
        });
        $("#intern-start").dateSelector({
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 12,
            isDouble: true,
            lowerThan: "#intern-end"
        });
        $("#intern-end").dateSelector({
            isToday: true,
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 12,
            isDouble: true,
            higherThan: "#intern-start"
        });

        //职位类别
        $(".edit-position-type").jobTypeSelector({});

        for (var i = 0, len = $(".resume-edu").length; i < len; i++) {
            var edu = $(".resume-edu").eq(i).find(".btn-edit");
            var obj = {};
            obj.edu_id = parseInt($(".resume-edu").eq(i).attr("data-edu_id"));
            obj.school = $(edu).attr("data-school");
            obj.major = $(edu).attr("data-major");
            obj.stage = $(edu).attr("data-stage");
            obj.start_time = $(edu).attr("data-startime");
            obj.end_time = $(edu).attr("data-endtime");
            edu_list.push(obj);
        }
        for (var i = 0, len = $(".resume-skill").length; i < len; i++) {
            var skill = $(".resume-skill").eq(i);
            var obj = {};
            obj.skill_id = parseInt(skill.attr("data-skill_id"));
            obj.skill = skill.find(".skill").text().trim();
            skill_list.push(obj);
        }
        for (var i = 0, len = $(".resume-project").length; i < len; i++) {
            var pro = $(".resume-project").eq(i).find(".btn-edit");
            var obj = {};
            obj.id = parseInt($(".resume-project").eq(i).attr("data-id"));
            obj.name = $(pro).attr("data-name");
            obj.role = $(pro).attr("data-role");
            obj.startTime = $(pro).attr("data-startime");
            obj.endTime = $(pro).attr("data-endtime");
            obj.content = $(pro).attr("data-content");
            project_list.push(obj);
        }
        for (var i = 0, len = $(".resume-school").length; i < len; i++) {
            var school = $(".resume-school").eq(i).find(".btn-edit");
            var obj = {};
            obj.id = parseInt($(".resume-school").eq(i).attr("data-id"));
            obj.name = $(school).attr("data-name");
            obj.role = $(school).attr("data-role");
            obj.startTime = $(school).attr("data-startime");
            obj.endTime = $(school).attr("data-endtime");
            obj.content = $(school).attr("data-content");
            school_list.push(obj);
        }
        for (var i = 0, len = $(".resume-intern").length; i < len; i++) {
            var intern = $(".resume-intern").eq(i).find(".btn-edit");
            var obj = {};
            obj.id = parseInt($(".resume-intern").eq(i).attr("data-id"));
            obj.name = $(intern).attr("data-name");
            obj.role = $(intern).attr("data-role");
            obj.startTime = $(intern).attr("data-startime");
            obj.endTime = $(intern).attr("data-endtime");
            obj.content = $(intern).attr("data-content");
            intern_list.push(obj);
        }
        //遍历作品
        for (var i = 0, len = $(".resume-works").length; i < len; i++) {
            var works = $(".resume-works").eq(i).find(".btn-edit");
            var obj = {};
            obj.id = parseInt($(".resume-works").eq(i).attr("data-id"));
            obj.name = $(works).attr("data-name");
            obj.type = $(works).attr("data-works-type");
            if( obj.type == "online")
                obj.url = $(works).attr("data-url");
            else
                obj.link = $(works).attr("data-link");
            works_list.push(obj);
        }
        mr_integrity = parseInt(global.integrity);
        $(".integrity-number").text(mr_integrity+"%");
        setTimeout(function () {
            resumeUtil.showIntegrity(mr_integrity);
        }, 300);
        $(document).on("click", ".resume-edit .console", function () {
            var infoBlock = $(this).closest(".resume-block");
            var editBlock = $(this).closest(".resume-edit");
            $(editBlock).find(".error").removeClass("error");
            if ($(editBlock).hasClass("resume-edit-self")) {
                $(".resume-self").show();
            } else if (!($(editBlock).hasClass("resume-edit-base") || $(editBlock).hasClass("resume-edit-hope"))) {
                $(editBlock).find("input[type='text']").val("");
            }
            resumeUtil.showEditBtn();
            //移动元素
            $(editBlock).insertAfter(infoBlock);
            $(editBlock).hide();

        });
        $(document).on("click", ".add-area .btn-add", function () {
            $(".resume-edit").hide();
            var infoBlock = $(this).closest(".resume-block");
            var titleBlock = $(this).closest(".resume-block-title");
            var editBlock = $(infoBlock).next();
            if (infoBlock.hasClass("resume-block-self")) {
                $(".resume-self").hide();
                if ($(".resume-self").html().trim()) {
                    ue_self.setContent($(".self-content").html().trim());
                } else {
                    ue_self.setContent("");
                }
            } else {
                $(editBlock).find(".confirm").attr("data-type", "add");
                ue_intern.setContent("");
                ue_school.setContent("");
                ue_project.setContent("");
            }
            $(".add-area").hide();
            $(".resume-r").hide();
            $(editBlock).find(".delete").hide();
            $(editBlock).find(".error").removeClass("error");
            $(editBlock).find("input[type='text']").val("");
            //移动元素  /*添加自我描述禁止移动*/
            if(!$(this).parents(".resume-block").hasClass("resume-block-self")) {
                $(editBlock).insertAfter(titleBlock);
            }
            $(editBlock).show();
            if($(this).parents(".resume-edit-works")) {   //对添加作品进入处理
                $(".resume-edit-tab li").removeClass("cur");
                if($(".resume-edit-tab li").hasClass("banned"))
                    $(".resume-edit-tab li").removeClass("banned");
                $(".resume-edit-tab li").eq(0).addClass("cur");
                $(".resume-works-preview").attr("data-link","");
                $(".resume-works-preview img").css("display","none").attr("src","");
                $(".resume-edit-works input[type='text']").val("");
                $(".resume-edit-works .upload-img").text("上传作品");
                $(".upload-box").show();
                $(".online-box").hide();
                $(".resume-edit-works .confirm").attr("data-type","add");
            }
        });
        $("input").focus(function () {
            $(this).removeClass("error");
        });

        //简历下载
        $(".btn-downResume").click(function () {
            $(".popBox-download").show();
            $(".overlay").show();
        });
        $(".popBox-download .btn-download").click(function () {
            $(".popBox-download").hide();
            $(".overlay").hide();
        });

        //公开简历
        $(".btn-join").click(function () {
            var $this = $(this);
            var is_public = 1;
            if (can_request) {
                if ($this.hasClass("on")) {
                    is_public = 0;
                }
                resumeUtil.update(rid,{
                    is_public: is_public
                },function(data){
                    can_request = true;
                    if (data.status == 10000) {
                        if (is_public) {
                            $(".btn-join").removeClass("off").addClass("on");
                        } else {
                            $(".btn-join").removeClass("on").addClass("off");
                        }
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });

        //头像上传
        fileUpload(uid, "avatar-file", function (error, avatar) {
            if (!error && avatar != "undefined") {
                $(".avatar .loading").remove();
                resumeUtil.update(rid,{
                    avatar: avatar
                },function(data){
                    if (data.status == 10000) {
                        $(".resume-header .avatar").css({"background-image": "url('" + avatar + "')"});
                    }
                });
            }
        }, function () {
            $(".avatar").append("<div class='loading'></div>");
        });

        /*基本信息修改*/
        $(".address-wrap").citySelector({
            isProvince: true
        });
        $(".sex-select .tab").click(function () {
            $(".tab.on").removeClass("on");
            $(this).addClass("on");
            if ($(this).text() == "男") {
                male = 1;
            } else {
                male = 0;
            }
        });
        $(".resume-header .btn-edit").click(function () {
            $(".resume-edit-base .tab.on").removeClass("on");
            var sex = parseInt($(".sex").attr("data-type"));
            if (sex) {
                $(".resume-edit-base .tab").eq(0).addClass("on");
            } else {
                $(".resume-edit-base .tab").eq(1).addClass("on");
            }
            $(".resume-edit-base .name-edit").val($(".resume-header .name").text().trim());
            $(".resume-edit-base .phone").val($(".resume-base .phone").text().trim());
            $(".resume-edit-base .email").val($(".resume-base .email").text().trim());
            $(".resume-edit-base .address").val($(".resume-base .address").text().trim());
            $(".resume-edit-base .birthday").val($(".resume-base .birthday").text().trim());

            $(".add-area").hide();
            $(".resume-r").hide();
            $(".resume-edit-base").show();
        });
        $(".resume-edit-base .confirm").click(function () {
            var $this = $(this);
            var value = $this.val();
            if (can_request) {
                var name = $(".resume-edit-base .name-edit").val().trim();
                var phone = parseInt($(".resume-edit-base .phone").val().trim());
                var email = $(".resume-edit-base .email").val().trim();
                var address = $(".resume-edit-base .address").val().trim();
                var birth = $(".resume-edit-base .birthday").val().toTimeStamp();
                var male = parseInt($(".sex-select .tab.on").attr("data-type"));
                if (resumeUtil.check(".resume-edit-base")) {
                    if (!regex.phone.test(phone)) {
                        $(".resume-edit-base .phone").addClass("error");
                    } else if (!regex.email.test(email)) {
                        $(".resume-edit-base .email").addClass("error");
                    } else {
                        can_request = false;
                        $this.val("保存中...");
                        resumeUtil.update(rid, {
                            name: name,
                            phone: phone,
                            email: email,
                            male: male,
                            address: address,
                            birthday: birth
                        },function(data){
                            can_request = true;
                            $this.val(value);
                            if (data.status == 10000) {
                                if (male) {
                                    $(".sex").text("男").attr("data-type", "1");
                                } else {
                                    $(".sex").text("女").attr("data-type", "0");
                                }
                                $(".resume-header .name").text(name);
                                $(".resume-base .address").text(address);
                                $(".resume-base .birthday").text($(".resume-edit-base .birthday").val());
                                $(".resume-base .phone").text(phone);
                                $(".resume-base .email").text(email);
                                $(".resume-edit-base").hide();
                                resumeUtil.showEditBtn();
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        });
                    }
                }
            }

        });
        /*基本信息 end*/

        /*期望实习修改*/
        $(".hope-city-wrap").citySelector({
            isProvince: false
        });
        /*职位类别初始化*/
        resumeUtil.jtInitial($(".edit-position-type").attr("data-id").split(","));
        $(document).on("click", ".resume-block-title .btn-edit", function () {
            $(".resume-edit-hope .tab").on("click", function () {
                var tabs = $(this).parent();
                $(tabs).find(".tab.on").removeClass("on");
                $(this).addClass("on");
            });

            var duration_type = parseInt($(".hope-duration").attr("data-type"));
            var days_type = parseInt($(".hope-days").attr("data-type"));
            $(".resume-edit-hope .tab.on").removeClass("on");
            $(".edit-duration .tab").eq(duration_type-1).addClass("on");
            $(".edit-days .tab").eq(days_type-1).addClass("on");

            $(".edit-city").val($(".hope-city").text());
            $(".edit-city").attr("data-cid", $(".hope-city").attr("data-cid"));
            $(".edit-payment").val($(".hope-payment").text());
            $(".edit-position").val($(".hope-position").text());
            $(".edit-position-type").val($(".hope-position-type").text());

            $(".add-area").hide();
            $(".resume-r").hide();
            $(".resume-edit-hope").show();
        });
        $(".resume-edit-hope .confirm").on("click", function () {
            var $this = $(this);
            var value = $this.val();
            if (can_request && resumeUtil.check(".resume-edit-hope")) {
                var city = $(".edit-city").val();
                var city_id = $(".edit-city").attr("data-cid");
                var payment = $(".edit-payment").val();
                var position = $(".edit-position").val();
                var position_type = $(".edit-position-type").val();
                var days = $(".edit-days .tab.on").text() + "/周";
                var duration = $(".edit-duration .tab.on").text();

                var intern_expect_cid = $(".edit-city").attr("data-cid");
                var intern_expect_city = $(".edit-city").val().trim();
                var intern_expect_position = $(".edit-position").val().trim();
                var intern_expect_position_type = $(".edit-position-type").attr("data-id");
                var intern_expect_dur_type = $(".edit-duration .tab.on").attr("data-type");
                var intern_expect_days_type = $(".edit-days .tab.on").attr("data-type");
                var intern_expect_min_payment = $(".edit-payment").attr("data-type");
                var intern_expect = JSON.stringify({
                    "city": city,
                    "city_id": city_id,
                    "payment": payment,
                    "position": position,
                    "position_type":position_type,
                    "days": days,
                    "duration": duration
                });
                can_request = false;
                $this.val("保存中...");
                resumeUtil.update(rid, {
                    intern_expect: intern_expect,
                    intern_expect_cid: intern_expect_cid,
                    intern_expect_city: intern_expect_city,
                    intern_expect_position: intern_expect_position,
                    intern_expect_position_type: intern_expect_position_type,
                    intern_expect_dur_type: intern_expect_dur_type,
                    intern_expect_days_type: intern_expect_days_type,
                    intern_expect_min_payment: intern_expect_min_payment
                },function(data){
                    can_request = true;
                    $this.val(value);
                    if (data.status == 10000) {
                        $(".hope-city").text(city);
                        $(".hope-payment").text(payment);
                        $(".hope-days").text(days);
                        $(".hope-duration").text(duration);
                        $(".hope-position").text(position);
                        $(".hope-position-type").text(position_type);
                        $(".resume-edit-hope").hide();
                        resumeUtil.showEditBtn();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        /*期望实习 end*/

        /*教育经历*/
        $(document).on("click", ".resume-block-edu .btn-edit", function () {
            var $this = $(this);
            var startTime = $(this).attr("data-startime");
            var endTime = $(this).attr("data-endtime");
            var school = $(this).attr("data-school");
            var major = $(this).attr("data-major");
            var stage = $(this).attr("data-stage");
            $(".resume-edit-edu .edit-school").val(school);
            $(".resume-edit-edu .edit-major").val(major);
            $(".resume-edit-edu .edit-stage").val(stage);
            $(".resume-edit-edu .edit-startTime").val(startTime);
            $(".resume-edit-edu .edit-endTime").val(endTime);

            var edu_id = $(this).closest(".resume-edu").attr("data-edu_id");
            $(".resume-edit-edu .confirm").attr("data-edu_id", edu_id);
            $(".resume-edit-edu .confirm").attr("data-type", "edit");

            //移动元素
            resumeUtil.moveEditBlock($this);
            $(".resume-edit-edu").show();
            $(".add-area").hide();
            $(".resume-r").hide();
        });
        //修改与添加
        $(document).on("click", ".resume-edit-edu .confirm", function () {
            var $this = $(this);
            var value = $this.val();
            var highest_degree_stage = 5;
            try{
                highest_degree_stage = resumeUtil.getEduStage(edu_list[0].stage || "");
            }catch(e){}
            if (can_request && resumeUtil.check(".resume-edit-edu")) {
                var edu_id = $(this).attr("data-edu_id");
                var school = $(".edit-school").val().trim();
                var major = $(".edit-major").val().trim();
                var stage = $(".edit-stage").val().trim();
                var start_time = $(".edit-startTime").val().trim();
                var end_time = $(".edit-endTime").val().trim();
                if ($(this).attr("data-type") == "edit") {//修改
                    for (edu in edu_list) {
                        if (edu_id == edu_list[edu].edu_id) {
                            edu_list[edu].school = school;
                            edu_list[edu].major = major;
                            edu_list[edu].stage = stage;
                            edu_list[edu].start_time = start_time;
                            edu_list[edu].end_time = end_time;
                            if (edu == 0) {
                                highest_degree_stage = resumeUtil.getEduStage(stage);
                            }
                            break;
                        }
                    }
                    var education_detail = JSON.stringify(edu_list);
                    can_request = false;
                    $this.val("保存中...");
                    resumeUtil.update(rid,{
                        education_detail: education_detail,
                        highest_degree_stage: highest_degree_stage
                    },function(data){
                        can_request = true;
                        $this.val(value);
                        if (data.status == 10000) {
                            var edu = $(".resume-edu[data-edu_id='" + edu_id + "']");
                            $(edu).find(".time").text(start_time + "~" + end_time);
                            $(edu).find(".school").text(school);
                            $(edu).find(".major").text(major);
                            $(edu).find(".stage").text(stage);
                            $(edu).find(".btn-edit").attr({
                                "data-edu_id": edu_id,
                                "data-startime": start_time,
                                "data-endtime": end_time,
                                "data-school": school,
                                "data-major": major,
                                "data-stage": stage
                            });
                            $(".resume-edit-edu input[type='text']").val("");
                            $(".resume-edit-edu").hide();
                            resumeUtil.showEditBtn();
                            //移动元素
                            resumeUtil.moveBlock($this);
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                } else if ($(this).attr("data-type") == "add") {//添加
                    var num = edu_list.length;
                    edu_id = num ? edu_list[num - 1].edu_id + 1 : 1;
                    var obj_edu = {
                        "edu_id": edu_id,
                        "school": school,
                        "major": major,
                        "stage": stage,
                        "start_time": start_time,
                        "end_time": end_time
                    };
                    edu_list.push(obj_edu);
                    var education_detail = JSON.stringify(edu_list);
                    can_request = false;
                    $this.val("保存中...");
                    resumeUtil.update(rid, {
                        education_detail: education_detail
                    },function(data){
                        can_request = true;
                        $this.val(value);
                        if (data.status == 10000) {
                            var newEdu = "<div class='resume-edu show-state' data-edu_id=" + edu_id + " >\
                                        <div class='info clearfix'>\
                                            <span class='resume-circle'></span>\
                                            <span class='time fl'></span>\
                                            <span class='school fl'></span>\
                                        </div>\
                                        <div class='resume-r'>\
                                            <span class='btn-edit btn'><span class='icon-r-edit'></span></span>\
                                            <span class='btn-delete btn'><span class='icon-r-del'></span></span>\
                                        </div>\
                                        <div class='resume-edu-info'><span class='major'></span><span class='stage'></span></div>\
                                     </div>";
                            $(".resume-block-edu").append(newEdu);
                            var edu = $(".resume-edu[data-edu_id='" + edu_id + "']");
                            $(edu).find(".time").text(start_time + "~" + end_time);
                            $(edu).find(".school").text(school);
                            $(edu).find(".major").text(major);
                            $(edu).find(".stage").text(stage);
                            $(edu).find(".btn-edit").attr({
                                "data-startime": start_time,
                                "data-endtime": end_time,
                                "data-school": school,
                                "data-major": major,
                                "data-stage": stage
                            });
                            $(".resume-edit-edu input[type='text']").val("");
                            if (edu_list.length > 1) {
                                $(".resume-edu .resume-r .btn-delete").remove();
                                $(".resume-edu .resume-r").append("<span class='btn-delete btn'><span class='icon-r-del'></span></span>");
                            }
                            $(".resume-edit-edu").hide();
                            resumeUtil.showEditBtn();
                            //移动元素
                            resumeUtil.moveBlock($this);
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }
        });
        //删除
        $(document).on("click", ".resume-edu .btn-confirm-del", function () {
            var edu_id = $(this).closest(".resume-edu").attr("data-edu_id");
            var highest_degree_stage = resumeUtil.getEduStage(edu_list[0].stage || "");
            if (can_request) {
                can_request = false;
                for (edu in edu_list) {
                    if (edu_id == edu_list[edu].edu_id) {
                        if (edu == 0) {
                            highest_degree_stage = resumeUtil.getEduStage(edu_list[1].stage);
                        }
                        edu_list.splice(edu, 1);
                        break;
                    }
                }
                if (edu_list.length > 0) {
                    var education_detail = JSON.stringify(edu_list);
                    resumeUtil.update(rid,{
                        education_detail: education_detail,
                        highest_degree_stage: highest_degree_stage
                    },function (data) {
                        can_request = true;
                        if (data.status == 10000) {
                            var edu = $(".resume-edu[data-edu_id='" + edu_id + "']");
                            $(edu).remove();
                            $(".delete-box").remove();
                            $(".resume-edit-edu input[type='text']").val("");
                            if (edu_list.length <= 1) {
                                $(".resume-edu .btn-delete").remove();
                            }
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }

            }
        });
        /*教育经历 end*/


        /*技能*/
        $(document).on("click", ".resume-block-skill .btn-edit", function () {
            var $this = $(this);
            var skillTag = $(this).closest(".resume-skill");
            var skill = skillTag.find(".skill").text().trim();
            var skill_id = skillTag.attr("data-skill_id");
            $(".resume-edit-skill .edit-skill").val(skill);
            $(".resume-edit-skill .confirm").attr("data-type", "edit").attr("data-id", skill_id);
            $(".add-area").hide();
            $(".resume-r").hide();
            //移动元素
            resumeUtil.moveEditBlock($this);
            $(".resume-edit-skill").show();
        });
        //修改与添加
        $(".resume-edit-skill .confirm").on("click", function () {
            var $this = $(this);
            var value = $this.val();
            if (can_request && resumeUtil.check(".resume-edit-skill")) {
                var skill = $(".edit-skill").val().trim();
                var num = skill_list.length;
                if ($(this).attr("data-type") == "add") {
                    var skill_id = num ? skill_list[num - 1].skill_id + 1 : 1;
                    if (skill) {
                        var obj_skill = {
                            "skill_id": skill_id,
                            "skill": skill
                        };
                        skill_list.push(obj_skill);
                        var skill_detail = JSON.stringify(skill_list);
                        can_request = false;
                        $this.val("保存中...");
                        resumeUtil.update(rid, {
                            skill: skill_detail
                        },function (data) {
                            can_request = true;
                            $this.val(value);
                            if (data.status == 10000) {
                                var newSkill =
                                    "<div class='resume-skill show-state' data-skill_id=" + skill_id + ">\
                                    <span class='resume-circle'></span>\
                                    <div class='skill'></div>\
                                    <div class='resume-r'>\
                                        <span class='btn-edit btn'><span class='icon-r-edit'></span></span>\
                                        <span class='btn-delete btn'><span class='icon-r-del'></span></span>\
                                    </div>\
                                </div>";
                                $(".resume-block-skill").append(newSkill);
                                var sk = $(".resume-skill[data-skill_id='" + skill_id + "']");
                                $(sk).find(".skill").text(skill);
                                $(".resume-edit-skill input[type='text']").val("");
                                $(".resume-edit-skill").hide();
                                resumeUtil.showEditBtn();
                                //移动元素
                                resumeUtil.moveBlock($this);
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        });
                    }
                } else if ($(this).attr("data-type") == "edit") {
                    var skill_id = $(this).attr("data-id");
                    if (skill) {
                        for (n in skill_list) {
                            if (skill_id == skill_list[n].skill_id) {
                                skill_list[n].skill = skill;
                                break;
                            }
                        }
                        var skill_detail = JSON.stringify(skill_list);
                        can_request = false;
                        $this.val("保存中...");
                        resumeUtil.update(rid,{
                            skill: skill_detail
                        },function(data){
                            can_request = true;
                            $this.val(value);
                            if (data.status == 10000) {
                                var sk = $(".resume-skill[data-skill_id='" + skill_id + "']");
                                sk.find(".skill").text(skill);
                                $(".resume-edit-skill input[type='text']").val("");
                                $(".resume-edit-skill").hide();
                                resumeUtil.showEditBtn();
                                //移动元素
                                resumeUtil.moveBlock($this);
                            }
                        });
                    }
                }
            }
        });
        //删除
        $(document).on("click", ".resume-skill .btn-confirm-del", function () {
            var skill_id = $(this).closest(".resume-skill").attr("data-skill_id");
            if (can_request) {
                can_request = false;
                for (n in skill_list) {
                    if (skill_id == skill_list[n].skill_id) {
                        skill_list.splice(n, 1);
                        break;
                    }
                }
                var skill_detail = JSON.stringify(skill_list);
                resumeUtil.update(rid,{
                    skill: skill_detail
                },function(data){
                    can_request = true;
                    if (data.status == 10000) {
                        $(".resume-edit-skill").hide();
                        var sk = $(".resume-skill[data-skill_id='" + skill_id + "']");
                        $(sk).remove();
                        $(".delete-box").remove();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        /*技能 end*/

        /*项目经历*/
        $(document).on("click", ".resume-project .btn-edit", function () {
            var $this = $(this);
            var id = $(this).closest(".resume-project").attr("data-id");
            var name = $(this).attr("data-name");
            var role = $(this).attr("data-role");
            var content = $(this).closest(".resume-project").find(".exp-content").html().trim();
            var startTime = $(this).attr("data-startime");
            var endTime = $(this).attr("data-endtime");

            $(".resume-edit-project .edit-name").val(name);
            $(".resume-edit-project .edit-role").val(role);
            $(".resume-edit-project .edit-startTime").val(startTime);
            $(".resume-edit-project .edit-endTime").val(endTime);
            ue_project.setContent(content);

            $(".resume-edit-project .confirm").attr("data-type", "edit");
            $(".resume-edit-project .confirm").attr("data-id", id);
            $(".add-area").hide();
            $(".resume-r").hide();
            //移动元素
            resumeUtil.moveEditBlock($this);
            ue_project.iframe.contentWindow.document.getElementsByTagName('body')[0].innerHTML = content;   //手动对编辑框进行赋值
            $(".resume-edit-project").show();
        });
        //修改与添加
        $(document).on("click", ".resume-edit-project .confirm", function () {
            var $this = $(this);
            var value = $this.val();
            if (can_request && resumeUtil.check(".resume-edit-project")) {
                var name = $.trim($(".resume-edit-project .edit-name").val());
                var startTime = $.trim($(".resume-edit-project .edit-startTime").val());
                var endTime = $.trim($(".resume-edit-project .edit-endTime").val());
                var role = $.trim($(".resume-edit-project .edit-role").val());
                var content = ueUtil.getPlainContent(ue_project.getContent());
                if ($(this).attr("data-type") == "add") {
                    if (name && startTime && endTime && role && content) {
                        var num = project_list.length;
                        var id = num ? project_list[num - 1].id + 1 : 1;
                        var obj_pro = {
                            "id": id,
                            "name": name,
                            "role": role,
                            "startTime": startTime,
                            "endTime": endTime,
                            "content": content
                        };
                        project_list.push(obj_pro);
                        var pro_detail = JSON.stringify(project_list);
                        can_request = false;
                        $this.val("保存中...");
                        resumeUtil.update(rid, {
                            project_exp: pro_detail
                        },function (data) {
                            can_request = true;
                            $this.val(value);
                            if (data.status == 10000) {
                                var newPro =
                                    "<div class='resume-project resume-exp show-state'  data-id=" + id + ">\
                                        <div class='info clearfix'>\
                                            <span class='resume-circle'></span>\
                                            <span class='time fl'></span>\
                                            <span class='exp-name fl'></span>\
                                            <span class='exp-role fl'></span>\
                                        </div>\
                                        <div class='resume-r'>\
                                            <span class='btn-edit btn' data-startime='" + startTime + "' data-endtime='" + endTime + "' data-name='" + name + "' data-role='" + role + "' data-content='" + content + "'><span class='icon-r-edit'></span></span>\
                                            <span class='btn-delete btn'><span class='icon-r-del'></span></span>\
                                        </div>\
                                        <div class='exp-content'>" + content + "</div>\
                                    </div>";
                                $(".resume-block-project").append(newPro);
                                var project = $(".resume-project[data-id=" + id + "]");
                                $(project).find(".time").text(startTime + "~" + endTime);
                                $(project).find(".exp-name").text(name);
                                $(project).find(".exp-role").text(role);
                                $(".resume-edit-project input[type='text']").val("");
                                ue_project.setContent("");
                                $(".resume-edit-project").hide();
                                resumeUtil.showEditBtn();
                                //移动元素
                                resumeUtil.moveBlock($this);
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        });
                    }
                } else if ($(this).attr("data-type") == "edit") {
                    var id = $(this).attr("data-id");
                    for (n in project_list) {
                        if (id == project_list[n].id) {
                            project_list[n].name = name;
                            project_list[n].role = role;
                            project_list[n].startTime = startTime;
                            project_list[n].endTime = endTime;
                            project_list[n].content = content;
                            break;
                        }
                    }
                    var project_detail = JSON.stringify(project_list);
                    can_request = false;
                    $this.val("保存中...");
                    resumeUtil.update(rid, {
                        project_exp: project_detail
                    },function(data){
                        can_request = true;
                        $this.val(value);
                        if (data.status == 10000) {
                            var project = $(".resume-project[data-id='" + id + "']");
                            $(project).find(".exp-time").text(startTime + "~" + endTime);
                            $(project).find(".exp-name").text(name);
                            $(project).find(".exp-role").text(role);
                            $(project).find(".exp-content").html(content);
                            $(project).find(".btn-edit").attr({
                                "data-startime": startTime,
                                "data-endtime": endTime,
                                "data-name": name,
                                "data-role": role,
                                "data-content": content
                            });
                            $(".resume-edit-project input[type='text']").val("");
                            ue_project.setContent("");
                            $(".resume-edit-project").hide();
                            resumeUtil.showEditBtn();
                            //移动元素
                            resumeUtil.moveBlock($this);
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }
        });
        //删除
        $(document).on("click", ".resume-project .btn-confirm-del", function () {
            var id = $(this).closest(".resume-project").attr("data-id");
            if (can_request) {
                can_request = false;
                for (n in project_list) {
                    if (id == project_list[n].id) {
                        project_list.splice(n, 1);
                        break;
                    }
                }
                var project_detail = JSON.stringify(project_list);
                resumeUtil.update(rid,{
                    project_exp: project_detail
                },function (data) {
                    can_request = true;
                    if (data.status == 10000) {
                        $(".resume-edit-project").hide();
                        var project = $(".resume-project[data-id='" + id + "']");
                        $(project).remove();
                        $(".delete-box").remove();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        /*项目经历 end*/


        /*校园经历*/
        $(document).on("click", ".resume-school .btn-edit", function () {
            var $this = $(this);
            var id = $(this).closest(".resume-school").attr("data-id");
            var name = $(this).attr("data-name");
            var role = $(this).attr("data-role");
            var content = $.trim($(this).closest(".resume-school").find(".exp-content").html());
            var startTime = $(this).attr("data-startime");
            var endTime = $(this).attr("data-endtime");

            $(".resume-edit-school .edit-name").val(name);
            $(".resume-edit-school .edit-role").val(role);
            $(".resume-edit-school .edit-startTime").val(startTime);
            $(".resume-edit-school .edit-endTime").val(endTime);
            ue_school.setContent(content);

            $(".resume-edit-school .confirm").attr("data-type", "edit");
            $(".resume-edit-school .confirm").attr("data-id", id);
            $(".add-area").hide();
            $(".resume-r").hide();
            //移动元素
            resumeUtil.moveEditBlock($this);
            ue_school.iframe.contentWindow.document.getElementsByTagName('body')[0].innerHTML = content;   //手动对编辑框进行赋值
            $(".resume-edit-school").show();
        });
        //修改与添加
        $(document).on("click", ".resume-edit-school .confirm", function () {
            var $this = $(this);
            var value = $this.val();
            if (can_request && resumeUtil.check(".resume-edit-school")) {
                var name = $.trim($(".resume-edit-school .edit-name").val());
                var startTime = $.trim($(".resume-edit-school .edit-startTime").val());
                var endTime = $.trim($(".resume-edit-school .edit-endTime").val());
                var role = $.trim($(".resume-edit-school .edit-role").val());
                var content = ueUtil.getPlainContent(ue_school.getContent());
                if ($(this).attr("data-type") == "add") {
                    if (name && startTime && endTime && role && content) {
                        var num = school_list.length;
                        var id = num ? school_list[num - 1].id + 1 : 1;
                        var obj_pro = {
                            "id": id,
                            "name": name,
                            "role": role,
                            "startTime": startTime,
                            "endTime": endTime,
                            "content": content
                        };
                        school_list.push(obj_pro);
                        var pro_detail = JSON.stringify(school_list);
                        can_request = false;
                        $this.val("保存中...");
                        resumeUtil.update(rid,{
                            school_exp: pro_detail
                        },function (data) {
                            can_request = true;
                            $this.val(value);
                            if (data.status == 10000) {
                                var newPro =
                                    "<div class='resume-school resume-exp show-state'  data-id=" + id + ">\
                                        <div class='info clearfix'>\
                                            <span class='resume-circle'></span>\
                                            <span class='time fl'></span>\
                                            <span class='exp-name fl'></span>\
                                            <span class='exp-role fl'></span>\
                                        </div>\
                                        <div class='resume-r'>\
                                            <span class='btn-edit btn' data-startime='" + startTime + "' data-endtime='" + endTime + "' data-name='" + name + "' data-role='" + role + "' data-content='" + content + "'><span class='icon-r-edit'></span></span>\
                                            <span class='btn-delete btn'><span class='icon-r-del'></span></span>\
                                        </div>\
                                        <div class='exp-content'>" + content + "</div>\
                                    </div>";
                                $(".resume-block-school").append(newPro);
                                var school = $(".resume-school[data-id=" + id + "]");
                                $(school).find(".time").text(startTime + "~" + endTime);
                                $(school).find(".exp-name").text(name);
                                $(school).find(".exp-role").text(role);
                                $(".resume-edit-school input[type='text']").val("");
                                ue_school.setContent("");
                                $(".resume-edit-school").hide();
                                resumeUtil.showEditBtn();
                                //移动元素
                                resumeUtil.moveBlock($this);
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        });
                    }
                } else if ($(this).attr("data-type") == "edit") {
                    var id = $(this).attr("data-id");
                    for (n in school_list) {
                        if (id == school_list[n].id) {
                            school_list[n].name = name;
                            school_list[n].role = role;
                            school_list[n].startTime = startTime;
                            school_list[n].endTime = endTime;
                            school_list[n].content = content;
                            break;
                        }
                    }
                    var school_detail = JSON.stringify(school_list);
                    can_request = false;
                    $this.val("保存中...");
                    resumeUtil.update(rid,{
                        school_exp: school_detail
                    },function (data) {
                        can_request = true;
                        $this.val(value);
                        if (data.status == 10000) {
                            var school = $(".resume-school[data-id='" + id + "']");
                            $(school).find(".exp-time").text(startTime + "~" + endTime);
                            $(school).find(".exp-name").text(name);
                            $(school).find(".exp-role").text(role);
                            $(school).find(".exp-content").html(content);
                            $(school).find(".btn-edit").attr({
                                "data-startime": startTime,
                                "data-endtime": endTime,
                                "data-name": name,
                                "data-role": role,
                                "data-content": content
                            });
                            $(".resume-edit-school input[type='text']").val("");
                            ue_school.setContent("");
                            $(".resume-edit-school").hide();
                            resumeUtil.showEditBtn();
                            //移动元素
                            resumeUtil.moveBlock($this);
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }
        });
        //删除
        $(document).on("click", ".resume-school .btn-confirm-del", function () {
            var id = $(this).closest(".resume-school").attr("data-id");
            if (can_request) {
                can_request = false;
                for (n in school_list) {
                    if (id == school_list[n].id) {
                        school_list.splice(n, 1);
                        break;
                    }
                }
                var school_detail = JSON.stringify(school_list);
                resumeUtil.update(rid,{
                    school_exp: school_detail
                },function (data) {
                    can_request = true;
                    if (data.status == 10000) {
                        $(".resume-edit-school").hide();
                        var school = $(".resume-school[data-id='" + id + "']");
                        $(school).remove();
                        $(".delete-box").remove();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        /*校园经历 end*/


        /*实习经历*/
        $(document).on("click", ".resume-intern .btn-edit", function () {
            var $this = $(this);
            var id = $(this).closest(".resume-intern").attr("data-id");
            var name = $(this).attr("data-name");
            var role = $(this).attr("data-role");
            var content = $.trim($(this).closest(".resume-intern").find(".exp-content").html());
            var startTime = $(this).attr("data-startime");
            var endTime = $(this).attr("data-endtime");

            $(".resume-edit-intern .edit-name").val(name);
            $(".resume-edit-intern .edit-role").val(role);
            $(".resume-edit-intern .edit-startTime").val(startTime);
            $(".resume-edit-intern .edit-endTime").val(endTime);
            ue_intern.setContent(content);

            $(".resume-edit-intern .confirm").attr("data-type", "edit");
            $(".resume-edit-intern .confirm").attr("data-id", id);
            $(".add-area").hide();
            $(".resume-r").hide();
            //移动元素
            resumeUtil.moveEditBlock($this);
            ue_intern.iframe.contentWindow.document.getElementsByTagName('body')[0].innerHTML = content;   //手动对编辑框进行赋值
            $(".resume-edit-intern").show();
        });
        //修改与添加
        $(document).on("click", ".resume-edit-intern .confirm", function () {
            var $this = $(this);
            var value = $this.val();
            if (can_request && resumeUtil.check(".resume-edit-intern")) {
                var name = $.trim($(".resume-edit-intern .edit-name").val());
                var startTime = $.trim($(".resume-edit-intern .edit-startTime").val());
                var endTime = $.trim($(".resume-edit-intern .edit-endTime").val());
                var role = $.trim($(".resume-edit-intern .edit-role").val());
                var content = ueUtil.getPlainContent(ue_intern.getContent());
                if ($(this).attr("data-type") == "add") {
                    if (name && startTime && endTime && role && content) {
                        var num = intern_list.length;
                        var id = num ? intern_list[num - 1].id + 1 : 1;
                        var obj_pro = {
                            "id": id,
                            "name": name,
                            "role": role,
                            "startTime": startTime,
                            "endTime": endTime,
                            "content": content
                        };
                        intern_list.push(obj_pro);
                        var pro_detail = JSON.stringify(intern_list);
                        can_request = false;
                        $this.val("保存中...");
                        resumeUtil.update(rid, {
                            inter_exp: pro_detail
                        },function (data) {
                            can_request = true;
                            $this.val(value);
                            if (data.status == 10000) {
                                var newPro =
                                    "<div class='resume-intern resume-exp show-state'  data-id=" + id + ">\
                                    <div class='info clearfix'>\
                                        <span class='resume-circle'></span>\
                                        <span class='time fl'></span>\
                                        <span class='exp-name fl'></span>\
                                        <span class='exp-role fl'></span>\
                                    </div>\
                                    <div class='resume-r'>\
                                        <span class='btn-edit btn' data-startime='" + startTime + "' data-endtime='" + endTime + "' data-name='" + name + "' data-role='" + role + "' data-content='" + content + "'><span class='icon-r-edit'></span></span>\
                                        <span class='btn-delete btn'><span class='icon-r-del'></span></span>\
                                    </div>\
                                    <div class='exp-content'>" + content + "</div>\
                                </div>";
                                $(".resume-block-intern").append(newPro);
                                var intern = $(".resume-intern[data-id=" + id + "]");
                                $(intern).find(".time").text(startTime + "~" + endTime);
                                $(intern).find(".exp-name").text(name);
                                $(intern).find(".exp-role").text(role);
                                $(".resume-edit-intern input[type='text']").val("");
                                ue_intern.setContent("");
                                $(".resume-edit-intern").hide();
                                resumeUtil.showEditBtn();
                                //移动元素
                                resumeUtil.moveBlock($this);
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        });
                    }
                } else if ($(this).attr("data-type") == "edit") {
                    var id = $(this).attr("data-id");
                    for (n in intern_list) {
                        if (id == intern_list[n].id) {
                            intern_list[n].name = name;
                            intern_list[n].role = role;
                            intern_list[n].startTime = startTime;
                            intern_list[n].endTime = endTime;
                            intern_list[n].content = content;
                            break;
                        }
                    }
                    var intern_detail = JSON.stringify(intern_list);
                    can_request = false;
                    $this.val("保存中...");
                    resumeUtil.update(rid,{
                        inter_exp: intern_detail
                    },function (data) {
                        can_request = true;
                        $this.val(value);
                        if (data.status == 10000) {
                            var intern = $(".resume-intern[data-id='" + id + "']");
                            $(intern).find(".exp-time").text(startTime + "~" + endTime);
                            $(intern).find(".exp-name").text(name);
                            $(intern).find(".exp-role").text(role);
                            $(intern).find(".exp-content").html(content);
                            $(intern).find(".btn-edit").attr({
                                "data-startime": startTime,
                                "data-endtime": endTime,
                                "data-name": name,
                                "data-role": role,
                                "data-content": content
                            });
                            $(".resume-edit-intern input[type='text']").val("");
                            ue_intern.setContent("");
                            $(".resume-edit-intern").hide();
                            resumeUtil.showEditBtn();
                            //移动元素
                            resumeUtil.moveBlock($this);
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }
        });
        //删除
        $(document).on("click", ".resume-intern .btn-confirm-del", function () {
            var id = $(this).closest(".resume-intern").attr("data-id");
            if (can_request) {
                can_request = false;
                for (n in intern_list) {
                    if (id == intern_list[n].id) {
                        intern_list.splice(n, 1);
                        break;
                    }
                }
                var intern_detail = JSON.stringify(intern_list);
                resumeUtil.update(rid,{
                    inter_exp: intern_detail
                },function (data) {
                    can_request = true;
                    if (data.status == 10000) {
                        $(".resume-edit-intern").hide();
                        var intern = $(".resume-intern[data-id='" + id + "']");
                        $(intern).remove();
                        $(".delete-box").remove();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        /*实习经历 end*/

        //作品展示
        $(".resume-edit-tab li").click(function() {
           if($(this).hasClass("cur"))
               return;
            else {
               $(".resume-edit-tab li").removeClass("cur");
               $(".tab-edit-box").hide();
               $(this).addClass("cur");
               var i = $(this).index();
               $(".tab-edit-box").eq(i).show();
           }
        });

        //作品上传
        fileUpload(uid, "works-file", function (error, link) {
            if (!error && link != "undefined") {
                //图片验证
                /*if(!/.(gif|jpg|jpeg)$/.test(link)){
                    $(".input-tips").show();
                }else {
                    $(".input-tips").hide();
                    $(".resume-works-preview .loading").remove();
                    $(".resume-works-preview").attr("data-link",link);
                    $(".resume-works-preview img").css("display","block").attr("src",link);
                    $(".upload-img").text("重新上传");
                }*/
                $(".resume-works-preview .loading").remove();
                $(".resume-works-preview").attr("data-link",link);
                $(".resume-works-preview img").css("display","block").attr("src",link);
                $(".upload-img").text("重新上传");
            }
        }, function () {
            $(".resume-works-preview").append("<div class='loading'></div>");
        });

        /*作品展示 编辑 Start*/
        $(document).on("click", ".resume-works .btn-edit", function () {
            var $this = $(this);
            var id = $(this).closest(".resume-works").attr("data-id");
            var name = $(this).attr("data-name");
            var type = $(this).attr("data-works-type");
            if(type == "file") {   //上传作品
                var link = $(this).attr("data-link");
                $(".resume-edit-tab li").eq(1).removeClass("cur").addClass("banned");
                $(".resume-edit-tab li").eq(0).addClass("cur").removeClass("banned");
                $(".online-box").hide();
                $(".upload-box").show();
                $(".upload-box .works-name").val(name);
                $(".upload-box .resume-works-preview").attr("data-link",link);
                $(".upload-box .resume-works-preview img").css("display","block").attr("src",link);
                $(".upload-box .upload-img").text("重新上传");
                $(".online-box .confirm").attr("data-id", id);
            }
            if(type == "online") {    //在线作品
                var url = $(this).attr("data-url");
                $(".resume-edit-tab li").eq(0).removeClass("cur").addClass("banned");
                $(".resume-edit-tab li").eq(1).addClass("cur").removeClass("banned");
                $(".upload-box").hide();
                $(".online-box").show();
                $(".online-box .works-name").val(name);
                $(".online-box .works-url").val(url);
                $(".online-box .confirm").attr("data-id", id);
            }
            $(".resume-edit-works .confirm").attr("data-type","edit");
            $(".resume-edit-works .confirm").attr("data-id", id);
            $(".add-area").hide();
            $(".resume-r").hide();
            //移动元素
            resumeUtil.moveEditBlock($this);
            $(".resume-edit-works").show();
        });
        /*作品展示 编辑 End*/
        //作品展示 修改与添加 Start
        $(document).on("click", ".resume-edit-works .confirm", function () {
            var $this = $(this);
            var value = $this.val();
            var $editWorks= $this.parents(".tab-edit-box");
            if (can_request && resumeUtil.check($editWorks)) {
                var worksName = $.trim($this.parents(".tab-edit-box").find(".works-name").val());
                var worksType;
                if($(".resume-edit-tab li").eq(0).hasClass("cur")) {
                    worksType = "file";
                    var worksLink = $(".resume-works-preview").attr("data-link");
                }
                else {
                    worksType = "online";
                    var worksHref;
                    var worksUrl = $.trim($(".works-url").val());
                    if(!regex.url.test(worksUrl)) {
                        worksHref = "http://"+worksUrl;
                    } else {
                        worksHref = worksUrl;
                    }
                }
                if ($(this).attr("data-type") == "add") {
                    if (worksName && worksType && (worksLink || worksUrl)) {
                        var num = works_list.length;
                        var id = num ? works_list[num - 1].id + 1 : 1;
                        var obj_pro;
                        if(worksType == "file") {   //上传作品
                            obj_pro = {
                                "id": id,
                                "name": worksName,
                                "type": worksType,
                                "link": worksLink
                            };
                        }
                        if(worksType == "online") {   //在线作品
                            obj_pro = {
                                "id": id,
                                "name": worksName,
                                "type": worksType,
                                "url": worksUrl
                            };
                        }
                        works_list.push(obj_pro);
                        var pro_detail = JSON.stringify(works_list);
                        can_request = false;
                        $this.val("保存中...");
                        resumeUtil.update(rid,{
                            works: pro_detail
                        },function (data) {
                            can_request = true;
                            $this.val(value);
                            //如果添加的是上传图片
                            if (data.status == 10000) {
                                if($this.attr("data-works-type")=="file") {
                                    var newPro =
                                        "<div class ='resume-works resume-exp show-state' data-id=" + id + ">\
                                            <div class='works-img'>\
                                            <a href='"+worksLink+"' data-lightbox='works'><img class='works-img-item' src='"+worksLink+"' /></a>\
                                            </div>\
                                            <div class='info'>\
                                            <span class='exp-name'>"+worksName+"</span>\
                                            </div>\
                                            <div class='resume-r'>\
                                            <span class='btn-edit btn' data-name='"+worksName+"' data-link='"+worksLink+"' data-works-type='file'><span class='icon-r-edit'></span></span>\
                                            <span class='btn-delete btn'><span class='icon-r-del'></span></span>\
                                            </div></div>";
                                    $(".resume-block-works").append(newPro);
                                    $(".resume-edit-works input[type='text']").val("");
                                    $(".resume-edit-works .resume-works-preview").attr("data-link","");
                                    $(".resume-edit-works .resume-works-preview img").css("display","none").attr("src","");
                                }
                                //如果添加的是在线作品
                                if($this.attr("data-works-type")=="online") {
                                    var newPro =
                                        "<div class='resume-works resume-exp show-state' data-id=" + id + ">\
                                         <div class='info'>\
                                        <span class='exp-name'>"+worksName+"</span>\
                                        </div>\
                                        <div class='works-site'>\
                                        <a href='"+worksHref+"' target='_blank'>"+worksUrl+"</a>\
                                        </div>\
                                        <div class='resume-r'>\
                                        <span class='btn-edit btn' data-name='"+worksName+"' data-url='"+worksUrl+"' data-works-type='online'><span class='icon-r-edit'></span></span>\
                                        <span class='btn-delete btn'><span class='icon-r-del'></span></span>\
                                        </div></div>";
                                    $(".resume-block-works").append(newPro);
                                    $(".resume-edit-works input[type='text']").val("");
                                }
                                $(".resume-edit-works").hide();
                                resumeUtil.showEditBtn();
                                //移动元素
                                resumeUtil.moveBlock($this);
                            }else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
                        });
                    }
                } else if ($(this).attr("data-type") == "edit") {
                    var id = $(this).attr("data-id");
                    for (var n in works_list) {
                        if (id == works_list[n].id) {
                            works_list[n].name = worksName;
                            works_list[n].type = worksType;
                            if(worksType == "online") {
                                works_list[n].url = worksUrl;
                            }
                            if(worksType == "file") {
                                works_list[n].link = worksLink;
                            }
                            break;
                        }
                    }
                    var works_detail = JSON.stringify(works_list);
                    can_request = false;
                    $this.val("保存中...");
                    resumeUtil.update(rid,{
                        works: works_detail
                    },function (data) {
                        can_request = true;
                        $this.val(value);
                        if (data.status == 10000) {
                            var works = $(".resume-works[data-id='" + id + "']");
                            if($this.attr("data-works-type")=="file") {     //如果是上传图片
                                $(works).find(".exp-name").text(worksName);
                                $(works).find(".works-img-item").attr("src",worksLink);
                                $(works).find(".btn-edit").attr({
                                    "data-name": worksName,
                                    "data-works-type": worksType,
                                    "data-link": worksLink
                                });
                                $(".resume-edit-works input[type='text']").val("");
                                $(".resume-edit-works .resume-works-preview").attr("data-link","");
                                $(".resume-edit-works .resume-works-preview img").css("display","none").attr("src","");
                            }
                            if($this.attr("data-works-type")=="online") {    //如果是在线作品
                                $(works).find(".exp-name").text(worksName);
                                $(works).find(".works-site a").attr("href",worksHref).text(worksUrl);
                                $(works).find(".btn-edit").attr({
                                    "data-name": worksName,
                                    "data-works-type": worksType,
                                    "data-url": worksUrl
                                });
                                $(".resume-edit-works input[type='text']").val("");
                            }
                            $(".resume-edit-works").hide();
                            resumeUtil.showEditBtn();
                            //移动元素
                            resumeUtil.moveBlock($this);
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }

        });
        //作品展示 修改与添加  End
        //作品展示 删除 Start
        $(document).on("click", ".resume-works .btn-confirm-del", function () {
            var id = $(this).closest(".resume-works").attr("data-id");
            if (can_request) {
                can_request = false;
                for (n in works_list) {
                    if (id == works_list[n].id) {
                        works_list.splice(n, 1);
                        break;
                    }
                }
                var works_detail = JSON.stringify(works_list);
                resumeUtil.update(rid,{
                    works: works_detail
                },function (data) {
                    can_request = true;
                    if (data.status == 10000) {
                        $(".resume-edit-works").hide();
                        var works = $(".resume-works[data-id='" + id + "']");
                        $(works).remove();
                        $(".delete-box").remove();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        /*作品展示 删除 End*/

        /*自我描述修改*/
        $(".resume-self .btn-edit").click(function () {
            var content = $.trim($(".resume-self .self-content").html());
            ue_self.setContent(content);
            $(".resume-self").hide();
            $(".resume-edit-self").show();
            $(".add-area").hide();
            $(".resume-r").hide();
        });
        $(".resume-edit-self .confirm").click(function () {
            var $this = $(this);
            var value = $this.val();
            var self = $.trim(ueUtil.getPlainContent(ue_self.getContent()));
            if (can_request) {
                can_request = false;
                $this.val("保存中...");
                resumeUtil.update(rid,{
                    self_desc: self
                },function (data) {
                    can_request = true;
                    $this.val(value);
                    if (data.status == 10000) {
                        $(".resume-self .self-content").html(self);
                        $(".resume-edit-self").hide();
                        $(".resume-self, .resume-self .btn-edit").show();
                        resumeUtil.showEditBtn();
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });

        /* 个人工作状态修改*/
        $(document).on("click", ".self-state-con", function () {
            $(".self-state-list").toggle();
        });
        $(document).on("click", ".ul-self-state li", function () {
            var state = $(this).attr("data-state");
            var text = $(this).text();
            if (can_request) {
                can_request = false;
                resumeUtil.update(rid,{
                    work_state: state
                },function (data) {
                    can_request = true;
                    if (data.status == 10000) {
                        $("#self-state").val(text);
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
            $(".self-state-list").hide();
        });

        //点击删除按钮弹出框
        $(document).on("click",".btn-delete", function() {
            var $this = $(this);
            $this.parent().after("<div class='delete-box'><div class='delete-box-main'><p>确认删除本条消息吗?</p><div class='delete-box-btn'><span class='btn btn-confirm-del'>确定</span><span class='btn btn-cancel'>取消</span></div><span class='triangleBottom'></span><span class='triangleBottom2'></span></div> </div>");
        });
        $(document).on("click",".btn-cancel",function () {
            $(".delete-box").remove();
        });

    });
});

