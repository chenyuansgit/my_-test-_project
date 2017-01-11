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
        $(document).on("tap", '.sel-city .city,.provinces .city', function (e) {
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
            if(option.noWrapper){
                $tag.text(myCity).attr({"data-cid":cid,"data-city-id":cid});
            }else{
                $tag.find(".required").text(myCity).attr({"data-cid":cid,"data-city-id":cid});
            }

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
            if($(".selector-city").length<=0){
                $(document.body).append(getSelector(option.noLimit));
            }
            CitySelector(id,$this,option);
            return this;
        };
    }

    function getSelector(isNoLimit){
        var noLimit = isNoLimit?"<li class='city' data-pid='0'>不限</li>":"";
        return "<div class='selector-city'>\
            <div class='sel-province'>\
            <span class='btn-close'></span>\
            <div class='province-block'>\
            <div class='province-title'>ABCDEFG</div>\
            <ul class='provinces clearfix'>\
            <li class='province' data-pid='12'>安徽</li>\
            <li class='province' data-pid='33'>澳门</li>\
            <li class='province' data-pid='1'>北京</li>\
            <li class='province' data-pid='22'>重庆</li>\
            <li class='province' data-pid='13'>福建</li>\
            <li class='province' data-pid='28'>甘肃</li>\
            <li class='province' data-pid='19'>广东</li>\
            <li class='province' data-pid='20'>广西</li>\
            <li class='province' data-pid='24'>贵州</li>\
            "+noLimit+"\
            </ul>\
            </div>\
            <div class='province-block clearfix pro-line'>\
            <div class='circle circle-1'></div>\
            <div class='circle circle-2'></div>\
            <div class='province-title'>HIJKLMN</div>\
            <ul class='provinces'>\
            <li class='province' data-pid='21'>海南</li>\
            <li class='province' data-pid='3'>河北</li>\
            <li class='province' data-pid='16'>河南</li>\
            <li class='province' data-pid='8'>黑龙江</li>\
            <li class='province' data-pid='17'>湖北</li>\
            <li class='province' data-pid='18'>湖南</li>\
            <li class='province' data-pid='10'>江苏</li>\
            <li class='province' data-pid='7'>吉林</li>\
            <li class='province' data-pid='14'>江西</li>\
            <li class='province' data-pid='6'>辽宁</li>\
            <li class='province' data-pid='5'>内蒙古</li>\
            <li class='province' data-pid='30'>宁夏</li>\
            </ul>\
            </div>\
            <div class='province-block pro-line'>\
            <div class='circle circle-1'></div>\
            <div class='circle circle-2'></div>\
            <div class='province-title'>OPQRST</div>\
            <ul class='provinces clearfix'>\
            <li class='province' data-pid='29'>青海</li>\
            <li class='province' data-pid='15'>山东</li>\
            <li class='province' data-pid='4'>山西</li>\
            <li class='province' data-pid='27'>陕西</li>\
            <li class='province' data-pid='9'>上海</li>\
            <li class='province' data-pid='23'>四川</li>\
            <li class='province' data-pid='34'>台湾</li>\
            <li class='province' data-pid='2'>天津</li>\
            </ul>\
            </div>\
            <div class='province-block pro-line'>\
            <div class='circle circle-1'></div>\
            <div class='circle circle-2'></div>\
            <div class='province-title'>UVWXYZ</div>\
            <ul class='provinces clearfix'>\
            <li class='province' data-pid='32'>香港</li>\
            <li class='province' data-pid='31'>新疆</li>\
            <li class='province' data-pid='26'>西藏</li>\
            <li class='province' data-pid='25'>云南</li>\
            <li class='province' data-pid='11'>浙江</li>\
            </ul>\
            </div>\
            </div>\
            <div class='sel-city'>\
            <div class='city-overlay'></div>\
            <div id='city-wrapper'>\
            <div class='iscroll'></div>\
            </div>\
            </div>\
            </div>";
    }
});