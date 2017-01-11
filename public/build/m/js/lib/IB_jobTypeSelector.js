/**
 * Created by zhphu on 16/5/2.
 */
;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_zepto','js/lib/IB_jobType','js/lib/IB_iscroll','js/lib/IB_fn'], factory);
    } else {
        factory(window.jQuery || window.Zepto, fn);
    }
})(function ($,jobType,IScroll ,fn) {
    var selectorTemplate = "<div class='selector-jt'>\
                                <div class='selector-top'>\
                                    <span class='btn-back'></span>\
                                    <span class='top-title'>职位类别</span>\
                                    <span class='btn-confirm'>完成</span>\
                                </div>\
                                <div class='sub-title'>\
                                    已选择&nbsp;(<span class='selected-num'>0</span>/3)\
                                </div>\
                                <div class='main-selector clearfix'>\
                                    <div class='side-wrapper side-wrapper-l'>\
                                       <div class='main-type-list' id='main-type'>\
                                            <div class='iscroll'>\
                                               <ul></ul>\
                                            </div>\
                                        </div>\
                                    </div>\
                                    <div class='side-wrapper side-wrapper-r'>\
                                        <div class='sub-type-list' id='sub-type'>\
                                            <div class='iscroll'></div>\
                                        </div>\
                                    </div>\
                                </div>\
                           </div>";

    function showSelector(){
        $(".selector-jt").addClass("animation_600 flipRight").show();
    }

    function removeSelector(){
        $(".selector-jt").removeClass("flipRight").addClass("flipRightOut");
        setTimeout(function () {
            $(".selector-jt").removeClass("flipRightOut").css({"opacity": 1}).hide();
        }, 600);
    }

    var JobTypeSelector = function($ele){
        $("body").append(selectorTemplate);
        var $selectorJt = $(".selector-jt");
        for(var i=0,len=jobType.length;i<len; i++){
            var currFlag = i==0?"curr":"";
            var mainType = "<li class='main-type "+currFlag+"' data-id='"+jobType[i].parent_type_id+"'>"+jobType[i].parent_type_name+"</li>";
            $selectorJt.find(".main-type-list ul").append(mainType);
            var subTypeList = jobType[i].sub_types;
            
            $selectorJt.find(".sub-type-list .iscroll").append("<ul class='sub-list sub-list-"+(i+1)+" "+currFlag+"'></ul>");
            for(var j=0,sub_len=subTypeList.length;j<sub_len;j++){
                var subType = "<li class='sub-type' data-id='"+subTypeList[j].group_id+"'>"+subTypeList[j].group_name+"</li>";
                $selectorJt.find(".sub-type-list .iscroll .sub-list-"+(i+1)).append(subType);
            }
        }

        $ele.click(function(){
            showSelector();
            var main_scroller = new IScroll(document.getElementById('main-type'),{
                mouseWheel: true,
                snap: "li",
                preventDefault:false
            });
        });
        $(document).on("click",".selector-jt .btn-back",function(){
            removeSelector();
        });

        $(document).on("click",".selector-jt .main-type",function(){
            var mainTypeId = $(this).attr("data-id");
            $(".main-type.curr").removeClass("curr");
            $(this).addClass("curr");
            $(".sub-list").hide();
            $(".sub-list-"+mainTypeId).show();
            var sub_scroller = new IScroll(document.getElementById('sub-type'),{
                mouseWheel: true,
                snap: "li",
                preventDefault:false
            });
        });

        $(document).on("click",".selector-jt .sub-type",function(){
            var selectedNum = $(".sub-type.on").length;
            var $this = $(this);
            if($this.hasClass("on")){
                $(this).removeClass("on");
                selectedNum -= 1;
                $(".selector-jt .selected-num").text(selectedNum);
            }else if(selectedNum < 3){
                $this.addClass("on");
                selectedNum += 1;
                $(".selector-jt .selected-num").text(selectedNum);
            }
        });

        $(document).on("click",".selector-jt .btn-confirm",function(){
            var selected_text = [];
            var selected_id = [];
            for(var i=0,len=$(".selector-jt .sub-type.on").length;i<len;i++){
                var $subType = $(".selector-jt .sub-type.on").eq(i);
                selected_id.push($subType.attr("data-id"));
                selected_text.push($subType.text());
            }
            $ele.find(".required").attr("data-id",selected_id.toString());
            $ele.find(".required").text(selected_text.toString());
            removeSelector();
        });
    };
    
    
    if (!$.fn.hasOwnProperty('jobTypeSelector')) {
        $.fn.jobTypeSelector = function () {
            var $this = this;
            JobTypeSelector($this);
            return this;
        };
    }
});