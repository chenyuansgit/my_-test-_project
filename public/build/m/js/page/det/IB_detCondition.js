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
    function LoadTopicList(type) {
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
            url: "/api/det/getConditionList?page=" + (page+1),
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var jobs = data.data.dets;
                    var len = $('.listone').length;
                    /*$(".new").removeClass('new');*/
                    var list_html = '';
                    for (var i = len; i < jobs.length + len; ++i) {
                        var status_text = '投递成功';
                        var payment = "面议";
                        if(jobs[i - len].min_payment && jobs[i - len].max_payment){
                            payment = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ? parseInt(jobs[i - len].min_payment/10000) + "-" + parseInt(jobs[i - len].max_payment/10000)+"万/年":jobs[i - len].min_payment + "-" + jobs[i - len].max_payment+"/天";
                        }
                        var workdays = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"": "<img src='" + baseUrl + "/img/icon-rili-gray.png' class='workdays-icon fll iblock'/><span class='workdays fll'>≥" + jobs[i - len].workdays + "天</span>";
                        list_html += '<a class="listone apply-info clearfix" href="/det/detail/'+jobs[i - len].jid+'?forward='+encodeURIComponent(location.href)+'">\
                           <div class="company-info clearfix">\
                            <img class="company-logo iblock fll" src="' + jobs[i - len].company_avatar + '">\
                            <span class="company-name ellipsis iblock mp fll">' + jobs[i - len].company_name + '</span>\
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
                        list_html += '投递于' + new Date(parseInt(jobs[i - len].delivery_time)).format('yyyy-MM-dd');
                        list_html += '</span><span class="status flr">【' + status_text + '】</span></div><i class="circle"></i>';
                        list_html += '</div></a>';
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
        LoadTopicList();
    });
    $(window).scroll(function () {
        var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
        if (scrollBottom <= 4 && !!total && total > page) LoadTopicList();
    });
});