;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_zepto','js/lib/IB_fn','js/lib/IB_iscroll'], function($,fn,IScroll){
            factory(1,$,fn,IScroll);
        });
    } else {
        factory(1,$,fn,IScroll);
    }
})(function(requirejs,$,fn,IScroll){
    var $window = $(window),
        defaultOptions = {
            dateTime:+new Date,
            isTypeSwitch:true,
            dateSpan:2,//默认前后10年
            timeSpan:30,//默认前后30天
            timeType:"timePoint",//选择是全天(allDay)或者时间点(timePoint)
            toggleType:"click",
            confirm:function(date){},
            cancel:function(date){}
        };
    function absoluteValue(a){
        if(parseFloat(a)<0) return -a;
        return a;
    }
    function getTimestamp(timestr){
        return  date = new Date(),
            timearr = timestr.split("-"),
            date.setFullYear(timearr[0]),
            date.setMonth(parseInt(timearr[1])-1),
            date.setDate(parseInt(timearr[2])),
            date.setHours(timearr[3]?parseInt(timearr[3]):0),
            date.setMinutes(timearr[4]?parseInt(timearr[4]):0),
            date.setSeconds(0),
            date.setMilliseconds(0),
            date.getTime();
    }
    function dateScroller(id){
        function creatDateScrollerDiv(id){
            var dateScrollerDiv = document.createElement("div"),mask_layer = document.createElement("div");
            mask_layer.id = "mask_layer"+id;
            mask_layer.className += "mask_layer";
            dateScrollerDiv.id = id;
            dateScrollerDiv.style.display = mask_layer.style.display ='none';
            dateScrollerDiv.className = "dateScrollerDiv";
            var dateScrollerDivHtml = "<div class='ds_options clearfix'><span class='ds_option_cancel'></span><span class='ds_option_time'></span><span class='ds_option_confirm'></span></div>";
            dateScrollerDivHtml +="<div class='main_scroll'><div class='fixed_border top'></div><div class='fixed_border'></div><div class='dateScrollerPart year_scroller_part'></div><div class='dateScrollerPart month_scroller_part'></div><div class='dateScrollerPart day_scroller_part'></div>";
            dateScrollerDivHtml +="<div class='dateScrollerPart dayline_scroller_part'></div><div class='dateScrollerPart hour_scroller_part'></div><div class='dateScrollerPart min_scroller_part'></div></div>";
            // dateScrollerDivHtml += "<div class='date_type_option clearfix'><span class='date_type_label'>设为全天日程</span><span class='date_type_switch'></span></div>";
            dateScrollerDiv.innerHTML = dateScrollerDivHtml;
            document.getElementsByTagName("body")[0].appendChild(dateScrollerDiv);
            document.getElementsByTagName("body")[0].appendChild(mask_layer);
            return document.getElementById(id);
        }
        function new_iscroll(iscroll,ele,left,top,scrollStartCallback,scrollEndCallback){
            iscroll = new IScroll(ele,{
                mouseWheel: true,
                snap: "li",
                startX:left,
                startY:-top
            });
            iscroll.on('scrollStart', function(){
                $(ele).find("li.date_selected").removeClass("date_selected");
                scrollStartCallback&&scrollStartCallback();
            });
            iscroll.on('scrollEnd', function(){
                var y = -this.y,height =  $(ele).find("li").height();
                li_date_selected(ele,y,height);
                scrollEndCallback&&scrollEndCallback(y,height);
            });
        }
        function li_date_selected(ele,y,height){
            for(var i = 0,len =  $(ele).find("li").length;i<len;++i){
                var li = $(ele).find("li").eq(i), top =  li.position().top;
                if(absoluteValue(top-y-2*height)<height/2){
                    $(ele).find("li.date_selected").removeClass("date_selected");
                    li.addClass("date_selected");
                    break;
                }
            }
        }
        return {
            element:creatDateScrollerDiv(id),
            iscroll:{},
            newIScroll:function(type){
                var that = this,$ele = $(that.element);
                if(type){
                    if(!this.iscroll.year_scroll||!this.iscroll.month_scroll||!this.iscroll.day_scroll){
                        var top = $ele.find(".year_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                        new_iscroll(this.iscroll.year_scroll,$ele.find(".year_scroller_part").get(0),0,top,function(){},function(y,height){
                            that.dateChecked();
                            var ele = $ele.find(".day_scroller_part").get(0);
                            if(!$(ele).find("li.date_selected").length){
                                li_date_selected(ele,y,height)
                            }

                        });
                        top = $ele.find(".month_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                        new_iscroll(this.iscroll.month_scroll,$ele.find(".month_scroller_part").get(0),0,top,function(){},function(y,height){
                            that.dateChecked();
                            var ele = $ele.find(".day_scroller_part").get(0);
                            if(!$(ele).find("li.date_selected").length){
                                li_date_selected(ele,y,height)
                            }
                        });
                        top = $ele.find(".day_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                        new_iscroll(this.iscroll.day_scroll,$ele.find(".day_scroller_part").get(0),0,top);
                    }
                }else{
                    if(!this.iscroll.dayline_scroll||!this.iscroll.hour_scroll||!this.iscroll.min_scroll){
                        var top = $ele.find(".dayline_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                        new_iscroll(this.iscroll.dayline_scroll,$ele.find(".dayline_scroller_part").get(0),0,top);
                        top = $ele.find(".hour_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                        new_iscroll(this.iscroll.hour_scroll,$ele.find(".hour_scroller_part").get(0),0,top);
                        top = $ele.find(".min_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                        new_iscroll(this.iscroll.min_scroll,$ele.find(".min_scroller_part").get(0),0,top);
                    }
                }
                return this;
            },
            dateInit:function(timestamp,dateSpan){
                var $ele = $(this.element);
                if(!timestamp||!dateSpan) return;
                var  _date = new Date(timestamp),
                    _year = _date.getFullYear(),
                    _month = _date.getMonth()+1,
                    _day = _date.getDate(),
                    li_html = "<li></li><li></li>";
                for(var i= 0;i<dateSpan*2+1;++i){
                    li_html += "<li id='year"+(_year+i)+"'>"+(_year-10+i)+"年</li>";
                }
                $ele.find(".year_scroller_part").append("<div class='iscroll'><ul class='select_ul year_selector'>"+li_html+"<li></li><li></li></ul></div>");
                li_html = "<li></li><li></li>";
                for(var i=1;i<13;++i){
                    li_html += "<li id='month"+(i.toString().length>1?i:("0"+i.toString()))+"'>"+(i.toString().length>1?i:("0"+i.toString()))+"月</li>";
                }
                $ele.find(".month_scroller_part").append("<div class='iscroll'><ul class='select_ul month_selector'>"+li_html+"<li></li><li></li></ul></div>");
                li_html = "<li></li><li></li>";
                for(var i=1;i<32;++i){
                    li_html += "<li id='day"+(i.toString().length>1?i:("0"+i.toString()))+"'>"+(i.toString().length>1?i:("0"+i.toString()))+"日</li>";
                }
                $ele.find(".day_scroller_part").append("<div class='iscroll'><ul class='select_ul day_selector'>"+li_html+"<li></li><li></li></ul></div>");
                $ele.find("#year"+_year+",#month"+(_month.toString().length>1?_month.toString():("0"+_month.toString()))+",#day"+(_day.toString().length>1?_day.toString():("0"+_day.toString()))).addClass("date_selected");

                return this;
            },
            timeInit:function(timestamp,timeSpan){
                var $ele = $(this.element);
                if(!timestamp||!timeSpan) return;
                var  _date = new Date(timestamp),
                    _year = _date.getFullYear(),
                    _month = _date.getMonth()+1,
                    _day = _date.getDate(),
                    _hour = _date.getHours(),
                    _minute = _date.getMinutes(),
                    li_html = "<li></li><li></li>";
                for(var i=0;i<timeSpan*2+1;++i){
                    var dateline = (new Date(timestamp+i*86400000)).format("yyyy-MM-dd");
                    li_html += "<li id='dayline"+dateline+"'>"+dateline+"</li>";
                }
                $ele.find(".dayline_scroller_part").append("<div class='iscroll'><ul class='select_ul dayline_selector'>"+li_html+"<li></li><li></li></ul></div>");
                li_html = "<li></li><li></li>";
                for(var i=0;i<24;++i){
                    li_html += "<li id='hour"+(i.toString().length>1?i:("0"+i.toString()))+"'>"+(i.toString().length>1?i:("0"+i.toString()))+"</li>";
                }
                $ele.find(".hour_scroller_part").append("<div class='iscroll'><ul class='select_ul hour_selector'>"+li_html+"<li></li><li></li></ul></div>");
                li_html = "<li></li><li></li>";
                for(var i=0;i<60;++i){
                    li_html += "<li id='min"+(i.toString().length>1?i:("0"+i.toString()))+"'>"+(i.toString().length>1?i:("0"+i.toString()))+"</li>";
                }
                $ele.find(".min_scroller_part").append("<div class='iscroll'><ul class='select_ul min_selector'>"+li_html+"<li></li><li></li></ul></div>");
                $ele.find("#dayline"+_year+"-"+(_month.toString().length>1?_month.toString():("0"+_month.toString()))+"-"+(_day.toString().length>1?_day.toString():("0"+_day.toString()))+",#hour"+(_hour.toString().length>1?_hour.toString():("0"+_hour.toString()))+",#min"+(_minute.toString().length>1?_minute.toString():("0"+_minute.toString()))).addClass("date_selected");
                return this;
            },
            dateChecked:function(){
                var $ele = $(this.element);
                var select_year = parseInt($ele.find(".year_selector").find("li.date_selected").text().replace(/[^0-9]/g,''));
                var select_month = parseInt($ele.find(".month_selector").find("li.date_selected").text().replace(/[^0-9]/g,''));
                $ele.find("li.noselected").removeClass("noselected");
                if(select_month===2||select_month===4||select_month===6||select_month===9||select_month===11){
                    if(select_month===2){
                        if((select_year%4===0&&select_year%100!==0)||select_year%400===0){
                            $ele.find("#day30,#day31").addClass("noselected").removeClass('date_selected');
                            var top =  $ele.find(".day_scroller_part li.date_selected").length?$ele.find(".day_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top:$ele.find("#day29").addClass("date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                            new_iscroll(this.iscroll.day_scroll,$ele.find(".day_scroller_part").get(0),0,top)
                        }else{
                            $ele.find("#day29,#day30,#day31").addClass("noselected").removeClass('date_selected');
                            var top =  $ele.find(".day_scroller_part li.date_selected").length?$ele.find(".day_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top:$ele.find("#day28").addClass("date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                            new_iscroll(this.iscroll.day_scroll,$ele.find(".day_scroller_part").get(0),0,top)
                        }
                    }else{
                        $ele.find("#day31").addClass("noselected").removeClass('date_selected');
                        var top =  $ele.find(".day_scroller_part li.date_selected").length?$ele.find(".day_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top:$ele.find("#day30").addClass("date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                        new_iscroll(this.iscroll.day_scroll,$ele.find(".day_scroller_part").get(0),0,top)
                    }
                }else{
                    var top =  $ele.find(".day_scroller_part li.date_selected").length?$ele.find(".day_scroller_part li.date_selected").prev("li").eq(0).prev("li").eq(0).position().top:$ele.find("#day31").addClass("date_selected").prev("li").eq(0).prev("li").eq(0).position().top;
                    new_iscroll(this.iscroll.day_scroll,$ele.find(".day_scroller_part").get(0),0,top)
                }
                return this;
            },
            switchTimeType:function(timeType){
                if(timeType==="allDay"){
                    $(this.element).find(".year_scroller_part,.month_scroller_part,.day_scroller_part").show();
                    $(this.element).find(".dayline_scroller_part,.hour_scroller_part,.min_scroller_part").hide();
                }else{
                    $(this.element).find(".year_scroller_part,.month_scroller_part,.day_scroller_part").hide();
                    $(this.element).find(".dayline_scroller_part,.hour_scroller_part,.min_scroller_part").show();
                }
                return this;
            }
        }
    }
    if(!$.fn.hasOwnProperty('timeScroller')){
        $.fn.timeScroller = function(user_options){
            var $elements = this,options = {},user_options = typeof user_options === 'object'?user_options:{};
            for(var i in defaultOptions){
                typeof user_options[i]==='undefined'?options[i] = defaultOptions[i]:options[i] = user_options[i];
            }
            $elements.each(function(){
                var that = this,
                    id = "dateScroller"+fn.rankey(10),
                    newDateScroller  = new dateScroller(id),
                    mask_layer = document.getElementById('mask_layer'+id);
                newDateScroller.dateInit(options.dateTime,options.dateSpan).timeInit(options.dateTime,options.timeSpan).dateChecked();
                var $date_scroll = $(newDateScroller.element);
                var year_scroll = new IScroll($date_scroll.find(".year_scroller_part").get(0),{
                    mouseWheel: true,
                    click: true
                });
/*
                document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
*/
                if(options.timeType === 'allDay'){
                    $date_scroll.find(".year_scroller_part,.month_scroller_part,.day_scroller_part").show();
                    $date_scroll.find(".date_type_switch").addClass("switched");
                }else{
                    $date_scroll.find(".dayline_scroller_part,.hour_scroller_part,.min_scroller_part").show();
                    $date_scroll.find(".date_type_switch").removeClass("switched");
                }
                $(that).on(options.toggleType,function(e){
                    $(this).toggleClass('active');
                    var isSwitch = $date_scroll.find(".date_type_switch").hasClass("switched"),
                        date_timestamp = parseInt($(this).attr("date-timestamp")),
                        _date = new Date(date_timestamp),
                        _year = _date.getFullYear(),
                        _month = _date.getMonth()+1,
                        _day = _date.getDate(),
                        _hour = _date.getHours(),
                        _minute = _date.getMinutes();
                    e.preventDefault();
                    $("input,textarea").blur();
                    $date_scroll.toggle();
                    $(mask_layer).toggle();
                    if($(this).hasClass('active')){
                        if(!isSwitch){
                            $date_scroll.find(".dayline_scroller_part,.hour_scroller_part,.min_scroller_part").find("li.date_selected").removeClass("date_selected");
                            $date_scroll.find("#dayline"+_year+"-"+(_month.toString().length>1?_month.toString():("0"+_month.toString()))+"-"+(_day.toString().length>1?_day.toString():("0"+_day.toString()))+",#hour"+(_hour.toString().length>1?_hour.toString():("0"+_hour.toString()))+",#min"+(_minute.toString().length>1?_minute.toString():("0"+_minute.toString()))).addClass("date_selected");
                            newDateScroller.newIScroll(0);
                        }else{
                            $date_scroll.find(".year_scroller_part,.month_scroller_part,.day_scroller_part").find("li.date_selected").removeClass("date_selected");
                            $date_scroll.find("#year"+_year+",#month"+(_month.toString().length>1?_month.toString():("0"+_month.toString()))+",#day"+(_day.toString().length>1?_day.toString():("0"+_day.toString()))).addClass("date_selected");
                            newDateScroller.newIScroll(1);
                        }
                    }
                });
                $(mask_layer).on(options.toggleType,function(e){
                    e.preventDefault();
                    $date_scroll.hide();
                    $(this).hide();
                });
                $date_scroll.find(".ds_option_cancel").on(options.toggleType,function(e){
                    e.preventDefault();
                    $date_scroll.hide();
                    $(mask_layer).hide();
                    options.cancel&&options.cancel();
                });
                $date_scroll.find(".ds_option_confirm").on(options.toggleType,function(e){
                    e.preventDefault();
                    $date_scroll.hide();
                    $(mask_layer).hide();
                    var date = new Date();
                    if($date_scroll.find(".date_type_switch").hasClass("switched")){
                        date.setFullYear($date_scroll.find(".year_selector").find("li.date_selected").text().replace(/[^0-9]/g,''));
                        date.setMonth(parseInt($date_scroll.find(".month_selector").find("li.date_selected").text().replace(/[^0-9]/g,''))-1);
                        date.setDate(parseInt($date_scroll.find(".day_selector").find("li.date_selected").text().replace(/[^0-9]/g,'')));
                        date.setHours(0);
                        date.setMinutes(0);
                        date.setSeconds(0);
                        date.setMilliseconds(0);
                        options.confirm&&options.confirm({type:"allDay",timestamp:date.getTime()});
                    }else{
                        var _dayline = $date_scroll.find(".dayline_selector").find("li.date_selected").text().replace(/[^(0-9)|-]/g,''),
                            _hour = $date_scroll.find(".hour_selector").find("li.date_selected").text().replace(/[^0-9]/g,''),
                            _min = $date_scroll.find(".min_selector").find("li.date_selected").text().replace(/[^0-9]/g,'');
                        options.confirm&&options.confirm({type:"timePoint",timestamp:getTimestamp(_dayline+'-'+_hour+'-'+_min)});
                    }
                })
                $date_scroll.find(".date_type_switch").on(options.toggleType,function(e){
                    e.preventDefault();
                    if(!options.isTypeSwitch) return false;
                    if($(this).hasClass("switched")){
                        newDateScroller.switchTimeType("timePoint");
                        newDateScroller.newIScroll(0);
                    }else{
                        newDateScroller.switchTimeType("allDay");
                        newDateScroller.newIScroll(1)
                    }
                    $(this).toggleClass("switched");
                })
            });
            return this;
        }

    }
});