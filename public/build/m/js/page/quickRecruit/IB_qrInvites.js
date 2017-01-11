require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_zepto' ,'js/lib/IB_fastclick'], function (fn,$,FastClick) {
    var total = 0, page = 0, loadListOk,can_request = true;
    function LoadTopicList(type, status) {
        if (!loadListOk) return false;
        loadListOk = false;
        $('#loading').remove();
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='"+baseUrl+"/img/loading.gif' class='loading_icon'></div>");
        if (type) {
            $(window).scrollTop($('#loading').offset().top);
        } else {
            $(window).scrollTop(0);
        }
        $.ajax({
            url: "/api/quick_recruit_invite/getListByUser?page=" + page + "&status=" + status,
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var invites = data.data.invites;
                    var len = $('.listone').length;
                    var list_html = '';
                    var _btn_area = '';
                    var _hr_info = '';
                    var _failure_info = '';
                    for (var i = len; i < invites.length + len; ++i) {
                        var status_text = '';
                        switch (invites[i - len].status) {
                            case 1:
                                status_text = '待处理';
                                _btn_area = '<div class="btn-area"><span class="btn btn-accept btn-manage">接受</span><span class="btn btn-refuse btn-manage">拒绝</span></div>';
                                var days =7- Math.floor((+new Date-parseInt(invites[i-len].create_time))/(1000*60*60*24));
                                _failure_info = '<span class="iblock mp flr failure-info">距离自动失效还有<em>'+days+'</em>天</span>';
                                break;
                            case 2:
                                status_text = '已接受';
                                var hr_email = invites[i - len].hr_email;
                                _hr_info = '<div class="j-bottom"><p class="hr-info">企业联系方式为<em>'+hr_email+'</em></p></div>';
                                break;
                            case 3:
                                status_text = '已拒绝';
                                break;
                            case 4:
                                status_text = '已过期';
                                break;
                        }
                        if (invites[i - len].status == 3) {
                            try {
                                var interview_info = JSON.parse(invites[i - len].interview_info);
                                _hr_info= '<div class="j-bottom clearfix"> \
                                              <p class="hr-info clearfix">\
                                                <img src="'+baseUrl+'/img/iphone-icon.png" alt="" class="phone-icon fll iblock"/>\
                                                <span class="hr-name fll iblock">' + interview_info.hr_name + '</span>\
                                                <span class="hr-phone iblock fll">' + interview_info.hr_phone + '</span>\
                                              </p>\
                                              <p class="address-info clearfix">\
                                                <img src="'+baseUrl+'/img/icon-address.png" alt="" class="address-icon-light iblock fll"/>\
                                                <span class="interview-address iblock fll">' + interview_info.address + '</span>\
                                              </p>\
                                          </div>';
                            } catch (e) {
                            }
                        }
                        var payment = "面议";
                        if(invites[i - len].min_payment && invites[i - len].max_payment){
                            payment = invites[i - len].channel_type == 3 || invites[i - len].channel_type == 4 ? parseInt(invites[i - len].min_payment/10000) + "-" + parseInt(invites[i - len].max_payment/10000)+"万/年":invites[i - len].min_payment + "-" + invites[i - len].max_payment+"/天";
                        }
                        var workdays = invites[i - len].channel_type == 3 || invites[i - len].channel_type == 4 ?"": '<img src="'+baseUrl+'/img/icon-rili-gray.png" class="workdays-icon fll iblock">'+"<span class='workdays fll'>≥" + invites[i - len].workdays + "天</span>";
                        list_html += '<div class="listone job" data-jid="'+invites[i - len].job_id+'" data-id="'+invites[i - len].id+'" data-tid="'+invites[i - len].term_id+'">\
                                        <div class="info-top clearfix">\
                                            <span class="iblock mp fll up-time">'+new Date(invites[i - len].update_time).format("yyyy-MM-dd")+'</span>\
                                            '+_failure_info+'\
                                        </div>\
                                        <div class="job_info">\
                                            <h3 class="j-top clearfix">\
                                                <a class="job-name ellipsis iblock mp fll" href="/job/detail/' + invites[i - len].job_id + '?forward='+encodeURIComponent(location.href)+'">' + invites[i - len].job_name + '</a>\
                                                <span class="iblock mp fll">-</span>\
                                                <span class="company-name ellipsis iblock mp fll">' + invites[i - len].company_name + '</span>\
                                            </h3>\
                                            <div class="j-mid clearfix">\
                                                <img src="'+baseUrl+'/img/icon-address-gray.png" alt="" class="address-icon fll iblock">\
                                                <span class="address fll">' + invites[i - len].city + '</span>\
                                                '+workdays+'\
                                                <span class="payment fll">￥' + payment + '</span>\
                                            </div>\
                                            '+_hr_info+'\
                                       </div>\
                                       <i class="circle"></i>\
                                       '+_btn_area+'\
                                    </div>\
                                  </div>';
                    }
                    if (!type && !invites.length) {
                        $('#list').html("<p class='tac w100 none-job'>暂无相符的快招信息</p>");
                    }
                    $("#list").append(list_html);
                } else {
                    $('#loading').html('加载失败，请重试!');
                }
                loadListOk = true;
            },
            error: function () {
                $('#loading').html('加载失败，请重试!');
                loadListOk = true;
            }
        });
    }
    function changeQrState(can_request,type,rid,callback){
        if(can_request){
            $(".qr-state").text("处理中...");
            $.ajax({
                type: "post",
                url: "/api/u_resume/update/" + rid,
                dataType: "json",
                data: {
                    option: {
                        is_public: type
                    }
                },
                success: function (data) {
                    can_request = true;
                    callback(data);

                }
            });
        }
    }

    $(function () {
        FastClick.attach(document.body);
        loadListOk = true;
        var _status = location.href.split('#')[1] || 1;
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        // $('.nav').eq(_status-1).addClass('active');
        LoadTopicList(0, _status);
        $('.nav').on("click", function (e) {
            e.preventDefault();
            if ($(this).hasClass('active') || !loadListOk) return false;
            $('.nav.active').removeClass('active');
            $(this).addClass('active');
            location.href = location.href.split('#')[0]+'#'+$(this).attr('data-status');
            $('#list').empty();
            LoadTopicList(0, $(this).attr('data-status') || 1, $('.selection span.active').attr('data-interviewed'));
        }).eq(_status-1).addClass('active');
        $('.selection span').on("click", function (e) {
            e.preventDefault();
            if ($(this).hasClass('active') || !loadListOk) return false;
            $('.selection span.active').removeClass('active');
            $(this).addClass('active');
            $('#list').empty();
            LoadTopicList(0, $('.nav.active').attr('data-status') || 1, $(this).attr('data-interviewed'));
        });

        //qr
        var rid = global.rid;
        $(document).on("click",".btn-join.off",function(){
            changeQrState(can_request,1,rid,function(data){
                if (data.status == 10000) {
                    $(".btn-join").removeClass("off").addClass("on");
                    $(".qr-state").text("快招已开通");
                } else if (data.status == 10004) {
                    window.location.href = account_host+"/login?forward=" + forward;
                }else if(data.status == 10006){
                    window.location.href = "/private/resumeCreate";
                }
            });
        });
        $(document).on("click",".btn-join.on",function(){
            $(".popBox-qrClose").show().addClass("fadeIn");
            $(".overlay").show();
        });
        $(".popBox .btn-cancel,.overlay").click(function(){
            $(".popBox-qrClose").removeClass("fadeIn").hide();
            $(".overlay").hide();
        });
        $(".popBox .btn-confirm").click(function(){
            changeQrState(can_request,0,rid,function(data){
                if (data.status == 10000) {
                    $(".btn-join").removeClass("on").addClass("off");
                    $(".qr-state").text("开通快招");
                    setTimeout(function(){
                        $(".popBox-qrClose").removeClass("fadeIn").hide();
                        $(".overlay").hide();
                    },300);
                } else if (data.status == 10004) {
                    window.location.href = account_host+"/login?forward=" + forward;
                }else if(data.status == 10006){
                    window.location.href = "/private/resumeCreate";
                }
            });
        });

        $(document).on("click",".btn-manage",function(){
            var $this =  $(this);
            var $job = $this.closest(".job");
            var jid = $job.attr("data-jid");
            var id = $job.attr("data-id");
            var term_id = $job.attr("data-tid");
            var type = 1;//接受
            var response = 2;
            if($(this).hasClass("btn-refuse")){
                type = 0;
                response = 3;
            }
            if(can_request){
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type:"post",
                    url:"/api/quick_recruit/response",
                    dataType:"json",
                    data:{
                        option:{
                            id:id,
                            jid:jid,
                            term_id:term_id,
                            response:response
                        }
                    },
                    success:function(data){
                        can_request = true;
                        if(data.status == 10000 && type){
                            $job.find(".btn-area .btn").remove();
                            $job.find(".btn-area").append('<span class="btn btn-accepted">已接受</span>');
                        }else if(data.status == 10000 && !type){
                            $job.find(".btn-area .btn").remove();
                            $job.find(".btn-area").append('<span class="btn btn-refused">已拒绝</span>');
                        }else if(data.status == 10006){
                            $job.find(".btn-area .btn").remove();
                            $job.find(".btn-area").append('<span class="btn btn-refused">邀请已过期</span>');
                        }
                    }
                });
            }
        });

    });
    $(window).scroll(function () {
        var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
        if (scrollBottom <= 4 && !!total && total > page) LoadTopicList(1, $('.nav.active').attr('data-status'));
    });
});