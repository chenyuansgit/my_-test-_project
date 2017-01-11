require.config({
    baseUrl : baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:  '$'
        },
        'js/plugin/timepicker/IB_jquery-ui-1.10.3.custom':{
            deps:['js/lib/IB_jquery'],
            exports: 'jQuery'
        },
        'js/plugin/timepicker/IB_jquery-ui-timepicker-addon':{
            deps:['js/lib/IB_jquery','js/plugin/timepicker/IB_jquery-ui-1.10.3.custom'],
            exports: 'datepicker'
        }
    }
});

require(['js/lib/IB_jquery', 'js/plugin/timepicker/IB_jquery-ui-1.10.3.custom','js/plugin/timepicker/IB_jquery-ui-timepicker-addon','js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_regex',"js/common/IB_job_type",'js/plugin/IB_lightbox'], function ($,jQuery,datepicker, FastClick, fn, regex, job_types) {
    var resumeUtil = {
        request : function (url,option,callback) {
            $.ajax({
                type: "post",
                url: url,
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
        manage:function(is_public,option,callback){
            var url = "/api/resume/updateStatus";
            if (is_public){
                url = "/api/resume/updatePublicStatus";
            }
            resumeUtil.request(url,option,callback);
        },
        transmit :function (is_public,option,callback) {
            var url = "/api/resume/transmit";
            if (is_public){
                url = "/api/resume/publicTransmit";
            }
            resumeUtil.request(url,option,callback);
        },
        setOptionStorage :function(){
            if(global.uid && global.uid!="undefined"){
                fn.storage("rm_option",JSON.stringify(rm_storage));
            }
        }
    };
    var rm_storage = {
        uid :global.uid,
        options : {
            tr_email : "",
            hr_name : "",
            address : "",
            hr_phone :""
        }
    };
    $(function(){
        var can_request = true;
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        fn.popBoxBind();
        $("#time-1,#time-2").datetimepicker({
            timeFormat : 'hh:mm',
            dateFormat : 'yy-mm-dd',
            stepHour : 1,
            stepMinute : 10,
            minDate:new Date(),
            hourMin:7
        });
        //hope
        //jtInitial($(".hope-position-type").attr("data-id").split(","));
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
                    $(".popBox-interview .phone-1").val(hr_phone);
                }
                $(".popBox-interview .place").val(address);
                $(".popBox-interview .interviewer-1").val(hr_name);
                $(".popBox-forward .email").val(tr_email);
            }
        }

        var shareKey = location.href.substr(location.href.lastIndexOf("/")+1);
        var original_status = global.original_status;
        var is_public = false;

        var forward = encodeURIComponent(window.location.href);
        if (!(shareKey.indexOf("?jid=")>-1)){
            is_public = true;
        }
        $(document).on("click", ".btn-connect", function() {
            $(".popBox-contact").show();
            $(".overlay").show();
        });
        //简历下载
        $(document).on("click", ".btn-download", function() {
            $(".popBox-download").show();
            $(".overlay").show();
        });
        $(".popBox-download .download").click(function(){
            $(".popBox-download").hide();
            $(".overlay").hide();
        });
        //联系他
        $(document).on("click", ".btn-connect", function() {
            $(".popBox-contact").show();
            $(".overlay").show();
        });
        $(document).on("click", ".cancel", function() {
            $(".overlay, .popBox").hide();
        });
        $(".popBox-contact .send").click(function(){
            var $this = $(this);
            var text = $(this).text();
            var jid = global.jid;
            var rid = global.rid;
            var job_name = global.job_name;
            var status = 2;
           /* var hr_name = $.trim($(".popBox-contact .hr_name").val());
            var hr_email = $.trim($(".popBox-contact .hr_email").val());*/
            if(check(".popBox-contact")){
                /*if(!regex.email.test(hr_email)){
                    $(".popBox-contact .hr_email").addClass("error");
                }else*/
                if(can_request){
                    can_request = false;
                    $this.text("处理中...");
                    var option = {
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: status,
                        original_status:original_status
                        /*hr_name: hr_name,
                        hr_email:hr_email*/
                    };
                    if(is_public){
                        option.shareKey = shareKey;
                    }
                    resumeUtil.manage(is_public,option,function(data){
                        can_request = true;
                        $this.text(text);
                        if(data.status == 10000){
                            location.reload();
                        }else if(data.status == 10004){
                            window.location.href = account_host+"/login?forward="+forward;
                        }
                    });

                }
            }

        });

        //不合适
        $(document).on("click",".btn-reject", function() {
            $(".popBox-improper").show();
            $(".overlay").show();
        });
        $(".popBox-improper .send").click(function(){
            var $this = $(this);
            var text = $this.text();
            var jid = global.jid;
            var rid = global.rid;
            var job_name = global.job_name;
            var status = 4;
            var reason_title = $.trim($(".popBox-improper .reason-s").val());
            var reason_content = $.trim($(".popBox-improper .reason-l").val());
            if(check(".popBox-improper")){
                if(can_request){
                    can_request = false;
                    $this.text("处理中...");
                    var option = {
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: status,
                        original_status:original_status,
                        reason_title:reason_title,
                        reason_content: reason_content
                    };
                    if(is_public){
                        option.shareKey = shareKey;
                    }
                    resumeUtil.manage(is_public,option,function(data){
                        $this.text(text);
                        can_request = true;
                        if(data.status == 10000){
                            location.reload();
                        }else if(data.status == 10004){
                            window.location.href = account_host+"/login?forward="+forward;
                        }
                    });
                }
            }

        });

        //对面试地点进行赋值
        $(".forward-inputText.place").click(function () {
            var $this = $(this);
            if($this.parent().find(".sel-address li").length>0)
                $this.parent().find(".sel-address").show();
            else
                return;
        });

        $(document).click(function (e) {
            var event = e || window.event;
            event.stopPropagation();
            if(!$(e.target).parent().hasClass("interview-address"))
                $(".sel-address").hide();
            else
                return;
        });
        
        $(document).on("click",".sel-address li",function () {
            var $this = $(this);
            var text = $.trim($this.text());
            $this.parents("li").find(".place").val(text);
            $this.parent().hide()
        });

        //面试
        $(document).on("click", ".btn-interview", function() {
            var nick_name = global.nick_name;
            if(!(regex.phone.test(nick_name) || regex.tel.test(nick_name)))
                $(".popBox-interview .interviewer-1").val(nick_name);    //如果联系人不是邮箱或手机号，则进行赋值
            $(".popBox-interview").show();
            $(".overlay").show();
        });
        //面试Tab
        $(document).on("click",".tab-ui li", function() {
            var i = $(this).index()>0?$(this).index():0;
            $(".popBox-interview .send").attr("data-type",i);
            $(".tab-ui li").removeClass("active");
            $(this).addClass("active");
            $(".notice-box").hide();
            $(".notice-box").eq(i).show();
        });
        $(".popBox-interview .send").click(function(){
            var $this = $(this);
            var text = $this.text();
            var jid = global.jid;
            var rid = global.rid;
            var job_name = global.job_name;
            if($(this).attr("data-type") == "0" && check("#notice")){
                var email = $.trim($(".popBox-interview .email").val());
                var theme = $.trim($(".popBox-interview .theme").val());
                var time = Date.parse($.trim($("#time-1").val()).replace(/-/g,"/"));
                var place = $.trim($(".popBox-interview .place").val());
                var interviewer= $.trim($(".popBox-interview .interviewer-1").val());
                var phone = $.trim($(".popBox-interview .phone-1").val());
                var content = $.trim($(".popBox-interview .notice-content").val());
                if(!regex.phone.test(phone)){
                    $(".popBox-interview .phone-1").addClass("error");
                }else if(can_request){
                    can_request = false;
                    $this.text("处理中...");
                    rm_storage.options.hr_name = interviewer;
                    rm_storage.options.address = place;
                    rm_storage.options.hr_phone = phone;
                    resumeUtil.setOptionStorage();
                    var option = {
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: 3,
                        original_status:original_status,
                        email:email,
                        interview_time:time,
                        hr_name:interviewer,
                        hr_phone:phone,
                        address:place,
                        content:content
                    };
                    if(is_public){
                        option.shareKey = shareKey;
                    }
                    resumeUtil.manage(is_public,option,function(data){
                        can_request = true;
                        $this.text(text);
                        if(data.status == 10000){
                            location.reload();
                        }else if(data.status == 10004){
                            window.location.href = account_host+"/login?forward="+forward;
                        }
                    });
                }

            }else if($(this).attr("data-type") == "1" && check("#arrange")){
                var time = Date.parse($.trim($("#time-2").val()).replace(/-/g,"/"));
                var interviewer= $.trim($(".popBox-interview .interviewer-2").val());
                var phone = $.trim($(".popBox-interview .phone-2").val());
                if(!regex.phone.test(phone)){
                    $(".popBox-interview .phone-1").addClass("error");
                }else if(can_request){
                    can_request = false;
                    $this.text("处理中...");
                    rm_storage.options.hr_name = interviewer;
                    rm_storage.options.hr_phone = phone;
                    resumeUtil.setOptionStorage();
                    var option = {
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: 3,
                        original_status:original_status,
                        interview_time:time,
                        hr_name:interviewer,
                        hr_phone:phone
                    };
                    if(is_public){
                        option.shareKey = shareKey;
                    }
                    resumeUtil.manage(is_public,option,function(data){
                        can_request = true;
                        $this.text(text);
                        if(data.status == 10000){
                            location.reload();
                        }else if(data.status == 10004){
                            window.location.href = account_host+"/login?forward="+forward;
                        }
                    });
                }
            }
        });

        //转发
        $(document).on("click", ".btn-share", function() {
            $(".popBox-forward").show();
            $(".overlay").show();
        });
        $(".popBox-forward .send").click(function(){
            var $this = $(this);
            var text = $this.text();
            var jid = global.jid;
            var rid = global.rid;
            var job_name = global.job_name;
            var email = $.trim($(".popBox-forward .email").val());
            var content = $.trim($(".popBox-forward .email-content").val());
            var theme = $.trim($(".popBox-forward .email-theme").val());
            if(check(".popBox-forward")){
                if(!regex.email.test(email)){
                    $(".popBox-forward .email").addClass("error");
                }else if(can_request){
                    can_request = false;
                    $this.text("发送中...");
                    rm_storage.options.tr_email = email;
                    resumeUtil.setOptionStorage();
                    var option = {
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        email:email,
                        content:content,
                        subject:theme
                    };
                    if(is_public){
                        option.shareKey = shareKey;
                    }
                    resumeUtil.transmit(is_public,option,function(data){
                        can_request = true;
                        $this.text(text);
                        if(data.status == 10000){
                            $(".overlay").hide();
                            $(".popBox").hide();
                        }else if(data.status == 10004){
                            window.location.href = account_host+"/login?forward="+forward;
                        }
                    });
                }
            }

        });

        function check(box){
            var flag = true;
            $(box).find(".req").each(function(){
                if(!$.trim($(this).val())){
                    $(this).addClass("error");
                    flag = false;
                }
            });
            $(box).find(".req").blur(function(){
                if(!$.trim($(this).val())){
                    $(this).addClass("error");
                }
            });
            $(box).find(".req").focus(function(){
                $(this).removeClass("error");
            });
            return flag;
        }
        function jtInitial(idArr){
            var type_id = idArr;
            var type_text = [];
            $(".selector-jt").find(".selected-num").text(type_id.length);
            for(var i=0,len=type_id.length;i<len;i++){
                var pid = parseInt(type_id[i].substr(0,1))-1;
                var sid = parseInt(type_id[i].substr(1)) ;
                if(pid>-1 && sid > -1){
                    type_text.push(job_types[pid].sub_types[sid].group_name);
                }
                var $subType = $(".selector-jt .sub-type[data-id='"+type_id[i]+"']");
                $subType.addClass("on");
            }

            if(type_text.toString()){
                $(".hope-position-type").text(type_text.toString());
            }else{
                $(".hope-position-type").closest("li").remove();
            }

        }
        function internExpectInitial(){
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
    });
});