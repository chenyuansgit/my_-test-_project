;
(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_zepto','js/lib/IB_iscroll','js/lib/IB_fn'], factory);
    } else {
        factory(window.jQuery || window.Zepto, fn);
    }
})(function ($,IScroll ,fn) {
    var defaultOptions = {
        title: "",
        date: new Date().format('yyyy-MM'),
        dateSpan: 50,//默认前后50年
        cancel: function () {
        },
        confirm: function () {
        }
    };
    function li_date_selected(ele, y, height) {
        for (var i = 0, len = $(ele).find("li").length; i < len; ++i) {
            var li = $(ele).find("li").eq(i), top = li.position().top;
            if (fn.absoluteValue(top - y - 2 * height) < height / 2) {
                $(ele).find("li.date_selected").removeClass("date_selected");
                li.addClass("date_selected");
                break;
            }
        }
    }
    function dateScroller(id, title) {
        function creatDateScrollerDiv(id) {
            var dateScrollerDiv = document.createElement("div"), mask_layer = document.createElement("div");
            mask_layer.id = "mask_layer" + id;
            mask_layer.className += "mask_layer";
            dateScrollerDiv.id = id;
            dateScrollerDiv.style.display = mask_layer.style.display = 'none';
            dateScrollerDiv.className = "dateScrollerDiv";
            var dateScrollerDivHtml = "<div class='ds_options clearfix'><span class='ds_option_cancel'>取消</span><span class='ds_option_time'>" + title + "</span><span class='ds_option_confirm'>确定</span></div>";
            dateScrollerDivHtml += "<div class='ds_title'><span  class='year fll'>年</span><span class='month flr'>月</span></div>";
            dateScrollerDivHtml += "<div class='main_scroll'><div class='fixed_border top'></div><div class='fixed_border'></div><div class='dateScrollerPart year_scroller_part'></div><div class='dateScrollerPart month_scroller_part'></div></div>";
            dateScrollerDiv.innerHTML = dateScrollerDivHtml;
            document.getElementsByTagName("body")[0].appendChild(dateScrollerDiv);
            document.getElementsByTagName("body")[0].appendChild(mask_layer);
            return document.getElementById(id);
        }

        function new_iscroll(iscroll, ele, left, top, scrollStartCallback, scrollEndCallback) {
            iscroll = new IScroll(ele, {
                mouseWheel: true,
                click: true,
                snap: "li",
                startX: left,
                startY: -top
            });
            iscroll.on('scrollStart', function () {
                $(ele).find("li.date_selected").removeClass("date_selected");
                scrollStartCallback && scrollStartCallback();
            });
            iscroll.on('scrollEnd', function () {
                var y = -this.y, height = $(ele).find("li").height();
                li_date_selected(ele, y, height);
                scrollEndCallback && scrollEndCallback(y, height);
            });
        }

        return {
            element: creatDateScrollerDiv(id),
            iscroll: {},
            newIScroll: function () {
                var that = this, $ele = $(that.element);

                if (!this.iscroll.year_scroll || !this.iscroll.month_scroll || !this.iscroll.day_scroll) {
                    var top = $ele.find(".year_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                    new_iscroll(this.iscroll.year_scroll, $ele.find(".year_scroller_part").get(0), 0, top, function () {
                    }, function (y, height) {
                    });
                    top = $ele.find(".month_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                    new_iscroll(this.iscroll.month_scroll, $ele.find(".month_scroller_part").get(0), 0, top, function () {
                    }, function (y, height) {
                    });
                }
                return this;
            },
            dateInit: function (date, dateSpan) {
                var $ele = $(this.element);
                if (!date || !dateSpan) return;
                var _year = date.split('-')[0],
                    _month = date.split('-')[1],
                    li_html = "<li></li><li></li>";
                for (var i = 0; i < dateSpan * 2 + 1; ++i) {
                    li_html += "<li id='year" + (_year - dateSpan + i) + "'>" + (_year - dateSpan + i) + "</li>";
                }
                $ele.find(".year_scroller_part").append("<div class='iscroll'><ul class='select_ul year_selector'>" + li_html + "<li></li><li></li></ul></div>");
                li_html = "<li></li><li></li>";
                for (i = 1; i < 13; ++i) {
                    li_html += "<li id='month" + (i.toString().length > 1 ? i : ("0" + i.toString())) + "'>" + (i.toString().length > 1 ? i : ("0" + i.toString())) + "</li>";
                }
                $ele.find(".month_scroller_part").append("<div class='iscroll'><ul class='select_ul month_selector'>" + li_html + "<li></li><li></li></ul></div>");
                $ele.find("#year" + _year + ",#month" + (_month.toString().length > 1 ? _month.toString() : ("0" + _month.toString()))).addClass("date_selected");
                return this;
            }
        };
    }

    if (!$.fn.hasOwnProperty('dateScroller')) {
        $.fn.dateScroller = function (user_options) {
            var $elements = this, options = {};
            user_options = typeof user_options === 'object' ? user_options : {};
            for (var i in defaultOptions) {
                typeof user_options[i] === 'undefined' ? options[i] = defaultOptions[i] : options[i] = user_options[i];
            }
            $elements.each(function () {
                var that = this,
                    id = "dateScroller" + fn.rankey(10),
                    newDateScroller = new dateScroller(id, options.title),
                    mask_layer = document.getElementById('mask_layer' + id);
                newDateScroller.dateInit(options.date, options.dateSpan);
                var $date_scroll = $(newDateScroller.element);
                new IScroll($date_scroll.find(".year_scroller_part").get(0), {
                    mouseWheel: true,
                    click: true
                });
/*                document.addEventListener('touchmove', function (e) {
                    e.preventDefault();
                }, false);*/
                $date_scroll.find(".year_scroller_part,.month_scroller_part").show();
                $(that).on('click', function (e) {
                    $(this).toggleClass('active');
                    var date = $(this).attr('data-date'),
                        _year = date.split('-')[0],
                        _month = date.split('-')[1];
                    e.preventDefault();
                    $("input,textarea").blur();
                    $date_scroll.toggle();
                    $(mask_layer).toggle();
                    if ($(this).hasClass('active')) {
                        $date_scroll.find(".year_scroller_part,.month_scroller_part").find("li.date_selected").removeClass("date_selected");
                        $date_scroll.find("#year" + _year + ",#month" + (_month.toString().length > 1 ? _month.toString() : ("0" + _month.toString()))).addClass("date_selected");
                        newDateScroller.newIScroll(1);
                    }
                });
                $(mask_layer).on('click', function (e) {
                    e.preventDefault();
                    $date_scroll.hide();
                    $(this).hide();
                    $(that).removeClass('active');
                });
                $date_scroll.find(".ds_option_cancel").on('click', function (e) {
                    e.preventDefault();
                    $date_scroll.hide();
                    $(mask_layer).hide();
                    options.cancel && options.cancel();
                });
                $date_scroll.find(".ds_option_confirm").on('click', function (e) {
                    e.preventDefault();
                    $date_scroll.hide();
                    $(that).removeClass('active');
                    $(mask_layer).hide();
                    options.confirm && options.confirm({date: $date_scroll.find(".year_scroller_part li.date_selected").text() + "-" + $date_scroll.find(".month_scroller_part li.date_selected").text()});
                });
            });
            return this;
        };

    }
});