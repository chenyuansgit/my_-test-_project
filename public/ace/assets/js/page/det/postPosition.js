
$(function () {
    var can_request = true;
    //fn.selectorBind();
    fn.popBoxBind();

    var forward = encodeURIComponent(window.location.href);
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
    $(".sel-city .sel-btn").click(function (e) {
        var event = e || window.event;
        event.stopPropagation();
        var $this = $(this);
        if($this.hasClass("cur")) {
            return;
        } else {
            var type=$(this).attr("data-type");
            if(type=="multi"){
                $(".city-wrap").citySelector({
                    isProvince: false,
                    isMultiSelect: true
                });
            }else{
                $(".city-wrap").citySelector({
                    isProvince: false,
                    isMultiSelect: false
                });
            }
            $(".sel-city .sel-btn, .city-wrap").removeClass("cur");
            $this.addClass("cur");
            $(".pos-city").val("").attr("data-cid","");
            $(".selector-city").find(".city").removeClass("selected");
        }
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
        if($(this).parents(".pos-block-prefix").length>0 && !$(this).hasClass("custom-prefix"))
            $(btnSel).val($(this).text()).attr("data-type",$(this).attr("data-type"));
        else
            $(btnSel).val($(this).text());
        $(oSelector).hide();
    });

    //职位选择
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
        $(".selector-company").hide();
    });

    //添加下拉样式
    $(".pos-drop-down").click(function (e) {
        var $this = $(this);
        if(!$this.hasClass("cur")) {
            $this.find(".icon-down-arrow").remove();
            $this.addClass("cur").append("<span class='icon-up-arrow'></span>");
            $this.next().show();
        } else {
            $(this).find(".icon-up-arrow").remove();
            $(this).removeClass("cur").append("<span class='icon-down-arrow'></span>");
            $this.next().hide();
        }
        e.stopPropagation();
    });

    //选择是否提供转正机会
    $(".jobs-chance .chance-btn").click(function () {
        var $this = $(this);
        if(($this).hasClass("cur"))
            return;
        else {
            $(".jobs-chance .chance-btn").removeClass("cur");
            $this.addClass("cur");
            $(".jobs-chance").find(".input-error").hide();
        }
    });

    //添加自定义来源
    $(".button-source").click(function () {
       var value = $.trim($(".custom-job-source").val());
        $(".pos-channel-request").val(value);
    });

    //判断是实习与校招包打听
    $("#xz-det").click(function () {
        if($(this).hasClass("cur"))
            return;
        else {
            $("#sx-det").removeClass("cur");
            $(this).addClass("cur");
            $(".sel-payment,.is-check-xz").show();
            $(".is-check-time, .jobs-chance").hide();
            $(".unit-payment").text("万元/年");
            $(".pos-payment-l, .pos-payment-h").val("0");
        }
    });
    $("#sx-det").click(function () {
        if($(this).hasClass("cur"))
            return;
        else {
            $("#xz-inside").addClass("cur");
            $("#xz-outside").removeClass("cur");
            $("#xz-det").removeClass("cur");
            $(this).addClass("cur");
            $(".sel-payment,.is-check-redirect-url,.is-check-xz").hide();
            $(".is-check-time, .jobs-chance,.is-check-email,.pos-block-prefix").show();
            $(".unit-payment").text("元/天");
            $(".pos-payment-l, .pos-payment-h").val("0");
        }
    });
    $("#xz-inside").click(function () {
        if($(this).hasClass("cur"))
            return;
        else {
            $("#xz-outside").removeClass("cur");
            $(this).addClass("cur");
            $(".is-check-redirect-url").hide();
            $(".is-check-email,.pos-block-prefix").show();
        }
    });
    $("#xz-outside").click(function () {
        if($(this).hasClass("cur"))
            return;
        else {
            $("#xz-inside").removeClass("cur");
            $(this).addClass("cur");
            $(".is-check-redirect-url").show();
            $(".is-check-email,.pos-block-prefix").hide();
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

    var company_avatar="";    //公司图像
    //公司头像上传
    if(global.ie){
        fileUpload("admin", "avatar-file", function (error, cover_img) {
            if (!error) {
                $(".company-avatar .loading").remove();
                $(".company-avatar").css({"background-image": "url('" + cover_img + "?imageView2/2/w/240/h/240')"}).attr("data-avatar",cover_img);
                company_avatar = cover_img;
                $(".company-avatars").find(".input-error").hide();
            }
        }, function () {
            $(".company-avatar").append("<div class='loading'></div>");
        });
    }else{
        var avatar_cropper = CROPPER.getCropper("cropper-image",{
            width: 200,
            height: 200,
            ratio : 1,
            btn:{
                zoomIn : ".cutter-larger",
                zoomOut : ".cutter-smaller"
            }
        });
        imageCutter.init("avatar-file",function(data){
            avatar_cropper.refresh(data,function(){
                $(".popBox-cutter").show();
                $(".overlay").show();
            });
        });
        $(".popBox-cutter .btn-confirm").click(function(){
            var croppedData = avatar_cropper.getCroppedData();
            imageCutter.upload(croppedData,"admin",function(err,info){
                $(".popBox-cutter .loading").remove();
                if(!err){
                    var imgUrl = "http://image.internbird.com/"+JSON.parse(info).key;
                    $(".company-avatar").css({"background-image": "url('" + imgUrl + "?imageView2/2/w/240/h/240')"}).attr("data-avatar",imgUrl);
                    company_avatar = imgUrl;
                    $(".company-avatars").find(".input-error").hide();
                    $(".overlay,.popBox").hide();
                }else{
                    alert("上传失败!");
                }
            },function(){
                $(".popBox-cutter .loading").remove();
                $(".popBox-cutter").append("<div class='loading'></div>");
            });

        });
        $(".popBox .btn-cancel,.overlay").click(function(){
            $(".overlay,.popBox").hide();
        });
    }



    //URL判断
    var viewUrl;
    if(env == "local") {
        viewUrl = "http://localhost:8088"
    } else if( env == "development") {
        viewUrl = "http://www.dev.internbird.com"
    } else if ( env == "prod") {
        viewUrl = "http://www.internbird.com"
    }

    //查找已有注册公司
    $(".btn-company-search").click(function(){
        var company_name = $.trim($(".pos-company").val());
        if(company_name){
            $.ajax({
                url:"/det/companySearch?key="+company_name,
                type:"get",
                dataType:"json",
                success:function(data){
                    if(data.status == 10000){
                        var companies = data.data.company;
                        if(!companies.length){
                            alert("没有找到符合条件的注册公司");
                        }else{
                            $(".selector-company").empty();
                            for(var i=0,len = companies.length;i<len;i++){
                                var _liCom = "<li data-cid="+companies[i].cid+" data-avatar="+companies[i].avatar+"><span class='c-name'>"+companies[i].name+"</span><span>(类型:"+companies[i].type+")</span><a href='"+viewUrl+"/company/detail/"+companies[i].cid+"' class='company-preview' target='_blank'>预览</a></li>";
                                $(".selector-company").append(_liCom);
                            }
                            $(".selector-company").show();
                        }
                    }else if(data.status == 10003){
                        alert("服务器错误,请稍后重试");
                    }
                }
            });
        }
    });

    //查询已存在的职位
    $(".btn-job-search").click(function(){
        $(".view-check").empty();
        var job_name = $.trim($(".pos-name").val());
        if(job_name){
            $.ajax({
                url:"/det/search?key="+job_name,
                type:"get",
                dataType:"json",
                success:function(data){
                    if(data.status == 10000){
                        var jobs = data.data.jobs;
                        if(!jobs.length){
                            $(".view-check").append("<p>没有找到符合条件的职位信息</p>");
                        }else{
                            $(".view-check").append("<p>找到已存在的职位信息</p>");
                            for(var i = 0; i<jobs.length; i++) {
                                $(".view-check").append("<div class='job-item'>职位名称：<span class='jobs-name'>"+jobs[i].name+"</span>&nbsp;&nbsp;&nbsp;&nbsp;公司：<span class='company-name'><a href='"+viewUrl+"/company/detail/"+jobs[i].company_id+"' target='_blank'>"+jobs[i].company_name+"</a></span>&nbsp;&nbsp;&nbsp;&nbsp;公司类型：<span class='company-type'>"+jobs[i].company_type+"</span></div>");
                            }
                        }
                    }else if(data.status == 10003){
                        alert("服务器错误,请稍后重试");
                    }
                }
            });
        } else {
            $(".view-check").append("<p>请输入职位名称</p>");
        }
    });

    $(document).on("click",".selector-company li",function(e){
        var event = window.event || e;
        event.stopPropagation();
        var $this = $(this);
        var company_name = $.trim($this.find(".c-name").text());
        var cid = $this.attr("data-cid");
        var avatar = $this.attr("data-avatar");

        $(".pos-company").val(company_name).attr("data-cid",cid);
        $(".company-avatar").attr("data-avatar",avatar).css({"background-image":"url('"+avatar+"')"});
        $(".selector-company").hide();
    });

    var option_type = $(".btn-add-pos").attr("data-type");
    var redirect_url = $.trim($(".pos-redirect-url").val());

    $(document).on("click", ".btn-add-pos", function () {
        var $this = $(this);
        var noError = isInputNull(ue);
        var url = "";
        if (option_type == "edit") {
            url = "/det/edit/" + $this.attr("data-id");
        } else {
            url = "/det/add";
        }
        if (noError) {
            var redirect_uri = $.trim($(".pos-redirect-url").val());
            var type = $(".pos-type").attr("data-type");//类型
            var type_id = $(".pos-type").attr("data-id");
            var parent_type = $(".pos-type").attr("data-pt");
            var parent_type_id = $(".pos-type").attr("data-pid");
            var name = $.trim($(".pos-name").val());//职位名称
            var city = $.trim($(".pos-city").val());//实习城市
            var city_id = $(".pos-city").attr("data-cid");
            var edu = $.trim($(".pos-education").val());//学历要求
            var address = $.trim($(".pos-address").val());
            var days, regular,channel_type;
            var payment_l, payment_h;
            if($("#sx-det").hasClass("cur")) {
                days = parseInt($.trim($(".pos-time-request").val()).charAt(0));//实习时间
                regular = parseInt($(".jobs-chance .cur").attr("data-type"));    //是否提供转正机会
                channel_type = 2;
                payment_l = parseInt($.trim($(".pos-payment-l").val()));//最低日薪
                payment_h = parseInt($.trim($(".pos-payment-h").val()));//最高日薪
            }else {
                days = "";
                regular = "";
                channel_type = 4;
                payment_l = parseInt($.trim($(".pos-payment-l").val())) * 10000;//最低日薪
                payment_h = parseInt($.trim($(".pos-payment-h").val())) * 10000;//最高日薪
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
            var content = ueUtil.getPlainContent(ue.getContent());//实习内容
            var company_name = $.trim($(".pos-company").val());    //公司名称
            var company_id = $(".pos-company").attr("data-cid") || '';    //公司名称
            var notice_email = $.trim($(".pos-mail").val());
            company_avatar = $(".company-avatar").attr("data-avatar");
            var email_subject_template = $(".pos-prefix").attr("data-type");
            var channel =$(".pos-channel-request").val();   //职位来源
            var deadline = $.trim($(".pos-deadline").val()).toTimeStamp() + 24 * 60 * 60 * 1000 - 1000;
            if(checkPayment(payment_l, payment_h)){
                var mapGeo = new BMap.Geocoder();
                mapGeo.getPoint(address, function (point) {
                    if (point) {
                        var flag = false;
                        if(!$("#xz-outside").hasClass("cur") && !redirect_uri){
                            flag = checkEmail(notice_email);
                        }else{
                            flag = true;
                        }
                        if (can_request && flag ) {
                            can_request = false;
                            var cityData=[];
                            for(var i=0,len=city.length; i<len; i++) {
                                cityData.push({data_city:city[i], data_city_id:city_id[i]});
                            }
                            var option = {
                                redirect_uri:redirect_uri,
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
                                regular: regular,
                                channel: channel,
                                content: content,
                                channel_type:channel_type,
                                deadline:deadline,
                                company_name: company_name,
                                company_id : company_id,
                                company_avatar: company_avatar,
                                notice_email:notice_email,
                                email_subject_template:email_subject_template
                            };
                            $this.val("发布中...");
                            $.ajax({
                                type: "post",
                                url: url,
                                dataType: "json",
                                data: {
                                    option: option
                                },
                                success: function (data) {
                                    can_request = true;
                                    $this.val("发布");
                                    if (data.status == 10000) {
                                        //alert("成功！");
                                        location.href = '/det/list?status=1&page=1&ct='+channel_type;
                                        $(".pos-type, .pos-name, .pos-city").val("");
                                    } else if (data.status == 10004) {
                                        window.location.href = "/login?forward=" + forward;
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
            obj.payment_l = parseInt($.trim($(".pos-payment-l").val()));//最低日薪
            obj.payment_h = parseInt($.trim($(".pos-payment-h").val()));//最高日薪
            obj.days = parseInt($.trim($(".pos-time-request").val()).charAt(0));//实习时间
            obj.city = $.trim($(".pos-city").val());//实习城市
            obj.education = $.trim($(".pos-education").val());//学历要求
            /*obj.profession = $.trim($(".pos-profession").val());//专业要求*/
            obj.content = ue.getContent();//实习内容
            /* obj.attr = $.trim($(".pos-attr").val());//职位诱惑*/
            /* obj.deadline = $.trim($(".pos-deadline").val());*/
            obj.regular = parseInt($(".jobs-chance .cur").attr("data-type"));    //是否提供转正机会
            if (obj.payment_h / obj.payment_l > 2) {
                $(".input-error-payment").html("<span class='icon-prompt'></span>最高日薪不能大于最低日薪的二倍").show();
            } else if (obj.payment_h < obj.payment_l) {
                $(".input-error-payment").html("<span class='icon-prompt'></span>最高日薪不能小于最低日薪").show();
            } else if (obj.payment_h > 1000 || obj.payment_l > 1000) {
                $(".input-error-payment").html("<span class='icon-prompt'></span>日薪不能超过1000").show();
            } /*else if (obj.attr.length > 20) {
             $(".pos-attr").parent().next(".input-error").show();
             }*/ else {
                var job = JSON.stringify(obj);
                fn.storage("job", job);
                window.open("/public/static/job.html");
            }
            //console.log(job);
        }
    });
});
//职位发布信息不全
function isInputNull(ue) {
    $(document).on("focus", ".pos-item", function () {
        $(this).parent().nextAll(".input-error").hide();
    });
    var flag = true;
    var redirect_uri = $.trim($(".pos-redirect-url").val());
    if(!(redirect_uri.indexOf("http://")>=0 || redirect_uri.indexOf("https://")>=0) && $("#xz-outside").hasClass("cur")){
        flag = false;
        alert("跳转链接格式错误!");
    }
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

    if(($(".pos-payment-l").val() == "" && $(".pos-payment-h").val() != "") || ($(".pos-payment-h").val() == "" && $(".pos-payment-l").val() != "")) {
        $('.pos-payment').find(".input-error").eq(0).show();
        flag = false;
    }

    $(".add-area .pos-item").each(function () {
        if ($.trim($(this).val()) == "") {
            if(!$(this).parents(".pos-payment").length>0 && $("#xz-det").hasClass("cur") && !$(this).parents(".is-check-time").length>0) {
                $(this).parent().nextAll(".input-error").eq(0).show();
                flag = false;
            }
            if(!$(this).parents(".pos-payment").length>0 && $("#sx-det").hasClass("cur")) {
                $(this).parent().nextAll(".input-error").eq(0).show();
                flag = false;
            }
            if($("#xz-outside").hasClass("cur")){
                if($(this).hasClass("pos-mail") || $(this).hasClass("pos-prefix")){
                    flag = true;
                }
            }
        }
    });
    if(!$(".jobs-chance span").hasClass("cur") && $("#sx-det").hasClass("cur")) {
        $(".jobs-chance").find(".input-error").show();
        flag = false;
    }

    /*if(!$(".jobs-state span").hasClass("cur")) {
     $(".jobs-state").find(".input-error").show();
     flag = false;
     }*/
    var newEmail = $.trim($(".pos-mail").val());
    if (!(regex.email.test(newEmail)) && !$("#xz-outside").hasClass("cur") && !(redirect_uri && $(".btn-add-pos").attr("data-type")=="edit")) {
        $(this).parent().nextAll(".input-error").show();
        flag = false;
    }
    if($(".company-avatar").attr("data-avatar") == "") {
        $(".company-avatars").find(".input-error").show();
        flag = false;
    }
    return flag;
}

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
    } else if((payment_h > 1000000 || payment_l > 1000000) && $("#xz-det").hasClass("cur")) {
        $(".input-error-payment").html("<span class='icon-prompt'></span>包打听最高薪水不能超过100万").show();
        flag = false;
    }
    return flag;
}

$(".pos-mail").focus(function () {
    $(this).parent().nextAll(".input-error").hide();
});
$(".pos-mail").blur(function () {
    $(this).parent().nextAll(".input-error").hide();
    var newEmail = $.trim($(this).val());
    if (!(regex.email.test(newEmail))) {
        $(this).parent().nextAll(".input-error").show();
    }else{
        if(!$("#xz-outside").hasClass("cur")){
            checkEmail(newEmail);
        }
    }
});

function checkEmail(email){
    var isOk = false;
    $.ajax({
        url: "/det/checkEmail",
        type: "post",
        dataType: "json",
        async: false,
        data: {
            option:{
                email: email
            }
        },
        success: function (data) {
            if(data.status == 10000){
                isOk = true;
            }else if(data.status ==10002){
                alert("该简历接收邮箱已在实习鸟平台验证过HR身份,包打听无法使用该邮箱发布职位");
            }else if(data.status == 10003){
                alert("服务器错误,请稍后重试");
            }
        }
    });
    return isOk;
}

//自定义标题
$(".custom-prefix").click(function () {
    $(".overlay,.popBox-prefix").show();
});

$(".popBox-area-btn .confirm").click(function () {
    var prefix = $(".custom-pop-prefix").val();
    /* var job = prefix.indexOf("职位名称")>=0?"job":"";
     var male = prefix.indexOf("性别")>=0?"male":"";
     var name = prefix.indexOf("姓名")>=0?"name":"";
     var school = prefix.indexOf("学校")>=0?"school":"";
     var education = prefix.indexOf("最高学历")>=0?"education":"";
     var major = prefix.indexOf("专业")>=0?"major":"";*/
    /*
     $(".pos-prefix").val(prefix).attr("data-type", job.length>0?job+"-":"" + male.length>0?male+"-":"" + name.length>0?name+"-":"" + school.length>0?school+"-":"" +education.length>0?education+"-":"" + major.length>0?major+"-":"");
     */
    var dataType = (prefix.indexOf("职位名称")>=0?"job-":"") + (prefix.indexOf("性别")>=0?"male-":"") + (prefix.indexOf("姓名")>=0?"name-":"") + (prefix.indexOf("学校")>=0?"school-":"") + (prefix.indexOf("最高学历")>=0?"education-":"") + (prefix.indexOf("专业")>=0?"major-":"");
    var dataTypePrefix = dataType.substring(0,dataType.length-1);
    $(".pos-prefix").val(prefix).attr("data-type", dataTypePrefix);
    $(".overlay, .popBox-prefix").hide();
});

$(".popBox-area-btn .cancel, .overlay").click(function () {
    $(".overlay, .popBox-prefix").hide();
});