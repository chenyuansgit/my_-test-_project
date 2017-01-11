require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_fastclick','js/lib/IB_lazyload'], function (fn,FastClick) {
    var total = 0, page = 0, loadListOk;
    function getJobTime(refresh_timestamp){
        var job_time;
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        var today_timestamp = +today;
        if(refresh_timestamp > today_timestamp && refresh_timestamp - today_timestamp < 24*60*60*1000){
            var job_timestamp = +new Date() - refresh_timestamp;
            if(job_timestamp < 2 * 60 * 1000){
                job_time = "1分钟前"
            }else if(job_timestamp <  60 * 60 * 1000){
                job_time = Math.ceil(job_timestamp/(1000*60)) +"分钟前"
            }else if(job_timestamp < 24*60*60*1000){
                job_time = Math.ceil(job_timestamp/(1000*60*60)) +"小时前"
            }
        }else if(refresh_timestamp > today_timestamp - 24*60*60*1000){
            job_time = "1天前"
        }else if(refresh_timestamp > today_timestamp - 2*24*60*60*1000){
            job_time = "2天前"
        }else if(refresh_timestamp > today_timestamp - 3*24*60*60*1000){
            job_time = "3天前"
        }else{
            var year_now = parseInt(new Date().format("yyyy"));
            var year_create = parseInt(new Date(parseInt(refresh_timestamp)).format("yyyy"));
            if(year_now > year_create){
                job_time = new Date(parseInt(refresh_timestamp)).format("yyyy.MM.dd");
            }else{
                job_time = new Date(parseInt(refresh_timestamp)).format("MM月dd日");
            }
        }
        return job_time;
    }
    function LoadTopicList(type,option) {
        if (!loadListOk || !isSub) return false;
        loadListOk = false;
        $('#loading').remove();
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='"+baseUrl+"/img/loading.gif' class='loading_icon'></div>");
        if (type) {
            $(window).scrollTop($('#loading').offset().top);
        }
        $.ajax({
            url: "/j/search?lt=time&page=" + (type?(page+1):1)+"&cid="+option.city_id+"&wk="+option.workdays+"&k="+option.key+"&pt="+option.payment_type+"&et="+option.education_type,
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var jobs = data.data.jobs;
                    var len = $('.listone').length;
                    $(".new").removeClass('new');
                    var list_html = '';
                    for (var i = len; i < jobs.length + len; ++i) {
                        var jobChannel = jobs[i - len].channel_type == 2 || jobs[i - len].channel_type == 4 ? "det" :"job";
                        var campus_mark = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"<i class='icon-corner icon-corner-campus'></i>" :" ";
                        var payment = "面议";
                        if(jobs[i - len].min_payment && jobs[i - len].max_payment){
                            payment = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ? parseInt(jobs[i - len].min_payment/10000) + "-" + parseInt(jobs[i - len].max_payment/10000)+"万/年":jobs[i - len].min_payment + "-" + jobs[i - len].max_payment+"/天";
                        }
                        var workdays = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"": "<img src='" + baseUrl + "/img/icon-rili-gray.png' class='workdays-icon fll iblock'/><span class='workdays fll'>≥" + jobs[i - len].workdays + "天</span>";
                        list_html += "<a href='/"+jobChannel+"/detail/" + jobs[i - len].jid + "?forward="+encodeURIComponent(window.location.href)+"' class='listone clearfix w100'>\
                            "+campus_mark+"\
                            <div class='left iblock job-icon new lazy fll' data-original = '" + jobs[i - len].company_avatar + "'></div>\
                            <div class='right fll'>\
                            <p class='j-title iblock clearfix'>\
                            <span class='name fll'>" + jobs[i - len].name + "</span>\
                            <span class='time flr'>" + getJobTime(parseInt(jobs[i - len].refresh_time)) + "</span>\
                        </p>\
                        <p class='j-mid clearfix'>\
                            <span class='company_name ellipsis fll'>" + jobs[i - len].company_name + "</span>\
                            </p>\
                            <p class='j-bottom iblock clearfix'>\
                            <img src='"+baseUrl+"/img/icon-address-gray.png' alt='' class='address-icon fll iblock'/>\
                            <span class='address fll'>" + jobs[i - len].city + "</span>\
                            "+workdays+"\
                        <span class='payment fll'>￥" + payment + "</span>\
                            </p>\
                            </div>\
                            </a>";
                    }
                    $("#list").append(list_html);
                    $(".new.lazy").lazyload({
                        effect: "fadeIn"
                    });
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
    function getSearchOption(){
        return {
            workdays:$('.workdays').attr('data-workdays')||'',
            city_id:$('.city').attr('data-city-id')||'',
            key:$('.key').attr('data-key')||'',
            education_type:$('.education').attr('data-education-type')||'',
            payment_type:$('.payment').attr('data-payment-type')||''
        };
    }
    $(function () {
        FastClick.attach(document.body);
        loadListOk = true;
        LoadTopicList(0,getSearchOption());
    });
    $(window).scroll(function () {
        var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
        if (scrollBottom <= 4 && !!total && isSub && total > page) LoadTopicList(1,getSearchOption());
    });
});