/**
 * Created by zhphu on 16/7/29.
 */
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fn','js/lib/IB_fastclick'], function ($,fn,FastClick) {
    $(function(){
        $(".position-company").css({"margin-left": ($(".position-name").innerWidth()+23)+"px"});
        var strJob =  fn.storage("job");
        var objJob = JSON.parse(strJob);
        console.log(objJob);
        if(parseInt(objJob["channel_type"]) == 1) {
            for(elem in objJob){
                if(elem == "content"){
                    $(".intern-content").html(objJob["content"]);
                }else if(elem == "days"){
                    $(".days").text("≥"+objJob["days"]+"天");
                }else if(elem == "payment_l") {
                    $(".payment_l").text(+objJob["payment_l"]+"-");
                }else if(elem == "payment_h") {
                    $(".payment_h").text(+objJob["payment_h"]+"/元");
                }else{
                    $("."+elem).html(objJob[elem]);
                }
                if(objJob.regular == 1) {
                    $(".regular").html("<span class='icon-regular'></span>提供转正机会");
                }
            }
        } else {
            for(elem in objJob){
                if(elem == "content"){
                    $(".intern-content").html(objJob["content"]);
                }else if(elem == "days"){
                    $(".icon-calendar, .days").css("display","none");
                }else if(elem == "payment_l") {
                    $(".payment_l").text(+objJob["payment_l"]/10000+"-");
                }else if(elem == "payment_h") {
                    $(".payment_h").text(+objJob["payment_h"]/10000+"万/年");
                }else{
                    $("."+elem).html(objJob[elem]);
                }
                if(objJob.regular == 1) {
                    $(".regular").css("display","none");
                }
            }
        }
    })
});