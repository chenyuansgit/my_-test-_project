//验证
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        },
        'js/plugin/IB_jquery.cookie':{
            deps:['js/lib/IB_jquery'],
            exports:'cookie'
        },
        'js/lib/IB_plupload.full':{
            exports:'plupload'
        }
    }
});

require(['js/lib/IB_jquery','js/plugin/IB_jquery.cookie','js/common/IB_fileUpLoad','js/common/IB_city','js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_map','js/common/IB_regex','js/common/IB_ueditor'],function ($,cookie,fileUpload,cities,FastClick,fn,mapUtil,regex,ueUtil) {
    $(function(){
        var can_request = true;
        fn.popBoxBind();
        selectorBind();
        if(global.step == 1){
            $(".btn-next").click(function(){
                var hr_phone = $.trim($(".hr-phone").val());
                var hr_email = $.trim($(".hr-email").val());
                var $this = $(this);
                var text = $this.text();
                if(check()){
                    if(can_request){
                        can_request = false;
                        $this.text("处理中...");
                        $.ajax({
                            type:"post",
                            url:"/api/c/sendValidateEmail",
                            dataType:"json",
                            data:{
                                option:{
                                    address: hr_email,
                                    phone:hr_phone
                                }
                            },
                            success:function(data){
                                can_request = true;
                                $this.text(text);
                                if(data.status == 10000){
                                    location.href="/company/validate?step=2";
                                }else if(data.status == 10002){
                                    $(".hr-email").nextAll(".input-tips").remove();
                                    $(".hr-email").after("<span class='input-tips'><span class='icon-prompt'></span>请使用企业邮箱进行注册</span>");
                                }else if(data.status == 10001){
                                    $(".hr-email").nextAll(".input-tips").remove();
                                    $(".hr-email").after("<span class='input-tips'><span class='icon-prompt'></span>该邮箱已经通过企业招聘验证</span>");
                                }
                            }
                        });
                    }
                }
            });
            $(".required").focus(function(){
                $(this).nextAll(".input-tips").remove();
            });
            $(".required").blur(function(){
                $(this).nextAll(".input-tips").remove();
                if($.trim($(this).val()) == ""){
                    $(this).after("<span class='input-tips'><span class='icon-prompt'></span>必填</span>");
                }
            });
            function check(){
                var hr_phone = $.trim($(".hr-phone").val());
                var hr_email = $.trim($(".hr-email").val());
                var flag = true;
                if(hr_phone == ""){
                    $(".hr-phone").nextAll(".input-tips").remove();
                    $(".hr-phone").after("<span class='input-tips'><span class='icon-prompt'></span>必填</span>");
                    flag = false;
                }/*else if(!regex.phone.test(hr_phone)){
                    $(".hr-phone").nextAll(".input-tips").remove();
                    $(".hr-phone").after("<span class='input-tips'><span class='icon-prompt'></span>手机号码格式错误</span>");
                    flag = false;
                }*/
                else if(regex.phone.test(hr_phone) || regex.tel.test(hr_phone)){
                    return flag;
                } else {
                    $(".hr-phone").nextAll(".input-tips").remove();
                    $(".hr-phone").after("<span class='input-tips'><span class='icon-prompt'></span>手机号码或座机号(区号和号码用'-'分隔)格式错误</span>");
                    flag = false;
                }
                if(hr_email == ""){
                    $(".hr-email").nextAll(".input-tips").remove();
                    $(".hr-email").after("<span class='input-tips'><span class='icon-prompt'></span>必填</span>");
                    flag = false;
                }else if(!regex.email.test(hr_email)){
                    $(".hr-email").nextAll(".input-tips").remove();
                    $(".hr-email").after("<span class='input-tips'><span class='icon-prompt'></span>电子邮箱格式错误</span>");
                    flag = false;
                }
                return flag;
            }
        }else if(global.step == 2){
            var address = global.address;
            var phone = global.phone;
            $(".email-resend").click(function(){
                var $this = $(this);
                var text = $this.text();
                if(can_request){
                    can_request = false;
                    $this.text("发送中...");
                    $.ajax({
                        type:"post",
                        url:"/api/c/sendValidateEmail",
                        dataType:"json",
                        data:{
                            option:{
                                address: address,
                                phone:phone
                            }
                        },
                        success:function(data){
                            $this.text(text);
                            can_request = true;
                            if(data.status == 10000) {
                                location.href = "/company/validate?step=2";
                            }
                        }
                    });
                }
            });
        }else if(global.step == 3){
            //加入公司
            $(".btn-create").click(function(){
                $(".step-3-join").hide();
                $(".step-3-create").show();
            });
            $(".btn-join").click(function(){
                var cid = $(this).attr("data-cid");
                var cname = $(this).attr("data-cname").length>10?$(this).attr("data-cname").substr(0,10)+"...":$(this).attr("data-cname");
                $(".confirm-join .text").text("确认加入"+cname+"?");
                $(".confirm-join .btn-confirm").attr("data-cid",cid);
                $(".overlay").show();
                $(".popBox").hide();
                $(".popBox-confirm").show();
            });
            $(".confirm-join .btn-confirm").click(function(){
                var $this = $(this);
                var text = $this.text();
                if(can_request){
                    var cid = $(this).attr("data-cid");
                    can_request = false;
                    $this.text("处理中...");
                    $.ajax({
                        type:"post",
                        url:"/api/c/join",
                        dataType:"json",
                        data:{
                            option:{
                                company_id:cid
                            }
                        },
                        success:function(data){
                            can_request = true;
                            $this.text(text);
                            if(data.status == 10000){
                                location.href = "/myCompany";
                            }
                        }
                    });
                }
            });

            var ue = ueUtil.getEditor("company-intro",300,1000);
            var intro = global.intro;
            if(intro){
                ue.ready(function() {
                    ue.setContent(intro);
                });
            }
            var avatar = '';
            //城市选择加载
            $(".city-wrap").citySelector({
                isProvince : false
            });
            var create_url = "/api/c/create";
            if(global.type){
                create_url = "/api/c/joinCreate";
            }
            $(".btn-next").click(function(){
                var $this = $(this);
                var text = $this.text();
                var address_list = [];
                var objAddr  = {};
                objAddr.id = 1;
                if(checkInput(ue)){
                    if(can_request){
                        var name = $.trim($(".company-name").val());//名称
                        var fullName = $.trim($(".company-full-name").val());//名称
                        var city = $.trim($(".company-city").val());//城市
                        var city_id = $(".company-city").attr("data-cid");
                        var scale_type = 1;//规模
                        switch($(".company-scale").val()) {
                            case "15人以下":
                                scale_type =1; break;
                            case "15-50人":
                                scale_type =2; break;
                            case "50-150人":
                                scale_type =3; break;
                            case "150-500人":
                                scale_type =4; break;
                            case "500-2000人":
                                scale_type =5; break;
                            case "2000-5000人":
                                scale_type =6; break;
                            case "5000人以上":
                                scale_type =7; break;
                        }
                        var trade_type;
                        switch($.trim($(".company-trade-type").val())){
                            case "国企":
                                trade_type =1; break;
                            case "私企":
                                trade_type =2; break;
                            case "外企":
                                trade_type =3; break;
                            case "合资企业":
                                trade_type =4; break;
                            case "其它":
                                trade_type =5; break;
                        }
                        var type = $.trim($(".company-type").val());
                        var type_id = $(".company-type").attr("data-type-id");
                        var homePage = $.trim($(".company-page").val());//官网
                        var mapGeo = new BMap.Geocoder();
                        mapGeo.getPoint($.trim($("#input-suggest").val()), function(point){
                            if(point){
                                mapGeo.getLocation(point,function(rs){
                                    var addComp = rs.addressComponents;
                                    objAddr.desc = $.trim($(".company-address").val());
                                    objAddr.city = addComp.city +" , "+addComp.district;
                                    objAddr.id = 1;
                                    address_list.push(objAddr);
                                    var address = JSON.stringify(address_list);//详细地址
                                    var title = $.trim($(".company-title").val());//亮点
                                    var intro = ueUtil.getPlainContent(ue.getContent());//介绍
                                    var option = {
                                        name:name,
                                        full_name:fullName,
                                        city:city,
                                        city_id:city_id,
                                        scale_type:scale_type,
                                        trade_type:trade_type,
                                        type:type,
                                        type_id: type_id,
                                        homepage:homePage,
                                        address:address,
                                        title:title,
                                        introduction:intro,
                                        avatar:avatar
                                    };
                                    can_request = false;
                                    $this.text("处理中...");
                                    $.ajax({
                                        type:"post",
                                        url:create_url,
                                        dataType: "json",
                                        data:{
                                            option:option
                                        },
                                        success:function(data){
                                            can_request = true;
                                            $this.text(text);
                                            if(data.status == 10000){
                                                location.href="/myCompany";
                                            }
                                        }

                                    });
                                });
                            }else{
                                $("#input-suggest").nextAll(".input-tips").remove();
                                $("#input-suggest").after("<span class='input-tips'><span class='icon-prompt'></span>请输入有效的国内地址</span>");
                            }
                        });
                    }
                }
            });
            //公司logo上传
            var uid = global.uid;
            fileUpload(uid,"logo",function(error,logo){
                if(!error && logo!="undefined"){
                    $(".company-logo .loading").remove();
                    $(".company-logo").css({"background-image":"url('"+logo+"')"}).data("yes","yes");
                    $("#logo").nextAll(".input-tips").remove();
                    avatar = logo;
                }

            },function(){
                $(".company-logo").append("<i class='loading'></i>");
            });

            mapUtil.getSuggest("input-suggest");
            function checkInput(ue){
                var flag = true;
                ue.addListener("focus",function(){
                    $(".input-tips-intro").remove();
                });
                $(".required").on("focus",function(){
                    $(this).nextAll(".input-tips").remove();
                });
                if($(".company-logo").data("yes") !="yes"){
                    $("#logo").nextAll(".input-tips").remove();
                    $("#logo").parent().append("<span class='input-tips'><span class='icon-prompt'></span>请上传logo</span>");
                    $(document).scrollTop(0);
                    flag = false;
                    return flag;
                }
                $(".required").each(function(){
                    if($(this).val().trim() == "" || ($(this).attr("type")=="button") && !$(this).hasClass("selected")){
                        $(this).nextAll(".input-tips").remove();
                        $(this).after("<span class='input-tips'><span class='icon-prompt'></span>必填</span>");
                        var top = $(this).offset().top+40;
                        $(document).scrollTop(top);
                        flag = false;
                        return flag;
                    }
                });
                if(!ue.getContent().trim()){
                    $(".intro-area").find(".input-tips").remove();
                    $(".intro-area").append("<span class='input-tips input-tips-intro'><span class='icon-prompt'></span>请填写公司介绍，让公司得到更好的展示~</span>");
                    flag = false;
                    return flag;
                }
                if(flag){
                    return flag;
                }else{
                    $(document).scrollTop(0);
                    return flag;
                }
            }
        }

    });
    function selectorBind(){
        $(document).click(function(e){
            var event = e || window.event;
            if(!$(".btn-selector").is(event.target) && $(".btn-selector").has(event.target).length === 0){
                $(".selector").hide();
            }
        });
        $(".btn-selector").on("click",function(e){
            var event = e || window.event;
            $(".selector").hide();
            $(this).next(".selector").show();
        });
        $(".selector li").on("click",function(e){
            var event = e || window.event;
            event.stopPropagation();
            var oSelector = $(this).parent();
            var btnSel = $(oSelector).prev("span.btn-selector").find("input");
            $(btnSel).css({"color":"#000"});
            if($(this).hasClass("ct")){
                var id = $(this).attr("data-type-id");
                $(btnSel).attr("data-type-id",id);
            }
            $(btnSel).val($(this).text()).attr("autocomplete","off").addClass("selected");
            $(oSelector).hide();
        });

    }
});


