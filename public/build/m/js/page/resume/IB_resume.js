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
require(['js/lib/IB_zepto', 'js/lib/IB_fastclick', 'js/lib/IB_fn', "js/lib/IB_reg", "js/lib/IB_fileUpload",'js/lib/IB_editor','js/lib/IB_selectScroller','js/lib/IB_citySelector','js/lib/IB_jobType',"js/lib/IB_jobTypeSelector",'js/lib/IB_dateScroller'], function ($, FastClick, fn, reg, fileUpload, editor, selectScroller, citySelector,jobType) {
    var can_request;
    var edu_list = [];
    var skill_list = [];
    var project_list = [];
    var school_list = [];
    var intern_list = [];
    var ue_self,ue_project,ue_school,ue_intern;
    var mr_integrity = 0;
    var updateUtil = {
        ajaxRequest : function(rid,option,callback){
            if(can_request){
                can_request = false;
                $.ajax({
                    type : "post",
                    url : "/api/u_resume/update/" + rid,
                    dataType:"json",
                    data:{
                        option : option
                    },
                    success: function(data){
                        can_request = true;
                        callback(data);
                    },
                    error :function(){

                    }

                })
            }
        }
    };
    var eduUtil = {
        mrEduError :function($editBlock){
            var flag = true;
            $editBlock.find(".required").each(function () {
                var $this = $(this);
                if ($this.hasClass("input") && $this.val().trim() == "") {
                    $this.next(".input-error").remove();
                    $this.after("<div class='input-error'>必填</div>");
                    flag = false;
                    return false;
                } else if ($this.hasClass("select") && $this.text().trim() == "") {
                    $this.next(".input-error").remove();
                    $this.after("<div class='input-error'>必填</div>");
                    flag = false;
                    return false;
                } else if ($this.hasClass("edu_time")) {
                    var startTime = $(".start_time_edu").text().trim().toTimeStamp();
                    var endTime = $(".end_time_edu").text().trim().toTimeStamp();
                    if (startTime >= endTime) {
                        showPopTips("毕业时间要大于入学时间");
                        flag = false;
                        return false;
                    }
                }
            });
            return flag;
        },
        addNewEdu : function(id){
            var newExpTemplate = eduUtil.getShowBlockTemplate(id);
            var $showBlockArea = $(".mr-block-edu").find(".block-content");
            var $editListArea = $(".edit-list-edu").find(".item-list-edu");
            $showBlockArea.find(".blank-tips").remove();
            $(".mr-block-edu").find(".mr-edit").show();
            $showBlockArea.append(newExpTemplate.showBlock);
            $editListArea.append(newExpTemplate.editListBlock);
        },
        changeEduInfo : function($block,data){
            $block.find(".edu-time").text(data.start_time + "~" + data.end_time);
            $block.find(".edu-school").text(data.school);
            $block.find(".edu-major").text(data.major);
            $block.find(".edu-stage").text(data.stage);
            $block.attr({
                "data-startime": data.start_time,
                "data-endtime": data.end_time,
                "data-school": data.school,
                "data-major": data.major,
                "data-stage": data.stage,
                "data-id" : data.edu_id
            });
        },
        getShowBlockTemplate:function(id){
            var blockTemplate = {};
            blockTemplate.showBlock = "<div class='mr-info-edu mr-info-detail' data-id='"+id+"'>\
                                           <div class='circle'></div>\
                                           <div class='edu-time'></div>\
                                           <div><span class='info-title'>学校名称&nbsp;:</span><span class='edu-school'></span></div>\
                                           <div><span class='info-title'>学<span class='tw'></span>历&nbsp;:</span><span class='edu-stage'></span></div>\
                                           <div><span class='info-title'>专业名称&nbsp;:</span><span class='edu-major'></span></div>\
                                      </div>";
            blockTemplate.editListBlock = "<li class='item item-edu' data-id='"+id+"'>\
                                             <span class='mr-edit'></span>\
                                             <ul class='item-detail'>\
                                                <li class='edu-time'></li>\
                                                <li class='edu-school'></li>\
                                                <li class='edu-stage'></li>\
                                                <li class='edu-major'></li>\
                                             </ul>\
                                           </li>";
            return blockTemplate;
        }
    };
    var expUtil = {
        mrExpError : function($editBlock){
            var flag = true;
            $editBlock.find(".required").each(function () {
                var $this = $(this);
                if ($this.hasClass("input") && $this.val().trim() == "") {
                    $this.next(".input-error").remove();
                    $this.after("<div class='input-error'>必填</div>");
                    flag = false;
                    return false;
                } else if ($this.hasClass("select") && $this.text().trim() == "") {
                    $this.next(".input-error").remove();
                    $this.after("<div class='input-error'>必填</div>");
                    flag = false;
                    return false;
                }else if($this.hasClass("editor") && $this.html().trim() == ""){
                    showPopTips("请填写经历描述");
                    flag = false;
                    return false;
                }
                if (!flag) {
                    return false;
                }
            });
            return flag;
        },
        getExpOption : function(exp_type){
            var exp_option = {};
            switch(exp_type){
                case "project" :
                    exp_option.ue = ue_project;
                    exp_option.exp_list = project_list;
                    exp_option.option_name = "project_exp";
                    break;
                case "school" :
                    exp_option.ue = ue_school;
                    exp_option.exp_list = school_list;
                    exp_option.option_name = "school_exp";
                    break;
                case "intern" :
                    exp_option.ue = ue_intern;
                    exp_option.exp_list = intern_list;
                    exp_option.option_name = "inter_exp";
                    break;
            }
            return exp_option;
        },
        getExpAjaxData : function(exp_type,data){
            var option = {};
            switch(exp_type){
                case "project" :
                    option.project_exp = data;
                    break;
                case "school" :
                    option.school_exp = data;
                    break;
                case "intern" :
                    option.inter_exp = data;
                    break;
            }
            return option;
        },
        changExpInfo : function($block,data){
            $block.find(".exp-time").text(data.startTime + "~" + data.endTime);
            $block.find(".exp-name").text(data.name);
            $block.find(".exp-role").text(data.role);
            $block.find(".exp-content").html(data.content);
            $block.attr({
                "data-id":data.id,
                "data-startime": data.startTime,
                "data-endtime": data.endTime,
                "data-name": data.name,
                "data-role": data.role,
                "data-content": data.content
            });
        },
        addNewExp : function(type,id){
            var newExpTemplate = expUtil.getShowBlockTemplate(id);
            var $showBlockArea = $(".mr-block-"+type).find(".block-content");
            var $editListArea = $(".edit-list-"+type).find(".item-list-exp");
            $showBlockArea.find(".blank-tips").remove();
            $showBlockArea.append(newExpTemplate.showBlock);
            $editListArea.append(newExpTemplate.editListBlock);
        },
        getShowBlockTemplate:function(id){
            var blockTemplate = {};
            blockTemplate.showBlock = "<div class='mr-info-detail mr-exp' data-id='"+id+"'>\
                                <div class='exp-title exp-name'></div>\
                                <div class='clearfix'>\
                                    <div class='exp-l fll'>时间&nbsp;:</div><div class='exp-r fll exp-time'></div>\
                                </div>\
                                <div class='clearfix'>\
                                    <div class='exp-l fll'>职务&nbsp;:</div><div class='exp-r fll exp-role'></div>\
                                </div>\
                                 <div class='clearfix'>\
                                    <div class='exp-l fll'>职责&nbsp;:</div><div class='exp-r fll exp-content'></div>\
                                </div>\
                             </div>";
            blockTemplate.editListBlock = "<li class='item item-exp' data-id='"+id+"'>\
                                    <span class='mr-edit'></span>\
                                    <ul class='item-detail'>\
                                        <li class='exp-time'></li>\
                                        <li class='exp-name'></li>\
                                        <li class='exp-role'></li>\
                                        <li class='exp-content'></li>\
                                    </ul>\
                                </li>";
            return blockTemplate;
        },
        getBlankTips : function(type){
            var _blank_tips = "";
            switch (type){
                case "project": _blank_tips = "<p class='blank-tips'>描述参与过的项目经历，使你更具竞争力<i></i></p>";break;
                case "school": _blank_tips = "<p class='blank-tips'>展现你独有的校园风采<i></i></p>";break;
                case "intern": _blank_tips = "<p class='blank-tips'>添加实习经历，为自己增加砝码<i></i></p>";break;
            }
            return _blank_tips;
        }
    };
    var skillUtil = {
        mrSkillError :function($editBlock){
            var flag = true;
            $editBlock.find(".required").each(function () {
                var $this = $(this);
                if ($this.val().trim() == "") {
                    $this.next(".input-error").remove();
                    $this.after("<div class='input-error'>必填</div>");
                    flag = false;
                    return false;
                }
            });
            return flag;
        },
        addNewSkill : function(id){
            var newExpTemplate = skillUtil.getShowBlockTemplate(id);
            var $showBlockArea = $(".mr-block-skill").find(".block-content");
            var $editListArea = $(".edit-list-skill").find(".item-list-skill");
            $showBlockArea.find(".blank-tips").remove();
            $(".mr-block-skill").find(".mr-edit").show();
            $showBlockArea.append(newExpTemplate.showBlock);
            $editListArea.append(newExpTemplate.editListBlock);
        },
        changeSkillInfo : function(skill_id,skill){
            var $showBlock = $(".mr-block-skill").find(".mr-skill[data-id='"+skill_id+"'] span");
            $showBlock.text(skill);
            var $editListBlock = $(".edit-list-skill").find(".item-skill[data-id='"+skill_id+"']");
            $editListBlock.attr("data-name",skill);
            $editListBlock.find(".skill-detail").text(skill);
        },
        getBlankTips : function(){
            return "<p class='blank-tips'>快添上，让用人单位知道你有什么傍身技能<i></i></p>";
        },
        getShowBlockTemplate:function(id){
            var blockTemplate = {};
            blockTemplate.showBlock = " <div data-id='"+id+"' class='mr-skill'><i class='circle'></i><span></span></div>";
            blockTemplate.editListBlock = "<li class='item item-skill' data-id='"+id+"'>\
                                               <span class='mr-edit'></span>\
                                               <div class='skill-detail'></div>\
                                            </li>";
            return blockTemplate;
        }
    };
    var hopeUtil = {
        jtInitial : function(idArr){
            var type_id = idArr;
            var type_text = [];
            var selected_num = type_id[0]?type_id.length:0;
            $(".selector-jt").find(".selected-num").text(selected_num);
            for(var i=0,len=type_id.length;i<len;i++){
                var pid = parseInt(type_id[i].substring(0,1))-1;
                var sid = parseInt(type_id[i].substring(1)) ;
                if(pid > -1 && sid > -1) {
                    type_text.push(jobType[pid].sub_types[sid].group_name);
                }

                var $subType = $(".selector-jt .sub-type[data-id='"+type_id[i]+"']");
                $subType.addClass("on");
            }
            $(".mr-hope-position-type,.position-type").text(type_text.toString());
        },
        internExpectInitial : function(){
            var min_payment_type = parseInt($(".payment").attr("data-type"));
            var payment_text = ["不限","50以下","50-100","100-200","200-500","500以上"];
            var pt = 0;
            switch(min_payment_type){
                case 0 :  pt=0;break;
                case 1 :  pt=1;break;
                case 50 :  pt=2;break;
                case 100 :  pt=3;break;
                case 200:  pt=4;break;
                case 500:  pt=5;break;
                default : pt=0;
            }
            $(".payment,.mr-hope-payment").text(payment_text[pt]);

            var days_type = parseInt($(".days").attr("data-type"));
            var days_text = ["1-2天","3天","4天","5天","6-7天"];
            $(".days,.mr-hope-days").text(days_text[days_type-1]);

            var dur_type = parseInt($(".duration").attr("data-type"));
            var dur_text = ["1个月以下","2个月","3个月","3个月以上"];
            $(".duration,.mr-hope-duration").text(dur_text[dur_type-1]);
        }
    };
    function showPopTips(tips){
        $(".popTips").show().text(tips).addClass("fadeIn");
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
    function mrCreateError(requiredInput) {
        if ($(requiredInput).hasClass("input") && $(requiredInput).val().trim() == "") {
            $(requiredInput).next(".input-error").remove();
            $(requiredInput).after("<div class='input-error'>必填</div>");
            return false;
        } else if ($(requiredInput).hasClass("select") && $(requiredInput).text().trim() == "") {
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
    function getEduStage(stage){
        switch(stage){
            case "大专": return 1;
            case "本科" : return 2;
            case "硕士" : return 3;
            case "博士及以上" : return 4;
            case "其他" : return 5;
        }
    }
    function removeEditBlock($editBlock){
        $(".mr").css({"opacity":"1"/*,"position":"static"*/});
        $editBlock.removeClass("flipRight").addClass("flipRightOut");
        setTimeout(function () {
            $editBlock.removeClass("flipRightOut").hide();
        }, 600);
    }
    function showEditBlock($editBlock){
        $editBlock.show().addClass("animation_600 flipRight");
        setTimeout(function () {
            $(".mr").css({"opacity":"0"/*,"position":"absolute"*/});
            pageScroll();
        }, 600);

    }
    function pageScroll() {
        window.scrollBy(0, -20);
        var scrollTimer = setTimeout(function() {
            pageScroll();
        }, 1);
        if ($(window).scrollTop() == 0) {
            clearTimeout(scrollTimer);
        }
    }

    $(function () {
        FastClick.attach(document.body);
        can_request = true;
        var forward = decodeURIComponent(fn.getQueryString("forward"));
        if (forward && forward.indexOf("resumeCreate") == -1) {
            $(".header .back").attr("href", forward);
        } else {
            $(".header .back").attr("href", "/userCenter");
        }

        //小键盘bugfix
        $('.required').bind('focus',function(){
            pageScroll();
        });
        try{
            edu_list = JSON.parse(global.edu_list);
        }catch(e){}
        try{
            skill_list = JSON.parse(global.skill_list);
        }catch(e){}
        try{
            project_list = JSON.parse(global.project_exp);
        }catch(e){}
        try{
            school_list = JSON.parse(global.school_exp);
        }catch(e){}
        try{
            intern_list = JSON.parse(global.intern_exp);
        }catch(e){}
        mr_integrity = parseInt(global.mr_integrity);

        /*editor*/
        ue_self = $(".self-editor").editor();
        ue_project = $(".pro-editor").editor();
        ue_school = $(".school-editor").editor();
        ue_intern = $(".intern-editor").editor();
        /*editor*/

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
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#edu-start").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#edu-end').attr("data-date", '2016-06').dateScroller({
            title: '毕业时间',
            date: '2016-06',
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#edu-end").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#start-time-project').attr("data-date", '2016-06').dateScroller({
            title: '开始时间',
            date: '2006-06',
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#start-time-project").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#end-time-project').attr("data-date", '2016-06').dateScroller({
            title: '结束时间',
            date: '2006-06',
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#end-time-project").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#start-time-school').attr("data-date", '2016-06').dateScroller({
            title: '开始时间',
            date: '2006-06',
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#start-time-school").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#end-time-school').attr("data-date", '2016-06').dateScroller({
            title: '结束时间',
            date: '2006-06',
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#end-time-school").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#start-time-intern').attr("data-date", '2016-06').dateScroller({
            title: '开始时间',
            date: '2006-06',
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#start-time-intern").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
            }
        });
        $('#end-time-intern').attr("data-date", '2016-06').dateScroller({
            title: '结束时间',
            date: '2006-06',
            dateSpan: 10,//默认前后10年
            confirm: function (data) {
                $("#end-time-intern").attr("data-date", data.date).find(".required").text(data.date.replace("-","."));
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

        /*scroll-selector*/
        $(".sex").selectScroller("iscroll-sex");
        $(".stage").selectScroller("iscroll-edu");
        $(".payment").selectScroller("iscroll-payment");
        $(".days").selectScroller("iscroll-days");
        $(".duration").selectScroller("iscroll-duration");
        $(".mr-state").selectScroller("iscroll-state");
        /*scroll-selector*/

        var uid = $(".mr").attr("data-uid");
        var rid = $(".mr").attr("data-rid");
        if (window.localStorage && localStorage.getItem("noticed") == uid) {
            $(".top-tips").hide();
        } else {
            $(".top-tips").show();
        }

        $(".edit-block").addClass("animation_600");
        $(".top-tips .btn-close").on("click", function (e) {
            e.preventDefault();
            $(this).closest(".top-tips").hide();
            localStorage.setItem("noticed", uid);
        });
        $(".required").on("click", function () {
            $(this).next(".input-error").remove();
        });

        $(".btn").data("click", true);
        $(".btn-area .btn-console").on("click", function (e) {
            e.preventDefault();
            var _step = $(this).closest(".step");
            $(_step).removeClass("flipRight").addClass("flipRightOut");
            $(".mr").show();
            setTimeout(function () {
                $(_step).removeClass("flipRightOut").css({"opacity": 1}).hide();
            }, 600);
        });

        //选填内容
        $(".btn-switch").click(function(){
           var $this = $(this);
           if($this.hasClass("open")){
               $(".optional-content").show();
               $this.removeClass("open").addClass("close");
               $this.find("p").text("收起选填内容");
           }else if($this.hasClass("close")){
               $(".optional-content").hide();
               $this.removeClass("close").addClass("open");
               $this.find("p").text("展开选填内容");
           }
        });

        //头像上传
        fileUpload(uid, 'file-avatar', function (err, avatar) {
            if (!err) {
                updateUtil.ajaxRequest(rid,{
                    avatar : avatar
                },function(data){
                    if (data.status == 10000) {
                        var img = document.createElement('img');
                        img.src = avatar;
                        img.onload = function () {
                            $(".mr-avatar").removeClass('loading-img').css({"background-image": "url('" + avatar + "')"});
                        };
                        //  $(".mr-avatar").css({"background-image": "url('" + avatar + "')"}).removeClass("loading-img");
                    } else if (data.status == 10005) {
                        $(".popTips").show().text("服务器错误,请稍后重试").addClass("fadeIn");
                        setTimeout(function () {
                            $(".popTips").removeClass("fadeIn");
                        }, 1000);
                    }
                });
            }
        }, function () {
            $(".mr-avatar").addClass('loading-img');
        });

        //基本信息修改
        $(".mr-edit-base").on("click", function () {
            showEditBlock($(".edit-block-base"));
        });
        $(".edit-block-base .confirm").on("click", function (e) {
            e.preventDefault();
            var flag = true;
            $(".edit-block-base .required").each(function () {
                flag = mrCreateError($(this));
                if (!flag) {
                    return false;
                }
            });
            if (flag) {
                var name = $(".name").val().trim();//姓名
                var phone = $(".phone").val().trim();//手机号
                var email = $(".email").val().trim();//邮箱
                var male = parseInt($(".sex").attr("data-type"));//性别
                var address = $(".address").text().trim();//籍贯
                var birthday = $(".birthday").text().trim().toTimeStamp();//生日
                updateUtil.ajaxRequest(rid,{
                    name: name,
                    phone: phone,
                    email: email,
                    male: male,
                    address: address,
                    birthday: birthday
                },function(data){
                    if (data.status == 10000) {
                        $(".mr-name").text(name);
                        $(".mr-birth").text(new Date(birthday).format("yyyy.MM"));
                        $(".mr-city").text(address);
                        $(".mr-phone").text(phone);
                        $(".mr-email").text(email);
                        $(".mr-sex").text(male ? "男" : "女");
                        removeEditBlock($(".edit-block-base"));
                    } else if (data.status == 10003 || data.status == 10006) {
                        showPopTips("服务器错误,请稍后重试");
                    }
                });
            }
        });

        //期望实习修改
        hopeUtil.jtInitial($(".position-type").attr("data-id").split(","));
        hopeUtil.internExpectInitial();
        $(".mr-edit-hope").on("click", function (e) {
            showEditBlock($(".edit-block-hope"));
        });
        $(".edit-block-hope .confirm").on("click", function (e) {
            e.preventDefault();
            var flag = true;
            $(".edit-block-hope .required").each(function () {
                flag = mrCreateError($(this));
                if (!flag) {
                    return false;
                }
            });
            if (flag) {
                var intern_expect = {};
                intern_expect.city = $(".hope-city").text().trim();//实习地点
                intern_expect.city_id = $(".hope-city").attr("data-cid");//实习地点
                intern_expect.position = $(".position").val().trim();//实习岗位
                intern_expect.position_type = $(".position-type").text().trim();//实习岗位
                intern_expect.payment = $(".payment").text().trim();//实习薪资
                intern_expect.days = $(".days").text().trim();//每周实习
                intern_expect.duration = $(".duration").text().trim();//连续实习

                var intern_expect_cid = $(".hope-city").attr("data-cid");
                var intern_expect_city =  $(".hope-city").text().trim();
                var intern_expect_position = $(".position").val().trim();
                var intern_expect_dur_type = $(".duration").attr("data-type");
                var intern_expect_days_type = $(".days").attr("data-type");
                var intern_expect_min_payment = $(".payment").attr("data-type");
                var intern_expect_position_type = $(".position-type").attr("data-id");
                updateUtil.ajaxRequest(rid,{
                    intern_expect: JSON.stringify(intern_expect),
                    intern_expect_cid : intern_expect_cid,
                    intern_expect_city : intern_expect_city,
                    intern_expect_position : intern_expect_position,
                    intern_expect_dur_type : intern_expect_dur_type,
                    intern_expect_days_type : intern_expect_days_type,
                    intern_expect_min_payment : intern_expect_min_payment,
                    intern_expect_position_type:intern_expect_position_type
                },function(data){
                    if (data.status == 10000) {
                        $(".mr-hope-city").text(intern_expect.city);
                        $(".mr-hope-position").text(intern_expect.position);
                        $(".mr-hope-position-type").text(intern_expect.position_type);
                        $(".mr-hope-payment").text(intern_expect.payment);
                        $(".mr-hope-days").text(intern_expect.days);
                        $(".mr-hope-duration").text(intern_expect.duration);
                        removeEditBlock($(".edit-block-hope"));
                    } else if (data.status == 10003 || data.status == 10006) {
                        showPopTips("服务器错误,请稍后重试");
                    }
                });
            }
        });

        //教育经历修改
        $(".mr-block-edu .mr-edit").click(function(){
            showEditBlock($(".edit-list-edu"));
        });
        $(".edit-list-edu .btn-add").click(function(){
            var $editBlock = $(".edit-block-edu");
            $editBlock.find(".btn-del").attr("data-type","0").hide();
            $editBlock.find(".confirm").attr("data-type","add");
            $editBlock.find(".required").text("").val("");
            showEditBlock($editBlock);
        });
        $(document).on("click",".item-edu .mr-edit", function () {
            var _edu = $(this).closest(".item");
            var $editBlock = $(".edit-block-edu");
            $editBlock.attr("data-id",$(_edu).attr("data-id"));
            $editBlock.find(".confirm").attr("data-type","edit");
            $editBlock.find(".school").val($(_edu).attr("data-school"));
            $editBlock.find(".major").val($(_edu).attr("data-major"));
            $editBlock.find(".stage").text($(_edu).attr("data-stage"));
            $editBlock.find(".start_time_edu").text($(_edu).attr("data-startime"));
            $editBlock.find(".end_time_edu").text($(_edu).attr("data-endtime"));
            if(edu_list.length>1){
                $(".edit-block-edu .btn-del").attr("data-type",1).show();
            }else{
                $(".edit-block-edu .btn-del").attr("data-type",0).hide();
            }
            showEditBlock($editBlock);
        });
        $(".mr-add-edu").on("click", function (e) {
            e.preventDefault();
            var eid = edu_list.length > 0 ? parseInt(edu_list[edu_list.length - 1].edu_id)+1 : 1;
            $(".edit-block-edu .confirm").attr({"data-eid":eid,"data-type":"add"});
            $(".content-line .school").val("");
            $(".content-line .major").val("");
            $(".content-line .stage").text("");
            $(".content-line .start_time").text("");
            $(".content-line .end_time").text("");
            $(".edit-block-edu .btn-delete").hide();
            showEditBlock($(".edit-block-edu"));
        });
        $(".edit-block-edu .confirm").on("click", function () {
            var edit_type = $(this).attr("data-type");
            var $editBlock = $(this).closest(".edit-block-edu");
            var highest_degree_stage = getEduStage(edu_list[0].stage);
            if (eduUtil.mrEduError($editBlock) && can_request) {
                var edu_info = {};
                edu_info.school = $editBlock.find(".school").val();
                edu_info.major = $editBlock.find(".major").val();
                edu_info.stage = $editBlock.find(".stage").text();
                edu_info.start_time = $editBlock.find(".start_time_edu").text();
                edu_info.end_time = $editBlock.find(".end_time_edu").text();
                if(edit_type=="edit"){
                    var edu_id = $editBlock.attr("data-id");
                    edu_info.edu_id = edu_id;
                    for (edu in edu_list) {
                        if (edu_id == edu_list[edu].edu_id) {
                            edu_list[edu].school = edu_info.school;
                            edu_list[edu].major = edu_info.major;
                            edu_list[edu].stage = edu_info.stage;
                            edu_list[edu].start_time = edu_info.start_time;
                            edu_list[edu].end_time = edu_info.end_time;
                            if(edu == 0){
                                highest_degree_stage = getEduStage(edu_info.stage);
                            }
                            break;
                        }
                    }
                    var education_detail = JSON.stringify(edu_list);
                    updateUtil.ajaxRequest(rid,{
                        education_detail : education_detail,
                        highest_degree_stage : highest_degree_stage
                    },function(data){
                        if (data.status == 10000) {
                            var $showBlock = $(".mr-block-edu").find(".mr-info-edu[data-id='"+ edu_id+"']");
                            eduUtil.changeEduInfo($showBlock,edu_info);
                            var $editListBlock = $(".edit-list-edu").find(".item-edu[data-id='"+ edu_id+"']");
                            eduUtil.changeEduInfo($editListBlock,edu_info);
                            removeEditBlock($(".edit-block-edu"));
                        } else if (data.status == 10003 || data.status == 10006) {
                            showPopTips("服务器错误,请稍后重试");
                        }
                    });
                }else if(edit_type=="add"){
                    var id = edu_list.length? parseInt(edu_list[edu_list.length - 1].edu_id)+1 : 1;
                    edu_info.edu_id = id;
                    edu_list.push(edu_info);
                    var education_detail = JSON.stringify(edu_list);
                    updateUtil.ajaxRequest(rid,{
                        education_detail: education_detail
                    },function(data){
                        if (data.status == 10000) {
                            eduUtil.addNewEdu(id);
                            var $showBlock = $(".mr-block-edu").find(".mr-info-edu[data-id='"+ id+"']");
                            eduUtil.changeEduInfo($showBlock,edu_info);
                            var $editListBlock = $(".edit-list-edu").find(".item-edu[data-id='"+ id+"']");
                            eduUtil.changeEduInfo($editListBlock,edu_info);
                            removeEditBlock($(".edit-block-edu"));
                        } else if (data.status == 10003 || data.status == 10006) {
                            showPopTips("服务器错误,请稍后重试");
                        }
                    });
                }
            }
        });
        $(".edit-block-edu .btn-del").on("click",function(){
            var $editBlock = $(this).closest(".edit-block-edu");
            var edu_id = $editBlock.attr("data-id");
            var highest_degree_stage = getEduStage(edu_list[0].stage);
            for (edu in edu_list) {
                if (edu_id == edu_list[edu].edu_id) {
                    if(edu == 0){
                        highest_degree_stage = getEduStage(edu_list[1].stage);
                    }
                    edu_list.splice(edu, 1);
                    break;
                }
            }
            var education_detail = JSON.stringify(edu_list);
            if(parseInt($(this).attr("data-type"))){
                updateUtil.ajaxRequest(rid, {
                    education_detail : education_detail,
                    highest_degree_stage :  highest_degree_stage
                },function(data){
                    if (data.status == 10000) {
                        var $showBlock = $(".mr-block-edu").find(".mr-info-edu[data-id='"+ edu_id+"']");
                        var $editListBlock = $(".edit-list-edu").find(".item-edu[data-id='"+ edu_id+"']");
                        $showBlock.remove();
                        $editListBlock.remove();
                        removeEditBlock($editBlock);
                    } else if (data.status == 10003 || data.status == 10006) {
                        showPopTips("服务器错误,请稍后重试");
                    }
                });
            }
        });


        $(".edit-block .back").click(function(){
            var $editBlock = $(this).closest(".edit-block");
            removeEditBlock($editBlock);
        });
        $(".edit-list .confirm").click(function(){
            removeEditBlock($(this).closest(".edit-list"));
        });
        $(document).on("click",".edit-list .btn-add,.blank-tips",function(){
            var type = "";
            if($(this).hasClass("btn-add")){
                type = $(this).closest(".edit-list").attr("data-type");
            }else{
                type = $(this).closest(".mr-block").attr("data-type");
            }
            var $editBlock = $(".edit-block-"+type);
            $editBlock.find(".btn-del").attr("data-type","0").hide();
            $editBlock.find(".confirm").attr("data-type","add");
            $editBlock.find(".required").text("").val("");
            $editBlock.find(".exp-editor").html("");
            showEditBlock($editBlock);
        });
        //技能修改
        $(".mr-block-skill .mr-edit").click(function(){
            showEditBlock($(".edit-list-skill"));
        });
        $(document).on("click",".item-skill .mr-edit",function(){
            var $exp = $(this).closest(".item-skill");
            var id =  $exp.attr("data-id");
            var name =  $exp.attr("data-name");

            var $editBlock = $(".edit-block-skill");
            $editBlock.find(".btn-del").attr("data-type","1").show();
            $editBlock.find(".skill-name").val(name);
            $editBlock.find(".confirm").attr("data-type","edit");
            $editBlock.attr("data-id",id);
            showEditBlock($editBlock);
        });
        $(".edit-block-skill .confirm").click(function(){
            var $editBlock = $(this).closest(".edit-block-skill");
            var edit_type = $(this).attr("data-type");
            var flag = skillUtil.mrSkillError($editBlock);
            if(flag && can_request){
                var num = skill_list.length;
                var skill = $editBlock.find(".skill-name").val().trim();
                if(edit_type == "edit"){
                    var skill_id = $editBlock.attr("data-id");
                    for (n in skill_list) {
                        if (skill_id == skill_list[n].skill_id) {
                            skill_list[n].skill = skill;
                            break;
                        }
                    }
                    var skill_detail = JSON.stringify(skill_list);
                    updateUtil.ajaxRequest(rid,{
                        skill: skill_detail
                    },function(data){
                        if(data.status == 10000){
                            skillUtil.changeSkillInfo(skill_id,skill);
                            removeEditBlock($editBlock);
                        }
                    });
                }else if(edit_type == "add"){
                    var skill_id = num ? skill_list[num - 1].skill_id + 1 : 1;
                    var obj_skill = {
                        "skill_id": skill_id,
                        "skill": skill
                    };
                    skill_list.push(obj_skill);
                    var skill_detail = JSON.stringify(skill_list);
                    updateUtil.ajaxRequest(rid,{
                        skill: skill_detail
                    },function(data){
                        if(data.status == 10000){
                            skillUtil.addNewSkill(skill_id);
                            skillUtil.changeSkillInfo(skill_id,skill);
                            removeEditBlock($editBlock);
                        }
                    });
                }
            }
        });
        $(".edit-block-skill .btn-del").click(function(){
            var $editBlock = $(this).closest(".edit-block-skill");
            var skill_id = $editBlock.attr("data-id");
            for (n in skill_list) {
                if (skill_id == skill_list[n].skill_id) {
                    skill_list.splice(n, 1);
                    break;
                }
            }
            var skill_detail = JSON.stringify(skill_list);
            updateUtil.ajaxRequest(rid,{
                skill: skill_detail
            },function(data){
                if(data.status == 10000){
                    var $showBlock = $(".mr-block-skill").find(".mr-skill[data-id='"+skill_id+"']");
                    $showBlock.remove();
                    var $editListBlock = $(".edit-list-skill").find(".item-skill[data-id='"+skill_id+"']");
                    $editListBlock.remove();
                    if(!skill_list.length){
                        $(".mr-block-skill").find(".block-content").append(skillUtil.getBlankTips());
                        $(".mr-block-skill").find(".mr-edit").hide();
                        removeEditBlock($(".edit-list-skill"));
                    }
                    removeEditBlock($editBlock);
                }
            });
        });
        //项目经历，校园经历，实习经历修改
        $(".mr-block-exp .mr-edit").click(function(){
           var $editListBlock = $(".edit-list-"+$(this).closest(".mr-block").attr("data-type"));
           $editListBlock.find(".confirm").attr("data-type","edit");
           showEditBlock($editListBlock);
        });
        $(document).on("click",".item-exp .mr-edit",function(){
            var $exp = $(this).closest(".item-exp");
            var id =  $exp.attr("data-id");
            var name =  $exp.attr("data-name");
            var role =  $exp.attr("data-role");
            var content = $.trim($exp.attr("data-content"));
            var startTime = $exp.attr("data-startime");
            var endTime = $exp.attr("data-endtime");

            var type = $exp.closest(".edit-list").attr("data-type");
            var $editBlock = $(".edit-block-"+type);
            $editBlock.find(".btn-del").attr("data-type","1");
            $editBlock.find(".exp-name").val(name);
            $editBlock.find(".exp-role").val(role);
            $editBlock.find(".exp-startTime").text(startTime);
            $editBlock.find(".exp-endTime").text(endTime);
            $editBlock.find(".exp-editor").html(content);
            $editBlock.find(".confirm").attr("data-type","edit");
            $editBlock.attr("data-id",id);
            $editBlock.find(".btn-del").show();
            showEditBlock($editBlock);
        });
        $(".edit-block-exp .confirm").click(function(){
            var $editBlock = $(this).closest(".edit-block-exp");
            var exp_type = $editBlock.attr("data-type");
            var edit_type = $(this).attr("data-type");
            var flag = expUtil.mrExpError($editBlock);
            if(flag && can_request){
               var exp_option = expUtil.getExpOption(exp_type);
               var exp_info = {};
               exp_info.name = $editBlock.find(".exp-name").val().trim();
               exp_info.role = $editBlock.find(".exp-role").val().trim();
               exp_info.startTime = $editBlock.find(".exp-startTime").text().trim();
               exp_info.endTime = $editBlock.find(".exp-endTime").text().trim();
               exp_info.content = exp_option.ue.getValue();
               if(edit_type == "edit"){
                   var id = $editBlock.attr("data-id");
                   exp_info.id = id;
                   for (n in exp_option.exp_list) {
                       if (id == exp_option.exp_list[n].id) {
                           exp_option.exp_list[n].id = exp_info.id;
                           exp_option.exp_list[n].name = exp_info.name;
                           exp_option.exp_list[n].role = exp_info.role;
                           exp_option.exp_list[n].startTime = exp_info.startTime;
                           exp_option.exp_list[n].endTime = exp_info.endTime;
                           exp_option.exp_list[n].content = exp_info.content;
                           break;
                       }
                   }
                   var exp_detail = JSON.stringify(exp_option.exp_list);
                   updateUtil.ajaxRequest(rid,expUtil.getExpAjaxData(exp_type,exp_detail),function(data){
                       if(data.status == 10000){
                           var $showBlock = $(".mr-block-"+exp_type).find(".mr-exp[data-id='"+id+"']");
                           expUtil.changExpInfo($showBlock,exp_info);
                           var $editListBlock = $(".edit-list-"+exp_type).find(".item-exp[data-id='"+id+"']");
                           expUtil.changExpInfo($editListBlock,exp_info);
                           removeEditBlock($editBlock);
                       }
                   });
               }else if(edit_type == "add"){
                   var num = exp_option.exp_list.length;
                   var id = num ? +exp_option.exp_list[num - 1].id + 1 : 1;
                   exp_info.id = id;
                   var new_exp_info = {
                       "id": exp_info.id,
                       "name": exp_info.name,
                       "role": exp_info.role,
                       "startTime": exp_info.startTime,
                       "endTime": exp_info.endTime,
                       "content": exp_info.content
                   };
                   exp_option.exp_list.push(new_exp_info);
                   var exp_detail = JSON.stringify(exp_option.exp_list);
                   updateUtil.ajaxRequest(rid,expUtil.getExpAjaxData(exp_type,exp_detail),function(data){
                       if(data.status == 10000){
                           expUtil.addNewExp(exp_type,id);
                           var $showBlockArea = $(".mr-block-"+exp_type);
                           var $showBlock = $showBlockArea.find(".mr-exp[data-id='"+id+"']");
                           $showBlockArea.find(".mr-edit").show();
                           expUtil.changExpInfo($showBlock,exp_info);
                           var $editListBlock = $(".edit-list-"+exp_type).find(".item-exp[data-id='"+id+"']");
                           expUtil.changExpInfo($editListBlock,exp_info);
                           removeEditBlock($editBlock);
                       }
                   });
               }
            }
        });
        $(".edit-block-exp .btn-del").click(function(){
            var $editBlock = $(this).closest(".edit-block-exp");
            var exp_type = $editBlock.attr("data-type");
            var id = $editBlock.attr("data-id");
            var exp_option = expUtil.getExpOption(exp_type);
            for (n in exp_option.exp_list) {
                if (id == exp_option.exp_list[n].id) {
                    exp_option.exp_list.splice(n, 1);
                    break;
                }
            }
            var exp_detail = JSON.stringify(exp_option.exp_list);
            updateUtil.ajaxRequest(rid,expUtil.getExpAjaxData(exp_type,exp_detail),function(data){
                if(data.status == 10000){
                    var $showBlock = $(".mr-block-"+exp_type).find(".mr-exp[data-id='"+id+"']");
                    $showBlock.remove();
                    var $editListBlock = $(".edit-list-"+exp_type).find(".item-exp[data-id='"+id+"']");
                    $editListBlock.remove();
                    if(!exp_option.exp_list.length){
                        $(".mr-block-"+exp_type).find(".block-content").append(expUtil.getBlankTips(exp_type));
                        $(".mr-block-"+exp_type).find(".mr-edit").hide();
                        removeEditBlock($(".edit-list-"+exp_type));
                    }
                    removeEditBlock($editBlock);
                }
            });
        });

        //自我评价修改
        $(document).on("click",".mr-edit-self,.mr-block-self .blank-tips",function(){
            $(".self-editor").html($(".mr-self").html());
            $(".edit-block-self").show().addClass("animation_600 flipRight");
        });
        $(".edit-block-self .confirm").click(function(){
            var self_desc = $.trim(ue_self.getValue());
            updateUtil.ajaxRequest(rid, {
                self_desc : self_desc
            },function(data){
                if(data.status == 10000){
                    if(self_desc){
                        $(".mr-self").html(self_desc);
                        $(".mr-block-self").find(".blank-tips").remove();
                        $(".mr-block-self").find(".mr-edit").show();
                    }else{
                        $(".mr-self").html("");
                        $(".mr-block-self").find(".blank-tips").remove();
                        $(".mr-block-self").find(".block-content").append("<p class='blank-tips'>还原一个真实的你，吸引更多的目光<i></i></p>");
                        $(".mr-block-self").find(".mr-edit").hide();
                    }
                    removeEditBlock($(".edit-block-self"));
                }else if (data.status == 10003 || data.status == 10006) {
                    showPopTips("服务器错误,请稍后重试");
                }
            });

        });

        //求职状态修改
        $(".sel-state .sel-option-confirm").click(function(){
            var $selected = $(".sel-state").find(".selected");
            var state_type = $selected.attr("data-type");
            var state = $selected.text().trim();
            updateUtil.ajaxRequest(rid,{
                work_state:state_type
            },function(data){
                if (data.status == 10000) {
                    $(".mr-state").text(state);
                    $(".overlay").hide();
                    $(".sel").hide();
                } else if (data.status == 10003 || data.status == 10006) {
                    showPopTips("服务器错误,请稍后重试");
                }
            });
        });

    });

});
