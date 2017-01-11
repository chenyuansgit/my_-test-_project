;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_zepto','js/lib/IB_iscroll','js/lib/IB_fn',"js/lib/IB_city"], factory);
    } else {
        factory(window.jQuery || window.Zepto, fn);
    }
})(function ($,IScroll ,fn,cities) {
    var CitySelector = function(wrapper_id,$ele,option){
        $ele.on("click", function (e) {
            e.preventDefault();
            $("input").blur();
            $(".selector-city").show().addClass("animation_600 flipRight").attr({"data-tag":"city_wrapper_"+wrapper_id,"data-province":option.isProvince});
        });

        $(".sel-province .btn-close").on("click", function (e) {
            e.preventDefault();
            $(".selector-city").removeClass("flipRight").addClass("flipRightOut");
            setTimeout(function () {
                $(".selector-city").removeClass("flipRightOut").hide();
            }, 500);
        });
        $(".sel-province .province").on("click", function (e) {
            e.preventDefault();
            var province = $(this).text().trim();
            var pid = parseInt($(this).attr("data-pid"));
            var cityBlock = " <ul class='cities cities-" + pid + "' data-pid=" + pid + " data-pname="+province+">";
            for (var j = 0, len = cities[pid - 1].city.length; j < len; j++) {
                var _city = cities[pid - 1].city[j];
                cityBlock += "<li class='city needsclick' data-cid=" + _city.city_id + ">" + _city.city_name + "<i class='sel-circle'></i></li>";
            }
            cityBlock += "</ul>";
            var city_wrapper = $("#city-wrapper");
            city_wrapper.find(".cities").remove();
            city_wrapper.find(".iscroll").append(cityBlock);
            $(".sel-city .city-overlay").show();
            city_wrapper.show().addClass("animation_600 flipRight");
            var iscroll = new IScroll(document.getElementById("city-wrapper"), {
                mouseWheel: true,
                click: true,
                snap: "li",
                preventDefault:false
            });
        });
        $(document).on("tap", '.sel-city .city', function (e) {
            e.preventDefault();
            var $this = $(this);
            var myCity = $this.text();
            var cid = $this.attr("data-cid");
            var tag = $(".selector-city").attr("data-tag");
            var $tag = $("." + tag);
            var direct_cities = ["1","2","73","234","343","344","345"];
            if(parseInt($this.closest(".selector-city").attr("data-province")) && $.inArray(cid,direct_cities)==-1){
                var province = $this.closest(".cities").attr("data-pname");
                myCity = province+"-"+myCity;
            }
            $tag.find(".required").text(myCity).attr("data-cid", cid);
            $(".sel-city .city").removeClass("curr");
            $this.addClass("curr");
            setTimeout(function () {
                $(".sel-city .city-overlay").hide();
                $("#city-wrapper ,.selector-city").removeClass("flipRight").addClass("flipRightOut");
                setTimeout(function () {
                    $("#city-wrapper ,.selector-city").removeClass("flipRightOut").hide();
                }, 500);
            }, 300);
        });
        $(".sel-city .city-overlay").on("click", function (e) {
            e.preventDefault();
            $(".sel-city .city-overlay").hide();
            $("#city-wrapper").removeClass("flipRight").addClass("flipRightOut");
            setTimeout(function () {
                $("#city-wrapper").removeClass("flipRightOut").hide();
            }, 500);
        });
    };

    if (!$.fn.hasOwnProperty('citySelector')) {
        $.fn.citySelector = function (option) {
            var $this = this;
            var id = fn.rankey(10);
            this.addClass("city_wrapper_"+id);
            CitySelector(id,$this,option);
            return this;
        };
    }
});