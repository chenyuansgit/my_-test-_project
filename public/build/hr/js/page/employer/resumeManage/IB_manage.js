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

require(['js/lib/IB_jquery', 'js/plugin/timepicker/IB_jquery-ui-1.10.3.custom','js/plugin/timepicker/IB_jquery-ui-timepicker-addon','js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_regex'], function ($,jQuery,datepicker, FastClick, fn, regex) {
    var resumeUtil = {
      manage:function(option,callback) {
          $.ajax({
              type: "post",
              url: "/api/resume/updateStatus",
              dataType: "json",
              data: {
                  option: option
              },
              success: function (data) {
                  callback(data);
              },
              error: function () {

              }
          });
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
    $(function () {
        var forward = encodeURIComponent(window.location.href);
        var can_request = true;
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        fn.pagingBind();
        fn.popBoxBind();

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

        //面试时间选择绑定
        $("#time-1,#time-2").datetimepicker({
            timeFormat: 'hh:mm',
            dateFormat: 'yy-mm-dd',
            stepHour: 1,
            stepMinute: 10,
            minDate: new Date(),
            hourMin: 7
        });

        //显示电话号码
        $(".icon-phone").hover(function () {
            var $this = $(this);
            var top = $this.position().top;
            var left = $this.position().left;
            $(this).parents(".resume-box-text").find(".phone-box").show().css({"left":left-18+"px","top":top-32+"px"});
        },function () {
            $(this).parents(".resume-box-text").find(".phone-box").hide();
        });

        //显示邮箱
        $(".icon-email").hover(function () {
            var $this = $(this);
            var top = $this.position().top;
            var left = $this.position().left;
            $(this).parents(".resume-box-text").find(".email-box").show().css({"left":left-14+"px","top":top-32+"px"});
        },function () {
            $(this).parents(".resume-box-text").find(".email-box").hide();
        });

        $("#allSelect").on("click", function () {
            if (!$(this).hasClass("icon-select")) {
                $(this).addClass("icon-select").removeClass("icon-no-select");
                $(".resume-box-t1 .icon").addClass("icon-select").removeClass("icon-no-select");
            } else {
                $(this).addClass("icon-no-select").removeClass("icon-select");
                $(".resume-box-t1 .icon").addClass("icon-no-select").removeClass("icon-select");
            }
        });
        $(document).off("click", ".resume-box-t1 .icon");
        $(document).on("click", ".resume-box-t1 .icon", function () {
            if (!$(this).hasClass("icon-select")) {
                $(this).addClass("icon-select").removeClass("icon-no-select");
            } else {
                $(this).addClass("icon-no-select").removeClass("icon-select");
            }
        });

        $(document).on("click", ".cancel", function () {
            $(".overlay, .popBox").hide();
            $(".req").removeClass("error");
        });
        //联系他
        $(document).on("click", ".btn-contact", function () {
            $(".now").removeClass("now");
            var _resume = $(this).closest(".resume-box");
            _resume.addClass("now");
            var rid = _resume.attr("data-rid");
            var job_name = _resume.attr("data-jname");
            var jid = _resume.attr("data-jid");
            $(".popBox-contact .send").attr({"data-rid": rid, "data-jname": job_name, "data-jid": jid});
            $(".popBox-contact").show();
            $(".overlay").show();
        });
        $(".popBox-contact .send").click(function () {
            var $this = $(this);
            var text = $(this).text();
            var rid = $this.attr("data-rid");
            var job_name = $this.attr("data-jname");
            var jid = $this.attr("data-jid");
            var status = 2;
            /*var hr_name = $.trim($(".popBox-contact .hr_name").val());
            var hr_email = $.trim($(".popBox-contact .hr_email").val());*/
            if (check(".popBox-contact")) {
                /*if (!regex.email.test(hr_email)) {
                    $(".popBox-contact .hr_email").addClass("error");
                } else*/
                if (can_request) {
                    can_request = false;
                    $this.text("处理中...");
                    resumeUtil.manage({
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: status,
                        original_status: global.original_status
                        /*hr_name: hr_name,
                         hr_email: hr_email*/
                    },function(data){
                        $this.text(text);
                        can_request = true;
                        if (data.status == 10000) {
                            $(".resume-box.now").remove();
                            $(".overlay").hide();
                            $(".popBox").hide();
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }

        });

        //不合适
        $(document).on("click", ".btn-reject", function () {
            $(".now").removeClass("now");
            var _resume = $(this).closest(".resume-box");
            _resume.addClass("now");
            var rid = _resume.attr("data-rid");
            var job_name = _resume.attr("data-jname");
            var jid = _resume.attr("data-jid");
            $(".popBox-improper .send").attr({"data-rid": rid, "data-jname": job_name, "data-jid": jid});
            $(".popBox-improper").show();
            $(".overlay").show();
        });
        $(".popBox-improper .send").click(function () {
            var $this = $(this);
            var text = $(this).text();
            var rid = $this.attr("data-rid");
            var job_name = $this.attr("data-jname");
            var jid = $this.attr("data-jid");
            var status = 4;
            var reason_title = $.trim($(".popBox-improper .reason-s").val());
            var reason_content = $.trim($(".popBox-improper .reason-l").val());
            if (check(".popBox-improper")) {
                if (can_request) {
                    $this.text("处理中...");
                    can_request = false;
                    resumeUtil.manage({
                        rid: rid,
                        job_name: job_name,
                        jid: jid,
                        status: status,
                        original_status: global.original_status,
                        reason_title: reason_title,
                        reason_content: reason_content
                    },function (data) {
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            $(".resume-box.now").remove();
                            $(".overlay").hide();
                            $(".popBox").hide();
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }

        });

        //转发
        $(document).on("click", ".btn-share", function () {
            var _resume = $(this).closest(".resume-box");
            var rid = _resume.attr("data-rid");
            var job_name = _resume.attr("data-jname");
            var jid = _resume.attr("data-jid");
            var name = _resume.attr("data-name");
            $(".popBox-forward .email-theme").val("(来自实习鸟的简历)" + job_name + ":" + name + "的简历");
            $(".popBox-forward .email-content").val("以下是应聘" + job_name + "的简历,我已查阅，请你评估一下。若觉得合适，我们将安排面试，谢谢！");
            $(".popBox-forward .send").attr({"data-rid": rid, "data-jname": job_name, "data-jid": jid});
            $(".popBox-forward").show();
            $(".overlay").show();
        });
        $(".popBox-forward .send").click(function () {
            var $this = $(this);
            var text = $(this).text();
            var rid = $this.attr("data-rid");
            var job_name = $this.attr("data-jname");
            var jid = $this.attr("data-jid");
            var email = $.trim($(".popBox-forward .email").val());
            var content = $.trim($(".popBox-forward .email-content").val());
            var theme = $.trim($(".popBox-forward .email-theme").val());
            if (check(".popBox-forward")) {
                if (!regex.email.test(email)) {
                    $(".popBox-forward .email").addClass("error");
                } else if (can_request) {
                    can_request = false;
                    $this.text("发送中...");
                    rm_storage.options.tr_email = email;
                    resumeUtil.setOptionStorage();
                    $.ajax({
                        type: "post",
                        url: "/api/resume/transmit",
                        dataType: "json",
                        data: {
                            option: {
                                rid: rid,
                                job_name: job_name,
                                jid: jid,
                                email: email,
                                content: content,
                                subject: theme
                            }
                        },
                        success: function (data) {
                            can_request = true;
                            $this.text(text);
                            if (data.status == 10000) {
                                $(".overlay").hide();
                                $(".popBox").hide();
                                location.reload();
                            } else if (data.status == 10004) {
                                window.location.href = account_host+"/login?forward=" + forward;
                            }
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
        $(document).on("click", ".btn-interview", function () {
            $(".now").removeClass("now");
            var nick_name = global.nick_name;
            if(!(regex.phone.test(nick_name) || regex.tel.test(nick_name)))
                $(".popBox-interview .interviewer-1").val(nick_name);    //如果联系人不是邮箱或手机号，则进行赋值
            var _resume = $(this).closest(".resume-box");
            _resume.addClass("now");
            var jid = _resume.attr("data-jid");
            var rid = _resume.attr("data-rid");
            var jname = _resume.attr("data-jname");
            var email = _resume.attr("data-email");
            $(".popBox-interview .email").val(email);
            $(".popBox-interview .send").attr({"data-jid": jid, "data-rid": rid, "data-jname": jname});
            $(".popBox-interview").show();
            $(".overlay").show();
        });
        $(document).on("click", ".tab-ui li", function () {
            var i = $(this).index() > 0 ? $(this).index() : 0;
            $(".popBox-interview .send").attr("data-type", i);
            $(".tab-ui li").removeClass("active");
            $(this).addClass("active");
            $(".notice-box").hide();
            $(".notice-box").eq(i).show();
        });
        $(".popBox-interview .send").click(function () {
            var $this = $(this);
            var text = $(this).text();
            var jid = $this.attr("data-jid");
            var rid = $this.attr("data-rid");
            var jname = $this.attr("data-jname");
            if ($(this).attr("data-type") == "0" && check("#notice")) {
                var email = $.trim($(".popBox-interview .email").val());
                var theme = $.trim($(".popBox-interview .theme").val());
                var time = Date.parse($.trim($("#time-1").val()).replace(/-/g, "/"));
                var place = $.trim($(".popBox-interview .place").val());
                var interviewer = $.trim($(".popBox-interview .interviewer-1").val());
                var phone = $.trim($(".popBox-interview .phone-1").val());
                var content = $.trim($(".popBox-interview .notice-content").val());
                if (!regex.phone.test(phone)) {
                    $(".popBox-interview .phone-1").addClass("error");
                } else if (can_request) {
                    can_request = false;
                    $this.text("处理中...");
                    rm_storage.options.hr_name = interviewer;
                    rm_storage.options.address = place;
                    rm_storage.options.hr_phone = phone;
                    resumeUtil.setOptionStorage();
                    resumeUtil.manage({
                        rid: rid,
                        job_name: jname,
                        jid: jid,
                        status: 3,
                        original_status: global.original_status,
                        email: email,
                        interview_time: time,
                        hr_name: interviewer,
                        hr_phone: phone,
                        address: place,
                        content: content
                    },function (data) {
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            $(".resume-box.now").remove();
                            $(".overlay").hide();
                            $(".popBox").hide();
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }

            } else if ($(this).attr("data-type") == "1" && check("#arrange")) {
                var time = Date.parse($.trim($("#time-1").val()).replace(/-/g, "/"));
                var interviewer = $.trim($(".popBox-interview .interviewer-2").val());
                var phone = $.trim($(".popBox-interview .phone-2").val());
                if (!regex.phone.test(phone)) {
                    $(".popBox-interview .phone-1").addClass("error");
                } else if (can_request) {
                    can_request = false;
                    $this.text("处理中...");
                    rm_storage.options.hr_name = interviewer;
                    rm_storage.options.hr_phone = phone;
                    resumeUtil.setOptionStorage();
                    resumeUtil.manage({
                        rid: rid,
                        job_name: jname,
                        jid: jid,
                        status: 3,
                        original_status: 2,
                        interview_time: time,
                        hr_name: interviewer,
                        hr_phone: phone
                    },function(data){
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            $(".resume-box.now").remove();
                            $(".overlay").hide();
                            $(".popBox").hide();
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    });
                }
            }
        });

        //删除
        $(document).on("click", ".btn-delete", function () {
            $(".now").removeClass("now");
            var _resume = $(this).closest(".resume-box");
            _resume.addClass("now");
            var jid = _resume.attr("data-jid");
            var rid = _resume.attr("data-rid");
            $(".popBox-delete .send").attr({"data-rid": rid, "data-jid": jid});
            $(".popBox-delete").show();
            $(".overlay").show();
        });
        $(".popBox-delete .send").click(function () {
            var $this = $(this);
            var text = $(this).text();
            var jid = $(this).attr("data-jid");
            var rid = $(this).attr("data-rid");
            if (can_request) {
                can_request = false;
                $this.text("删除中...");
                $.ajax({
                    type: "post",
                    url: "/api/resume/clearStatus",
                    dataType: "json",
                    data: {
                        option: {
                            rid: rid,
                            jid: jid
                        }
                    },
                    success: function (data) {
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            $(".resume-box.now").remove();
                            $(".overlay").hide();
                            $(".popBox").hide();
                            location.reload();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });

        //本地存储
        /*$(".view-btn").click(function () {
            var rid = $(this).attr("data-rid");
            var ridArray;
            if(ridArray.indexOf(rid)>0) {
                fn.storage("ridArray",ridArray);
            }
        });*/

        //简历下载
        $(document).on("click", ".btn-download", function () {
            $(".popBox-download").show();
            $(".overlay").show();
        });
        $(".popBox-download .download").click(function () {
            $(".popBox-download").hide();
            $(".overlay").hide();
        });

        function check(box) {
            var flag = true;
            $(box).find(".req").each(function () {
                if (!$.trim($(this).val())) {
                    $(this).addClass("error");
                    flag = false;
                }
            });
            $(box).find(".req").blur(function () {
                if (!$.trim($(this).val())) {
                    $(this).addClass("error");
                }
            });
            $(box).find(".req").focus(function () {
                $(this).removeClass("error");
            });
            return flag;
        }
    });
});
