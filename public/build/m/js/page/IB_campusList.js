/**
 * Created by zhphu on 16/8/18.
 */
require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_fastclick',"js/lib/IB_swiper",'js/lib/IB_lazyload'], function (fn, FastClick) {

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

    function LoadTopicList(scroll, type) {
        if (!loadListOk) return false;
        loadListOk = false;
        $('#loading').remove();
        if(!scroll){
            $('#list').empty();
        }
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='" + baseUrl + "/img/loading.gif' class='loading_icon'></div>");
        if (scroll) {
            $(window).scrollTop($('#loading').offset().top);
        }
        $.ajax({
            url: "/j/search?lt=time&ct=3,4&page=" + (scroll ? (page + 1) : 1),
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
                        var detail_link = jobs[i - len].channel_type == 2 || jobs[i - len].channel_type == 4 ? "/det/detail/":"/job/detail/";
                        var payment = "面议";
                        var campus_mark = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"<i class='icon-corner icon-corner-campus'></i>" :" ";
                        if(jobs[i - len].min_payment && jobs[i - len].max_payment){
                            payment = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ? parseInt(jobs[i - len].min_payment/10000) + "-" + parseInt(jobs[i - len].max_payment/10000)+"万/年":jobs[i - len].min_payment + "-" + jobs[i - len].max_payment+"/天";
                        }
                        var workdays = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"": "<img src='" + baseUrl + "/img/icon-rili-gray.png' class='workdays-icon fll iblock'/><span class='workdays fll'>≥" + jobs[i - len].workdays + "天</span>";

                        list_html += "<a href='"+detail_link+jobs[i - len].jid + "?forward="+encodeURIComponent(window.location.href)+"' class='listone clearfix w100'>\
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
                            <img src='" + baseUrl + "/img/icon-address-gray.png' alt='' class='address-icon fll iblock'/>\
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
    //加载底部下载banner
    function loadDownloadBanner(){
        //判断是否在两个小时手动关闭过
        if(window.localStorage && window.localStorage.getItem && localStorage.getItem('smart_banner_time')&& (+new Date)-parseInt(localStorage.getItem('smart_banner_time'))<2*60*60*1000){
            return false;
        }
        $('#download').show();
    }
    function removeDownloadBanner(){
        $('#download').remove();
        if(window.localStorage && window.localStorage.setItem){
            localStorage.setItem('smart_banner_time',+new Date);
        }
    }
    $(function () {
        FastClick.attach(document.body);
        var forward = decodeURIComponent($.trim(fn.getQueryString('forward')));
        $('.back').attr('href', forward || '/');
        loadDownloadBanner();
        loadListOk = true;
        switch(location.href.split('#')[1]){
            case 'b':
                $('.rec').addClass('active');
                LoadTopicList(0,'recommend');
                break;
            case 'c':
                $('#loading').remove();
                $('.interpolation').addClass('active');
                $('.interpolation-list').show();
                break;
            default:
                $('.all').addClass('active');
                LoadTopicList(0);
                break;
        }

        var swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            speed: 600,
            autoplay: 4000,
            autoplayDisableOnInteraction: false,
            // preventClicks:false,
            // preventClicksPropagation:true,
            loop: true
        });
        $('#download .download-close').on('click',function(){
            removeDownloadBanner();
        });
        $(window).scroll(function () {
            var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
            if (scrollBottom <= 4 && !!total && total > page && !$('.nav .active.interpolation').length) LoadTopicList(1,$('.nav .active').attr('data-recommend-id')==1?'recommend':'');
        });
        $(document).on('click', '.nav a', function () {
            var that = $(this);
            if (that.hasClass('active')) {
                return false;
            }
            $('.nav a.active').removeClass('active');
            that.addClass('active');
            switch (that.attr('data-recommend-id')) {
                case '0':
                    $('.interpolation-list').hide();
                    LoadTopicList(0);
                    break;
                case '1':
                    $('.interpolation-list').hide();
                    LoadTopicList(0, 'recommend');
                    break;
                default:
                    $('.interpolation-list').show();
                    $('#list').empty();
                    break;
            }
        });
    });
});