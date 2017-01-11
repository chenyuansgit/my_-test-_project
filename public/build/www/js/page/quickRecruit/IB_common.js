;(function(window){
    var account_host;
    try{
        account_host = global.account_host;
    }catch(e){}
    var can_request = true;
    var quickRecruit = {
        applyBind : function(){
            $(".popBox-join .btn-apply").click(function(){
                var $this = $(this);
                var term_id = $this.attr("data-term-id");
                if(can_request && term_id > 0){
                    can_request = false;
                    $this.text("申请中...");
                    $.ajax({
                        type:"post",
                        url:"/api/quickRecruit/apply",
                        dataType:"json",
                        data:{
                            term_id : term_id
                        },
                        success:function(data){
                            can_request = true;
                            $this.text("申请快招精选");
                            if(data.status == 10000){
                                $this.replaceWith("<span class='btn btn-applied'>已申请</span>");
                                $(".popBox-join").hide();
                                $(".popBox-apply-succ").show();
                            }else if(data.status == 10001){
                                $(".overlay").show();
                                $(".popBox").hide();
                                $(".popBox-apply-again").show();
                            }else if(data.status == 10004){
                                window.location.href =account_host+"/login?forward="+encodeURIComponent(window.location.href);
                            }else if(data.status == 10006){
                                $(".overlay").show();
                                $(".popBox").hide();
                                $(".popBox-no-resume").show();
                            }
                        }
                    });
                }
            });
        },
        inviteInit : function(invite_type){
            quickRecruit.getMine(invite_type);
            quickRecruit.positionAddEvent(invite_type);
        },
        sendInviteBind: function (type){
            $(".popBox-quickRecruit .btn-invite").click(function(){
                var $this = $(this);
                var option = {};
                if(type == "common"){
                    var jid = $(".popBox-quickRecruit .job.curr").attr("data-jid");
                    var rid = $this.attr("data-rid");
                    var version = $this.attr("data-version");
                    var text = $.trim($(".popBox-quickRecruit .invite-content").val());
                    option.jid = jid;
                    option.resume_id = rid;
                    option.version = version;
                    option.text = text;
                }else if(type == "special"){
                    var jid = $(".popBox-quickRecruit .job.curr").attr("data-jid");
                    var content_id = $this.attr("data-content-id");
                    var text = $.trim($(".popBox-quickRecruit .invite-content").val());
                    option.jid = jid;
                    option.content_id = content_id;
                    option.text = text;
                }
                if (can_request && option.jid){
                    $this.text("发送中...");
                    can_request = false;
                    $.ajax({
                        type: "post",
                        url: "/api/quickRecruit/invite",
                        dataType: "json",
                        data: {
                            option: option
                        },
                        success: function (data) {
                            can_request = true;
                            $this.text("发送");
                            if (data.status == 10000) {
                                $(".overlay").show();
                                $(".popBox-quickRecruit").hide();
                                $(".popBox-invite-succ").show();
                               /* if($this.attr("data-type") == "list"){
                                    var _tag = $(".talent-info.now");
                                    _tag.remove(".invite-tag").append("<span class='invite-tag'></span>");
                                }*/
                            } else if (data.status == 10002) {
                                alert("服务器错误，请刷新重试");
                            } else if (data.status == 10004) {
                                window.location.href = "/login?forward=" + encodeURIComponent(window.location.href);
                            } else if(data.status == 10001){
                                $(".overlay").show();
                                $(".popBox").hide();
                                $(".popBox-invite-again").show();
                            }
                        }
                    });
                }else if(!option.jid){
                    alert("请选择一个有效的职位进行邀请~");
                }
            });
        },
        positionChangeBind : function(){
            $(document).on("click", ".popBox-quickRecruit .job", function () {
                $(".popBox-quickRecruit .job.curr").removeClass("curr");
                $(this).addClass("curr");
            });
        },
        positionAddEvent: function(invite_type){
            $(".popBox-quickRecruit .job-add .btn-refresh").click(function(){
                quickRecruit.getMine(invite_type);
            });
        },
        getMine : function(invite_type){
            var _html = $(" .job-add .btn-refresh").html();
            $(" .job-add .btn-refresh").html("<i></i>正在刷新...");
            $.ajax({
                type: "get",
                url: "/api/jobs/mine",
                dataType: "json",
                success: function (data) {
                    $(" .job-add .btn-refresh").html(_html);
                    if(data.status == 10000){
                        $(".popBox-quickRecruit .company-name").text(data.data.company.name);
                        var jobs = data.data.jobs;
                        if(!jobs.length){
                            $(".popBox-quickRecruit .jobs").html("");
                           // $(".popBox-quickRecruit .jobs").append("<p class='no-job'>您没有可以邀请的有效职位，快去创建一下新职位吧~</p>");
                        }else{
                            $(".popBox-quickRecruit .jobs").html("");
                            for (var i = 0, len = jobs.length; i < len; i++) {
                                var job = "<div class='job' data-jid=" + jobs[i].jid + ">\
                                             <span class='sel-circle'></span>\
                                             <span class='job-name' title='" + jobs[i].name + "'>" + jobs[i].name + "</span>\
                                            </div>";
                                $(".popBox-quickRecruit .jobs").append(job);
                            }
                            $(".popBox-quickRecruit .btn-invite").unbind();
                            quickRecruit.positionChangeBind();
                            quickRecruit.sendInviteBind(invite_type);
                        }
                    }
                }
            });
        }
    };

    if(typeof define == "function" && define.amd){
        define(["js/lib/IB_jquery"],function(){
            return quickRecruit;
        });
    }else{
        window.quickRecruit = quickRecruit;
    }
})(this);