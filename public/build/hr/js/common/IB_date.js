;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_jquery', 'js/common/IB_fn'], factory);
    } else if (typeof exports === 'object') { // Node/CommonJS
        module.exports = factory(require('jquery', 'fn'));
    } else {
        factory(window.jQuery, fn);
    }
})(function ($, fn) {
    var DateSelector = function (user_options) {
        var defaults = {
            //至今
            isToday: false,
            endYear: new Date().getFullYear(),
            startYear: new Date().getFullYear() - 10,
            upToToday: true,
            isDouble: false,
            lowerThan: "",
            higherThan: ""
        };
        var CLASSES = {
            active: 'active',
            today: 'today',
            hover: 'active',
            disable: 'disable'
        };
        var CONSTANTS = {
            toToday: '<li>至今</li>',
            toTodayText: '至今',
            upYear: new Date().getFullYear(),
            upMonth: new Date().getMonth() + 1,
            lowYear: 0,
            lowMonth: 0,
            isSelector: 0
        };
        this.init = function (inputTag) {
            defaults = $.extend({}, defaults, user_options);
            //事件绑定
            $(inputTag).attr("cal_id",defaults.id);
            $(inputTag).on("click", function (e) {
                var event = e || window.event;
                var cal_id = "#cal_ym_" + defaults.id;
                if (!CONSTANTS.isSelector) {
                    $(document.body).append(util.getCalender(inputTag));
                    CONSTANTS.isSelector += 1;
                    bind.onYearChange(inputTag,cal_id);
                    bind.onMonthClick(inputTag,cal_id);
                }
                adapter._doubleAdjust(cal_id);
                adapter._monthAdjust(cal_id, $(cal_id + " .cal_year .active").text());
                $(".cal_ym").hide();
                $("#cal_ym_" + defaults.id).attr("style",util.setPosition(inputTag)).show();
            });
            $(document).click(function (e) {
                var event = e || window.event;
                if(!$(inputTag).is(event.target) && $(inputTag).has(event.target).length === 0){
                    var id= $(inputTag).attr("cal_id");
                    $("#cal_ym_"+id).hide();
                }
            });
        };
        var util = {
            getCalender: function (inputTag) {
                var year_list = "<ul class='cal_year'>";
                if (defaults.isToday) {
                    year_list += CONSTANTS.toToday;
                }
                year_list += "<li class='active'>" + defaults.endYear + "</li>";
                for (var i = +defaults.endYear - 1; i > +defaults.startYear - 1; i--) {
                    year_list += "<li>" + i + "</li>";
                }
                year_list += "</ul>";

                var month_list = "<ul class='cal_month clearfix'>\
                                <li><span>1月</span></li>\
                                <li><span>2月</span></li>\
                                <li><span>3月</span></li>\
                                <li><span>4月</span></li>\
                                <li><span>5月</span></li>\
                                <li><span>6月</span></li>\
                                <li><span>7月</span></li>\
                                <li><span>8月</span></li>\
                                <li><span>9月</span></li>\
                                <li><span>10月</span></li>\
                                <li><span>11月</span></li>\
                                <li><span>12月</span></li>\
                               </ul>";
                return "<div class='cal_ym clearfix' id='cal_ym_" + defaults.id + "' style=" + util.setPosition(inputTag) + " >" + year_list + month_list + "</div>";
            },
            setPosition: function (inputTag) {
                var top = $(inputTag).offset().top + $(inputTag).outerHeight() + 1 + "px";
                var left = $(inputTag).offset().left + "px";
                return "left:" + left + ";top:" + top + ";";
            }
        };
        var bind = {
            onYearChange: function (inputTag,cal_id) {
                $(cal_id+" .cal_year li").click(function (e) {
                    var event = e || window.event;
                    event.stopPropagation();
                    var $cal = $(this).closest(".cal_ym");
                    var $year = $(this).closest(".cal_year");
                    $year.find("li").removeClass("active");
                    $(this).addClass("active");
                    if($.trim($(this).text()) == CONSTANTS.toTodayText){
                        $(inputTag).val(CONSTANTS.toTodayText);
                        $(cal_id +" .cal_month li").removeClass("disabled active").addClass("disabled");
                        $(cal_id).hide();
                        return;
                    }
                    var year = +$.trim($(this).text());
                    adapter._monthAdjust($cal, year);
                });
            },
            onMonthClick: function (inputTag,cal_id) {
                $(cal_id+" .cal_month li span").on("click", function (e) {
                    var event = e || window.event;
                    event.stopPropagation();
                    var $cal = $(this).closest(".cal_ym");
                    var $month = $(this).closest(".cal_month");
                    var year = $.trim($cal.find(".cal_year li.active").text());
                    if (!$(this).parent().hasClass("disabled")) {
                        var monthText = $(this).text();
                        var month = adapter._getMonth(monthText);
                        $(inputTag).val(year + "." + month).addClass("selected");
                        $cal.hide();
                    } else {
                        $cal.show();
                    }
                });
            }
        };
        var adapter = {
            _getMonth: function (monthText) {
                var month = monthText.replace("月", "");
                return ( +month < 10 ) ? "0" + month : month;
            },
            _monthAdjust: function (calElement, year) {
                $(calElement).find(".cal_month li").removeClass("disabled active");
                //至今
                if(year == CONSTANTS.toTodayText){
                    $(calElement).find(".cal_month li").removeClass("disabled active").addClass("disabled");
                    return;
                }
                //最高限制
                if (+year == CONSTANTS.upYear && defaults.upToToday) {
                    for (var i = CONSTANTS.upMonth; i < 12; i++) {
                        $(calElement).find(".cal_month li").eq(i).addClass("disabled");
                    }
                } else if (+year > CONSTANTS.upYear && defaults.upToToday) {
                    $(calElement).find(".cal_month li").addClass("disabled");
                }
                //最低限制
                if (CONSTANTS.lowYear && +year == CONSTANTS.lowYear && defaults.isDouble) {
                    for (var i = 0; i < CONSTANTS.lowMonth; i++) {
                        $(calElement).find(".cal_month li").eq(i).addClass("disabled");
                    }
                } else if (CONSTANTS.lowYear && +year < CONSTANTS.lowYear && defaults.isDouble) {
                    $(calElement).find(".cal_month li").addClass("disabled");
                }
            },
            _doubleAdjust: function (calElement) {
                //双选择
                if (defaults.isDouble) {
                    if (defaults.lowerThan) {
                        var $bro = $(defaults.lowerThan);
                        var dateArr = $bro.val().split(".");
                        var yearBro = +dateArr[0];
                        var monthBro = +dateArr[1];
                        if(yearBro) {
                            CONSTANTS.upYear = yearBro;
                            CONSTANTS.upMonth = monthBro-1;
                        }
                    } else if (defaults.higherThan) {
                        var $bro = $(defaults.higherThan);
                        var dateArr = $bro.val().split(".");
                        var yearBro = +dateArr[0];
                        var monthBro = +dateArr[1];
                        if(yearBro){
                            CONSTANTS.lowYear = yearBro;
                            CONSTANTS.lowMonth = monthBro;
                        }else{
                            CONSTANTS.lowYear = "";
                            CONSTANTS.lowMonth = "";
                        }
                    }
                }
            }
        };
    };

    if (!$.fn.hasOwnProperty('dateSelector')) {
        $.fn.dateSelector = function (user_options) {
            var $elements = this;
            $elements.each(function () {
                var $this = this;
                user_options.id = fn.randomKey(10);
                var selector = new DateSelector(user_options);
                selector.init($this);
            });
        };
    }
});
