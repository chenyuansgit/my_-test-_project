require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        },
        'js/lib/IB_plupload.full':{
            exports:'plupload'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fn','js/common/IB_job_type','js/plugin/IB_lightbox'], function ($, fn, job_types) {
    $(function () {

        jtInitial($(".hope-position-type").attr("data-id").split(","));
        

    });

    function jtInitial(idArr){
        var type_id = idArr;
        var type_text = [];
        $(".selector-jt").find(".selected-num").text(type_id.length);
        for(var i=0,len=type_id.length;i<len;i++){
            var pid = parseInt(type_id[i].substring(0,1))-1;
            var sid = parseInt(type_id[i].substring(1)) ;
            
            if(pid > -1 && sid > -1){
                type_text.push(job_types[pid].sub_types[sid].group_name);
            }
            var $subType = $(".selector-jt .sub-type[data-id='"+type_id[i]+"']");
            $subType.addClass("on");
        }
        $(".hope-position-type").text(type_text.toString());
    }
    function internExpectInitial(){
        var min_payment_type = parseInt($(".hope-payment").attr("data-type"));
        var payment_text = ["不限","50以下","50-100","100-200","200-500","500以上"];
        switch(min_payment_type){
            case 0 :  $(".hope-payment").text(payment_text[0]);break;
            case 1 :  $(".hope-payment").text(payment_text[1]);break;
            case 50 :  $(".hope-payment").text(payment_text[2]);break;
            case 100 :  $(".hope-payment").text(payment_text[3]);break;
            case 200:  $(".hope-payment").text(payment_text[4]);break;
            case 500:  $(".hope-payment").text(payment_text[5]);break;
            default : $(".hope-payment").text(payment_text[0]);break;
        }

        var days_type = parseInt($(".hope-days").attr("data-type"));
        var days_text = ["1-2天","3天","4天","5天","6-7天"];
        $(".hope-days").text(days_text[days_type-1]);

        var dur_type = parseInt($(".hope-duration").attr("data-type"));
        var dur_text = ["1个月以下","2个月","3个月","3个月以上"];
        $(".hope-duration").text(dur_text[dur_type-1]);
    }

});

