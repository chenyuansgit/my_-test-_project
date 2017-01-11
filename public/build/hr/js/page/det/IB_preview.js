require.config({
    baseUrl : baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:  '$'
        },
        'js/plugin/timepicker/IB_jquery-ui-1.10.3.custom':{
            deps:['js/lib/IB_jquery'],
            exports: 'jQuery'
        },
        'js/plugin/timepicker/IB_jquery-ui-timepicker-addon':{
            deps:['js/lib/IB_jquery','js/plugin/timepicker/IB_jquery-ui-1.10.3.custom'],
            exports: 'datepicker'
        }
    }
});

require(['js/lib/IB_jquery', 'js/plugin/timepicker/IB_jquery-ui-1.10.3.custom','js/plugin/timepicker/IB_jquery-ui-timepicker-addon','js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_regex',"js/common/IB_job_type",'js/plugin/IB_lightbox'], function ($,jQuery,datepicker, FastClick, fn, regex, job_types) {
    $(function(){
        var can_request = true;
        fn.popBoxBind();
        //hope
        try{
            jtInitial($(".hope-position-type").attr("data-id").split(","));
        }catch (e){
            
        }

        
        $(document).on("click", ".btn-connect", function() {
            $(".popBox-contact").show();
            $(".overlay").show();
        });
        //简历下载
        $(document).on("click", ".btn-download", function() {
            $(".popBox-download").show();
            $(".overlay").show();
        });
        $(".popBox-download .download").click(function(){
            $(".popBox-download").hide();
            $(".overlay").hide();
        });
        
        
        function check(box){
            var flag = true;
            $(box).find(".req").each(function(){
                if(!$.trim($(this).val())){
                    $(this).addClass("error");
                    flag = false;
                }
            });
            $(box).find(".req").blur(function(){
                if(!$.trim($(this).val())){
                    $(this).addClass("error");
                }
            });
            $(box).find(".req").focus(function(){
                $(this).removeClass("error");
            });
            return flag;
        }
        function jtInitial(idArr){
            var type_id = idArr;
            var type_text = [];
            $(".selector-jt").find(".selected-num").text(type_id.length);
            for(var i=0,len=type_id.length;i<len;i++){
                var pid = parseInt(type_id[i].substr(0,1))-1;
                var sid = parseInt(type_id[i].substr(1)) ;
                if(pid>-1 && sid > -1){
                    type_text.push(job_types[pid].sub_types[sid].group_name);
                }
                var $subType = $(".selector-jt .sub-type[data-id='"+type_id[i]+"']");
                $subType.addClass("on");
            }

            if(type_text.toString()){
                $(".hope-position-type").text(type_text.toString());
            }else{
                $(".hope-position-type").closest("li").remove();
            }

        }
    });
});