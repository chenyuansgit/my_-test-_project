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
    var total = 0, page = 0, loadListOk;
    function LoadTopicList(type, status, interviewed) {
        if (!loadListOk) return false;
        if (status == 3) {
            $('.selection').show();
            $('#list').css('padding-bottom', '4rem');
        } else {
            $('.selection').hide();
            $('#list').css('padding-bottom', '0');
        }
        loadListOk = false;
        $('#loading').remove();
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='"+baseUrl+"/img/loading.gif' class='loading_icon'></div>");
        if (type) {
            $(window).scrollTop($('#loading').offset().top);
        } else {
            $(window).scrollTop(0);
        }
        $.ajax({
            url: interviewed !== '0' || interviewed !== '1' ? ("/api/u_job/getConditionList?page=" + (type?(page+1):1) + "&status=" + status + "&interviewed=" + interviewed) : ("/api/u_job/getConditionList?page=" + page + "&status=" + status),
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var jobs = data.data.jobs;
                    var len = $('.listone').length;
                    /*$(".new").removeClass('new');*/
                    var list_html = '';
                    for (var i = len; i < jobs.length + len; ++i) {
                        var status_text = '';
                        switch (jobs[i - len].status) {
                            case 1:
                                status_text = '待筛选';
                                break; 
                            case 2:
                                status_text = '待沟通';
                                break;
                            case 3:
                                status_text = '通知面试';
                                break;
                            case 4:
                                status_text = '不合适';
                                break;
                        }
                        var payment = "面议";
                        if(jobs[i - len].min_payment && jobs[i - len].max_payment){
                            payment = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ? parseInt(jobs[i - len].min_payment/10000) + "-" + parseInt(jobs[i - len].max_payment/10000)+"万/年":jobs[i - len].min_payment + "-" + jobs[i - len].max_payment+"/天";
                        }
                        var workdays = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"": "<img src='" + baseUrl + "/img/icon-rili-gray.png' class='workdays-icon fll iblock'/><span class='workdays fll'>≥" + jobs[i - len].workdays + "天</span>";
                        list_html += '<div class="listone apply-info" data-channel-type="'+jobs[i - len].channel_type+'" data-jid="'+jobs[i - len].job_id+'" data-jname="'+jobs[i - len].name+'" data-jtime="'+jobs[i - len].refresh_time+'" data-min-payment="'+jobs[i - len].min_payment+'" data-max-payment="'+jobs[i - len].max_payment+'" data-workdays="'+jobs[i - len].workdays+'" data-city="'+jobs[i - len].city+'" data-cid="'+jobs[i - len].company_id+'" data-logo="'+jobs[i - len].company_avatar+'" data-cname="'+jobs[i - len].company_name+'">\
                           <div class="company-info clearfix">\
                            <img class="company-logo iblock fll" src="' + jobs[i - len].company_avatar + '">\
                            <span class="company-name ellipsis iblock mp fll">' + jobs[i - len].company_name + '</span>\
                        <span class="iblock mp fll">-</span>\
                            <span class="company-type iblock mp fll">' + jobs[i - len].company_type + '</span>\
                            </div>\
                            <div class="job_info">\
                            <h3 class="j-top">' + jobs[i - len].name + '</h3>\
                            <div class="j-mid clearfix">\
                            <img src="'+baseUrl+'/img/icon-address-gray.png" alt="" class="address-icon fll iblock">\
                            <span class="address fll">' + jobs[i - len].city + '</span>\
                            '+workdays+'\
                        <span class="payment fll">￥' + payment + '</span>\
                            </div>\
                            <div class="j-bottom clearfix">\
                            <span class="time fll">';
                        if (jobs[i - len].status != 3) {
                            list_html += '投递于' + new Date(parseInt(jobs[i - len].delivery_time)).format('yyyy-MM-dd');
                        } else {
                            list_html += '面试时间' + new Date(parseInt(jobs[i - len].interview_time)).format('yyyy-MM-dd');
                        }
                        list_html += '</span><span class="status flr">【' + status_text + '】</span></div></a><i class="circle"></i>';
                        if (jobs[i - len].status == 3) {
                            try {
                                var interview_info = JSON.parse(jobs[i - len].interview_info);
                                list_html += '    <p class="hr-info clearfix">\
                                   <img src="'+baseUrl+'/img/iphone-icon.png" alt="" class="phone-icon fll iblock"/>\
                                    <span class="hr-name fll iblock">' + interview_info.hr_name + '</span>\
                                    <span class="hr-phone iblock fll">' + interview_info.hr_phone + '</span>\
                                    </p>\
                                    <p class="address-info clearfix">\
                                    <img src="'+baseUrl+'/img/icon-address.png" alt="" class="address-icon-light iblock fll"/>\
                                    <span class="interview-address iblock fll">' + interview_info.address + '</span>\
                                    </p>';
                            } catch (e) {
                            }
                        }
                        list_html += '</div></div>';
                    }
                    if (!type && !jobs.length && page==1) {
                        $('#list').html("<p class='tac w100 none-job'>暂无相符的职位信息</p>");
                    }
                    $("#list").append(list_html);
                    /*                    $(".new.lazy").lazyload({
                     effect: "fadeIn"
                     });*/
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

    $(function () {
        FastClick.attach(document.body);
        loadListOk = true;
        var _status = location.href.split('#')[1] || 1;
       // $('.nav').eq(_status-1).addClass('active');
        LoadTopicList(0, _status);
        $('.nav.normal').on("click", function (e) {
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

        $(document).on("click",".apply-info",function(){
            var $this = $(this);
            var apply_info = {};
            apply_info.company_id = $this.attr("data-cid");
            apply_info.company_name = $this.attr("data-cname");
            apply_info.company_avatar = $this.attr("data-logo");
            apply_info.job_id = $this.attr("data-jid");
            apply_info.name = $this.attr("data-jname");
            apply_info.refresh_time = $this.attr("data-jtime");
            apply_info.min_payment = $this.attr("data-min-payment");
            apply_info.max_payment = $this.attr("data-max-payment");
            apply_info.workdays = $this.attr("data-workdays");
            apply_info.city = $this.attr("data-city");
            apply_info.channel_type = $this.attr("data-channel-type");
            fn.storage("m_job_apply_info",JSON.stringify(apply_info));
            location.href = "/private/resumeCondition/"+apply_info.job_id+"?forward="+encodeURIComponent(location.href);

        });
    });
    $(window).scroll(function () {
        var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
        if (scrollBottom <= 4 && !!total && total > page) LoadTopicList(1, $('.nav.active').attr('data-status'));
    });
});