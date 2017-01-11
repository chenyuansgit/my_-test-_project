;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_zepto','js/lib/IB_iscroll','js/lib/IB_fn'], factory);
    } else {
        factory(window.jQuery || window.Zepto, fn);
    }
})(function ($,IScroll ,fn) {
    function findLiSelected(ele, y, height) {
        for (var i = 0, len = $(ele).find("li").length; i < len; ++i) {
            var li = $(ele).find("li").eq(i), top = li.position().top;
            if (fn.absoluteValue(top - y - 2 * height) < height / 2) {
                $(ele).find("li.selected").removeClass("selected");
                li.addClass("selected");
                break;
            }
        }
    }
    var SelectScroller = function(wrapper_id,ele){

        var $sel = $("#"+wrapper_id).closest(".sel");
        ele.click(function(){
            $(".overlay").show();
            $sel.show();
            var scroller = new IScroll(document.getElementById(wrapper_id),{
                mouseWheel: true,
                click: true,
                snap: "li",
                preventDefault:false
            });
            scroller.on('scrollStart', function () {
                $("#"+wrapper_id).find("li.date_selected").removeClass("date_selected");
            });
            scroller.on('scrollEnd', function () {
                var y = -this.y, height = $("#"+wrapper_id).find("li").height();
                findLiSelected("#"+wrapper_id, y, height);
            });
        });
        $(".overlay").click(function(){
           $(".overlay").hide();
           $(".sel").hide();
        });

        $sel.find(".sel-option-cancel").click(function(){
            $sel.hide();
            $(".overlay").hide();
        });
        $sel.find(".sel-option-confirm").click(function(){
            var $selected = $("#"+wrapper_id).find(".selected");
            var type = $selected.attr("data-type").trim();
            var text = $selected.text().trim();
            $(ele).attr("data-type",type).html(text);
            $(".overlay").hide();
            $(".sel").hide();
        });

    };

    if (!$.fn.hasOwnProperty('selectScroller')) {
        $.fn.selectScroller = function (wrapper_id) {
            var $this = this;
            SelectScroller(wrapper_id,$this);
            return this;
        };
    }
});