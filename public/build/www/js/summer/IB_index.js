//公司搜索及职位搜索
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick', 'js/common/IB_fn', 'js/lib/IB_jweixin','js/lib/IB_wxAuth'], function ($,FastClick, fn, wx ,wxAuth) {
    $(function () {
        var type = global.type;
        var can_request = true;
        $(document).on("click",".btn-join.on",function(){
            $(".overlay").show();
            $(".popTips-join").show();
        });
        $(".btn-cancel,.overlay").click(function(){
            $(".overlay").hide();
            $(".popTips-join").hide();
        });
        $(document).on("click",".popTips-join .btn-confirm.on",function(){
            var url = type=="employer" ? "/api/summer/companyJoin":"/api/summer/userJoin";
            var $this = $(this);
            var text = $this.text();
            if(type=="employer" && (global.validate=="undefined" || !parseInt(global.validate))){
                location.href= "/company/validate";
            }else{
                if(can_request){
                    can_request = false;
                    $this.text("申请中..");
                    $.ajax({
                        url : url,
                        type : "post",
                        dataType : "json",
                        success : function(data){
                            can_request = true;
                            $this.text(text);
                            if(data.status == 10000 || data.status == 10007){
                                $this.removeClass("on").addClass("off").text("已加入");
                                $(".btn-join").removeClass("on").addClass("off").text("已加入暑期实习");
                                $(".btn-select").attr("data-state",1);
                                if(type=="employer"){
                                    location.href = "/employer/summer/resumeList";
                                }
                            }else if(data.status == 10004){
                                location.href = "/login?forward="+encodeURIComponent(location.href);
                            }else if(data.status == 10006 && type=="user"){
                                location.href = "/private/resumeCreate?forward="+encodeURIComponent(location.href);
                            }
                        }
                    });
                }
            }

        });

        $(document).on("click",".btn-select",function(){
            var state = parseInt($(this).attr("data-state"));
            if(state){
                location.href = "/employer/summer/resumeList";
            }else{
                $(".overlay").show();
                $(".popTips-join").show();
            }
        });
        //微信分享
        wxAuth.jsApiAuth({
            url: window.location.href.split('#')[0]
        }, function (err) {
            console.log(err);
            wx.onMenuShareTimeline({
                title: "2016暑期实习风暴月，挑选最适合你的职位", // 分享标题
                desc: "优质的实习职位都在这里，这个暑假，可以换一种方式找实习了",
                imgUrl: "http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/658670ae231f6ea563d047879276baed.png", // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
            wx.onMenuShareAppMessage({
                title: "2016暑期实习风暴月，挑选最适合你的职位", // 分享标题
                desc: "优质的实习职位都在这里，这个暑假，可以换一种方式找实习了",
                imgUrl: "http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/658670ae231f6ea563d047879276baed.png", // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
        });
    });
});