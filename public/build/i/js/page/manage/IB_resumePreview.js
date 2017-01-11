/**
 * Created by zhphu on 16/5/17.
 */
require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        },
        'js/lib/IB_iscroll': {
            exports: 'IScroll'
        },
        'js/lib/IB_autosize': {
            exports: 'autosize'
        }
    }
});
require(['js/lib/IB_zepto', 'js/lib/IB_fastclick', 'js/lib/IB_fn','js/lib/IB_reg','js/lib/IB_autosize','js/lib/IB_timeScroller'], function ($, FastClick,fn,reg,autosize) {
    var account_host;
    try{
        account_host = global.account_host;
    }catch(e){}
    var can_request;
    function showPopTips(text) {
        $(".popTips").text(text).addClass("animation fadeIn").show();
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
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

    var rm_storage = {
        uid :global.uid,
        options : {
            tr_email : "",
            hr_name : "",
            hr_phone : "",
            address : ""
        }
    };
    function setOptionStorage(){
        if(global.uid && global.uid!="undefined"){
            fn.storage("rm_option",JSON.stringify(rm_storage));
        }
    }

    var manageUtil = {
        transmitURL : "/api/c_resume/transmit",
        updateURL : "/api/c_resume/updateStatus",
        ajaxReq : function(url,option,callback){
            if(can_request){
                can_request = false;
                $.ajax({
                    type : "post",
                    url : url,
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
        },
        resumeTransmit : function(option,callback){
            manageUtil.ajaxReq(manageUtil.transmitURL,option,callback);
        },
        updateState : function(option,callback){
            manageUtil.ajaxReq(manageUtil.updateURL,option,callback);
        },
        baseEventBind : function(){
            $(".edit-block .back").click(function(){
                var $editBlock = $(this).closest(".edit-block");
                removeEditBlock($editBlock);
            });
            $(".selector .back").click(function(){
                var $editBlock = $(this).closest(".selector");
                removeEditBlock($editBlock);
            });

            $(".option .btn.on").click(function(){
                var des = $(this).attr("data-for");
                showEditBlock($(".edit-block-"+des));
            });
            $(".sub-tab").click(function(){
                var $this = $(this);
                var $editBlock = $this.closest(".edit-block");
                var type = $this.attr("data-type");
                $editBlock.find(".sub-content.curr").removeClass("curr");
                $editBlock.find(".sub-content-"+type).addClass("curr");
                $editBlock.find(".sub-tab.curr").removeClass("curr");
                $this.addClass("curr");
            });
            $(".required").click(function(){
                if($(this).hasClass("select")){
                    $(this).next(".input-error").hide();
                }else{
                    $(this).parent().next(".input-error").hide();
                }
            })
        },
        inputCheck : function($editBlock){
            var flag = true;
            $editBlock.find(".required").each(function(){
               var $this = $(this);
               if($this.hasClass("phone")){
                   var phone = $.trim($this.val());
                   if(!phone){
                       $this.parent().next(".input-error").text("必填").show();
                       flag = false;
                       return false;
                   }else if(!reg.phone_reg.test(phone)){
                       showPopTips("手机号码格式错误");
                       flag = false;
                       return false;
                   }
               }else if($this.hasClass("email")){
                   var email = $.trim($this.val());
                   if(!email){
                       $this.parent().next(".input-error").text("必填").show();
                       flag = false;
                       return false;
                   }else if(!reg.email_reg.test(email)){
                       showPopTips("邮箱格式错误");
                       flag = false;
                       return false;
                   }
               }else if($this.hasClass("editor")){
                   var edit_content = $.trim($editBlock.find(".editor").val());
                   if(!edit_content){
                       showPopTips("请填写邮件正文信息");
                       flag = false;
                       return false;
                   }
               }else if($this.hasClass("input")){
                   var text = $.trim($this.val());
                   if(!text){
                       $this.parent().next(".input-error").text("必填").show();
                       flag = false;
                       return false;
                   }
               }else if($this.hasClass("select")){
                   var text = $.trim($this.text());
                   if(!text){
                       $this.next(".input-error").text("必填").show();
                       flag = false;
                       return false;
                   }
               }
            });

            return flag;
        }
    };

    $(function () {
        FastClick.attach(document.body);
        autosize(document.querySelector('.autosize'));

        can_request = true;
        var forward = encodeURIComponent(window.location.href);
        var rid = global.rid;
        var jid = global.jid;
        var job_name = global.job_name;
        var original_status = global.status;


        var from = decodeURIComponent($.trim(fn.getQueryString("forward")));
        $(".header .back").attr("href",from || "/");

        if(global.uid && global.uid!="undefined"){
            var storage = fn.storage("rm_option")?JSON.parse(fn.storage("rm_option")):"";
            if(storage && storage.uid == rm_storage.uid){
                rm_storage = storage;
                var options = storage.options;
                var address = $.trim(options.address);
                var tr_email = $.trim(options.tr_email);
                var hr_name = $.trim(options.hr_name);
                var hr_phone = $.trim(options.hr_phone);
                if(hr_phone){
                    $(".edit-block-interview .phone").val(hr_phone);
                }
                $(".edit-block-interview .interview-address").val(address);
                $(".edit-block-contact .employer-name,.edit-block-interview .interview-hr").val(hr_name);
                $(".edit-block-transmit .transmit-email").val(tr_email);
            }
        }

        manageUtil.baseEventBind();
        $("#interview-time-1").attr("date-timestamp", +new Date).timeScroller({
            title: '面试时间',
            date: +new Date,
            dateSpan:2,
            confirm: function (data) {
                $("#interview-time-1").attr("date-timestamp", data.timestamp).find(".required").attr("data-timestamp",data.timestamp).text(new Date(data.timestamp).format("yyyy-MM-dd hh:mm"));
            }
        });
        $("#interview-time-2").attr("date-timestamp", +new Date).timeScroller({
            title: '面试时间',
            date: +new Date,
            dateSpan:2,
            confirm: function (data) {
                $("#interview-time-2").attr("date-timestamp", data.timestamp).find(".required").attr("data-timestamp",data.timestamp).text(new Date(data.timestamp).format("yyyy-MM-dd hh:mm"));
            }
        });


        $(".edit-block-transmit .btn-confirm").click(function(){
            var $editBlock = $(".edit-block-transmit");
            var flag = manageUtil.inputCheck($editBlock);
            if(flag && can_request){
                var email = $.trim($editBlock.find(".transmit-email").val());
                var subject = $.trim($editBlock.find(".transmit-subject").val());
                var content = $.trim($editBlock.find(".transmit-content").val());
                rm_storage.options.tr_email = email;
                setOptionStorage();
                manageUtil.resumeTransmit({
                    rid: rid,
                    job_name: job_name,
                    jid: jid,
                    email:email,
                    content:content,
                    subject:subject
                },function(data){
                    if (data.status == 10000) {
                        showPopTips("转发成功");
                        setTimeout(function () {
                            removeEditBlock($editBlock);
                        },600);
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        $(".edit-block-contact .btn-confirm").click(function(){
            var $editBlock = $(".edit-block-contact");
            var flag = manageUtil.inputCheck($editBlock);
            if(flag && can_request){
                var hr_name = $.trim($editBlock.find(".employer-name").val());
                var hr_email = $.trim($editBlock.find(".employer-email").val());
                rm_storage.options.hr_name = hr_name;
                setOptionStorage();
                manageUtil.updateState({
                    rid: rid,
                    job_name: job_name,
                    jid: jid,
                    status: 2,
                    original_status:original_status,
                    hr_name: hr_name,
                    hr_email:hr_email
                },function(data){
                    if (data.status == 10000) {
                        var $optionArea = $(".option-area");
                        $(".header .header-title").text("待沟通简历");
                        $optionArea.find(".option .btn-contact").removeClass("btn-contact").addClass(".btn-interview").text("通知面试").attr("data-for","interview");
                        original_status = 2;
                        $(".edit-block-interview .interview-hr").val(hr_name);
                        showPopTips("处理成功");
                        setTimeout(function () {
                            removeEditBlock($editBlock);
                        },600);

                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        $(".edit-block-interview .btn-confirm").click(function(){
            var $editBlock = $(".edit-block-interview");
            var $subBlock = $editBlock.find(".sub-content.curr");
            var flag = manageUtil.inputCheck($subBlock);
            var option = {};
            if(flag && can_request){
                if(+$subBlock.attr("data-type") == 1){
                    var hr_name = $.trim($subBlock.find(".interview-hr").val());
                    var hr_phone = $.trim($subBlock.find(".interview-phone").val());
                    var email = $.trim($subBlock.find(".interview-email").val());
                    var interview_time = $.trim($subBlock.find(".interview-time").attr("data-timestamp"));//时间戳
                    var address = $.trim($subBlock.find(".interview-address").val());
                    var content = $.trim($subBlock.find(".interview-content").val());
                    rm_storage.options.hr_name = hr_name;
                    rm_storage.options.address = address;
                    rm_storage.options.hr_phone = hr_phone;
                    setOptionStorage();
                    option = {
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: 3,
                        original_status:original_status,
                        email:email,
                        interview_time:interview_time,
                        hr_name:hr_name,
                        hr_phone:hr_phone,
                        address:address,
                        content:content
                    };
                }else {
                    var hr_name = $.trim($subBlock.find(".interview-hr").val());
                    var hr_phone = $.trim($subBlock.find(".interview-phone").val());
                    var interview_time = $.trim($subBlock.find(".interview-time").attr("data-timestamp"));//时间戳
                    rm_storage.options.hr_name = hr_name;
                    rm_storage.options.hr_phone = hr_phone;
                    setOptionStorage();
                    option = {
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: 3,
                        original_status:original_status,
                        interview_time:interview_time,
                        hr_name:hr_name,
                        hr_phone:hr_phone
                    };
                }

                manageUtil.updateState(option,function(data){
                    if (data.status == 10000) {
                        var $optionArea = $(".option-area");
                        $optionArea.find(".option").remove();
                        $(".header .header-title").text("已通知面试简历");
                        $optionArea.append("<div class='option w100'> <div class='btn off'>已通知面试</div></div>");
                        showPopTips("处理成功");
                        setTimeout(function () {
                            removeEditBlock($editBlock);
                        },600);

                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });
        $(".edit-block-unsuitable .btn-confirm").click(function(){
            var $editBlock = $(".edit-block-unsuitable");
            var flag = manageUtil.inputCheck($editBlock);
            if(flag && can_request){
                var reason_title = $.trim($editBlock.find(".unsuitable-title").val());
                var reason_content = $.trim($editBlock.find(".unsuitable-content").val());
                manageUtil.updateState({
                    rid: rid,
                    job_name: job_name,
                    jid: jid,
                    status: 4,
                    original_status:original_status,
                    reason_title:reason_title,
                    reason_content: reason_content
                },function(data){
                    if (data.status == 10000) {
                        var $optionArea = $(".option-area");
                        $optionArea.find(".option").remove();
                        $(".header .header-title").text("不合适简历");
                        $optionArea.append("<div class='option w100'> <div class='btn off'>已确认不合适</div></div>");
                        showPopTips("处理成功");
                        setTimeout(function () {
                            removeEditBlock($editBlock);
                        },600);
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + forward;
                    }
                });
            }
        });


    });

});