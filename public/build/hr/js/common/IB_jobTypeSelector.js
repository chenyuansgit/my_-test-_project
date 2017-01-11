/**
 * Created by zhphu on 16/5/2.
 */
;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_jquery','js/common/IB_job_type'], factory);
    } else {
        factory(window.jQuery || window.Zepto, fn);
    }
})(function ($,jobType,IScroll ,fn) {
    var selectorTemplate = "<div class='selector-jt'>\
                                <div class='selector-top'>\
                                    <span>已选(</span><span class='selected-num'>0</span><span>/3)</span>\
                                </div>\
                                <ul class='main-type-list'></ul>\
                            </div>";
    var defaults = {
        default_val: ""
    };
    function setData($ele){
        var selected_text = [];
        var selected_id = [];
        var selectedNum = $(".selector-jt .sub-type.on").length;
        for(var i=0,len=selectedNum;i<len;i++){
            var $subType = $(".selector-jt .sub-type.on").eq(i);
            selected_id.push($subType.attr("data-id"));
            selected_text.push($subType.text());
        }
        $ele.attr("data-id",selected_id.toString());
        $ele.val(selected_text.toString());
        $ele.css({"color":"#000"});
        selectedNum>0?$ele.addClass("selected"):$ele.removeClass("selected").val(defaults.default_val).css({"color":"#999"});
    }
    var JobTypeSelector = function($ele,options){
        defaults = $.extend({}, defaults, options);
        $ele.after(selectorTemplate);
        var $selectorJt = $(".selector-jt");
        $(document).click(function (e) {
            var event = e || window.event;
            if(!$ele.is(event.target) && $ele.has(event.target).length === 0){
                $selectorJt.hide();
            }
        });

        for(var i=0,len=jobType.length;i<len; i++){
            var currFlag = i==0?"curr":"";
            var mainType = "<li class='main-type "+currFlag+"' data-id='"+jobType[i].parent_type_id+"'>"+jobType[i].parent_type_name+"</li>";
            $selectorJt.find(".main-type-list").append(mainType);
            var subTypeList = jobType[i].sub_types;
            
            $selectorJt.append("<ul class='sub-type-list sub-type-list-"+(i+1)+" "+currFlag+"'></ul>");
            for(var j=0,sub_len=subTypeList.length;j<sub_len;j++){
                var subType = "<li class='sub-type' data-id='"+subTypeList[j].group_id+"'>"+subTypeList[j].group_name+"</li>";
                $selectorJt.find(".sub-type-list-"+(i+1)).append(subType);
            }
        }

        $ele.click(function(){
            $selectorJt.show();
        });

        $selectorJt.find(".main-type").click(function(e){
            var event = e || window.event;
            event.stopPropagation();
            var id = $(this).attr("data-id");
            $selectorJt.find(".main-type.curr").removeClass("curr");
            $(this).addClass("curr");
            $selectorJt.find(".sub-type-list").hide();
            $selectorJt.find(".sub-type-list-"+id).show();
        });
        $selectorJt.find(".sub-type").click(function(e){
           var event = e || window.event;
           event.stopPropagation();
           var $this = $(this);
           var selectedNum = $selectorJt.find(".sub-type.on").length;
           if($this.hasClass("on")){
               $this.removeClass("on");
               selectedNum -= 1;
               $selectorJt.find(".selected-num").text(selectedNum);
           }else if(selectedNum < 3){
               $this.addClass("on");
               selectedNum +=1;
               $selectorJt.find(".selected-num").text(selectedNum);
           }
           setData($ele);
        });

    };
    
    
    if (!$.fn.hasOwnProperty('jobTypeSelector')) {
        $.fn.jobTypeSelector = function (options) {
            var $this = this;
            JobTypeSelector($this,options);
            return this;
        };
    }
});