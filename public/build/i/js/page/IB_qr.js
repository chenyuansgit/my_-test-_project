/**
 * Created by zhphu on 16/5/10.
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
        }
    }
});
require(['js/lib/IB_zepto', 'js/lib/IB_fastclick', 'js/lib/IB_fn','js/lib/IB_iscroll', 'js/lib/IB_wxAuth', 'js/lib/IB_jweixin'], function ($, FastClick,fn,IScroll, wxAuth, wx) {
    var account_host;
    try{
        account_host = global.account_host;
    }catch(e){}
    function removePopTips() {
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
    function getMine(can_request){
        if(can_request){
            can_request = false;
            $.ajax({
                url:"/api/jobs/mine",
                type:"get",
                dataType:"json",
                success:function(data){
                    can_request = true;
                    if(data.status == 10000){
                        var jobs = data.data.jobs;
                        if(jobs.length){
                            var job = "";
                            for(var i=0,len=jobs.length;i<len;i++){
                                job +=  "<li class='sel-tab job' data-type='1' data-jid='"+jobs[i].jid+"' data-name='"+jobs[i].name+"'><span>"+jobs[i].name+"</span><i class='sel-circle'></i></li>";
                            }
                            $(".jobs").empty().append(job);
                        }
                    }
                }
            });
        }
    }
    function sendInvite($this,type,can_request){
        if(can_request){
            var option = {};
            option.jid = $(".job-select .selected").attr("data-jid");
            option.text = $(".invite-content").text().trim();
            if(type == "common"){
                option.resume_id = global.rid;
                option.version = global.version;
            }else if(type == "special"){
                option.content_id = global.content_id;
            }
            can_request = false;
            var text = $this.text();
            $this.text("发送中...");
            $.ajax({
                type: "post",
                url: "/api/quick_recruit/invite",
                dataType: "json",
                data: {
                    option: option
                },
                success: function (data) {
                    can_request = true;
                    $this.text(text);
                    if (data.status == 10000) {
                        $(".popTips").show().text("邀请成功").addClass("fadeIn");
                        removePopTips();
                        removeEditBlock($(".edit-block-invite"));
                    } else if (data.status == 10002) {
                        alert("服务器错误，请刷新重试");
                    } else if (data.status == 10004) {
                        window.location.href = account_host+"/login?forward=" + encodeURIComponent(window.location.href);
                    } else if(data.status == 10001){
                        $(".popTips").show().text("同一职位不能重复邀请").addClass("fadeIn");
                        removePopTips();
                    }
                }
            });
        }
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

        var can_request = true;
        var forward = encodeURIComponent(window.location.href);
        var uid = global.uid;
        var type = global.type;
        var rid = global.rid;
        var version = global.version;

        var from = decodeURIComponent($.trim(fn.getQueryString("forward")));
        $(".header .back").attr("href",from || "/");

        $(".edit-block .back").click(function(){
            var $editBlock = $(this).closest(".edit-block");
            removeEditBlock($editBlock);
        });
        $(".selector .back").click(function(){
            var $editBlock = $(this).closest(".selector");
            removeEditBlock($editBlock);
        });
        $(".btn-invite").click(function(){
            showEditBlock($(".edit-block-invite"));
        });
        var clickNum = 0;
        getMine(can_request);
        $(".edit-block .job-select").click(function(){
            showEditBlock($(".selector-job"));
            if(!clickNum){
                var scroller = new IScroll(document.getElementById("scroll-jobs"),{
                    mouseWheel: true,
                    snap: "li",
                    preventDefault:false
                });
                clickNum +=1;
            }

        });

        $(document).on("click",".btn-like.off",function(){
            var $this = $(this);
            if(can_request){
                can_request = false;
                $.ajax({
                    url : "/api/talentPool/support",
                    type : "post",
                    dataType : "json",
                    data : {
                        option:{
                            support_id : uid
                        }
                    },
                    success : function(data){
                        can_request = true;
                        if(data.status == 10000){
                            $this.removeClass("off").addClass("on");
                        }else if (data.status == 10002) {
                            alert("不能自己支持自己哦~");
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });


        $(document).on("click",".sel-tab.job",function(){
            var $this = $(this);
            $(".sel-tab.job.curr").removeClass("curr");
            $this.addClass("curr");
            var jid = $this.attr("data-jid");
            var jname = $this.attr("data-name");
            $(".edit-block .job-name").text(jname).attr("data-jid",jid).addClass("selected");
            removeEditBlock($(".selector-job"));

        });

        $(".edit-block .btn-send").click(function () {
            if($(".job-select .job-name").hasClass("selected")){
                sendInvite($(this),type,can_request);
            }else{
                $(".popTips").show().text("请选择有效职位邀请").addClass("fadeIn");
                removePopTips();
            }
        });

        var data_src = $('.share-back').attr('data-img');
        var imgUrl = data_src.indexOf('http') > -1 ? data_src : ('http://' + location.hostname + data_src);
        wxAuth.jsApiAuth({
            url: window.location.href.split('#')[0]
        }, function (err) {
            console.log(err);
            wx.onMenuShareTimeline({
                title: $('.share-back').attr('data-title'), // 分享标题
                desc: $('.share-back').attr('data-desc'),
                imgUrl: imgUrl, // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
            wx.onMenuShareAppMessage({
                title: $('.share-back').attr('data-title'), // 分享标题
                desc: $('.share-back').attr('data-desc'),
                imgUrl: imgUrl, // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
        });
        if (wxAuth.isWeixin) {
            $('.share-back').on("click", function (e) {
                e.preventDefault();
                $(this).addClass('none');
            });
            $("#share").on("click", function () {
                $('.share-back').removeClass('none');
            });
        }

    });

});