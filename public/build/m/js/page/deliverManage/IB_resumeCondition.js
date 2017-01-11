/**
 * Created by zhphu on 16/7/13.
 */
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
    var can_request;
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
    $(function () {
        FastClick.attach(document.body);
        can_request = true;
        var forward = decodeURIComponent(fn.getQueryString("forward"));
        if (forward && forward.indexOf("resumeCreate") == -1) {
            $(".header .back").attr("href", forward);
        } else {
            $(".header .back").attr("href", "/private/job");
        }

        try{
            var apply_info = JSON.parse(fn.storage("m_job_apply_info"));
            var cid = apply_info.company_id;
            var c_logo = apply_info.company_avatar;
            var c_name = apply_info.company_name;

            var channel_type = parseInt(apply_info.channel_type);
            var jid = apply_info.job_id;
            var j_name = apply_info.name;
            var j_time = getJobTime(parseInt(apply_info.refresh_time));

            var payment = apply_info.min_payment +"-"+ apply_info.max_payment +"/天";
            if(channel_type == 3){
                payment = (apply_info.min_payment>0 && apply_info.max_payment>0)? parseInt(apply_info.min_payment/10000) +"-"+ parseInt(apply_info.max_payment/10000) +"万/年": "面议";
                $('.job-days').closest(".job-info-base").remove();
            }
            var days = apply_info.workdays+"天/周";
            var city = apply_info.city;

            $(".job-link").attr("href","/job/detail/"+jid+"?forward="+encodeURIComponent(window.location.href));
            $(".company-name").text(c_name);
            $(".company-logo").css({"background-image":"url("+ c_logo +")"});

            $(".job-name").text(j_name);
            $(".job-refresh-time").text(j_time);
            $(".job-city").text(city);
            $(".job-days").text(days);
            $(".job-payment").text(payment);
        }catch(e){

        }

    });

});