require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_fastclick', 'js/lib/IB_lazyload'], function (fn, FastClick) {
    var total = 0, page = 0, loadListOk;
    function getJobTime(refresh_timestamp){
        var job_time;
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        var today_timestamp = +today;
        if(refresh_timestamp > today_timestamp && refresh_timestamp - today_timestamp < 24*60*60*1000){
            var job_timestamp = +new Date() - refresh_timestamp;
            if(job_timestamp < 2 * 60 * 1000){
                job_time = "1分钟前"
            }else if(job_timestamp <  60 * 60 * 1000){
                job_time = Math.ceil(job_timestamp/(1000*60)) +"分钟前"
            }else if(job_timestamp < 24*60*60*1000){
                job_time = Math.ceil(job_timestamp/(1000*60*60)) +"小时前"
            }
        }else if(refresh_timestamp > today_timestamp - 24*60*60*1000){
            job_time = "1天前"
        }else if(refresh_timestamp > today_timestamp - 2*24*60*60*1000){
            job_time = "2天前"
        }else if(refresh_timestamp > today_timestamp - 3*24*60*60*1000){
            job_time = "3天前"
        }else{
            var year_now = parseInt(new Date().format("yyyy"));
            var year_create = parseInt(new Date(parseInt(refresh_timestamp)).format("yyyy"));
            if(year_now > year_create){
                job_time = new Date(parseInt(refresh_timestamp)).format("yyyy.MM.dd");
            }else{
                job_time = new Date(parseInt(refresh_timestamp)).format("MM月dd日");
            }
        }
        return job_time;
    }
    var history = {
        get: function () {
            var _history_array = [];
            if (!window.localStorage || !window.localStorage.getItem) {
                return _history_array;
            }
            var _history = fn.storage('_search_history');
            try {
                return JSON.parse(_history) || _history_array;
            } catch (e) {
                return _history_array;
            }
        },
        set: function (_history_array) {
            try{
                if (window.localStorage && localStorage.setItem) {
                    fn.storage('_search_history', JSON.stringify(_history_array));
                    return true;
                }
            }catch(e){
                return false;
            }


        },
        sort: function (key) {
            var _history = this.get();
            _history.remove(key).push(key);
            this.set(_history);
        },
        addSearchEvent: function (li, callback) {
            li.on("click", function (e) {
                e.preventDefault();
                var _text = $(this).find('span').text();
                history.get().remove(_text).push(_text);
                $('.search-back').hide();
                callback(_text);
            });
            return this;
        },
        addDelEvent: function (delSpan) {
            delSpan.on("click", function (e) {
                e.stopPropagation();
                var _text = $.trim($(this).siblings('span').text());
                history.set(history.get().remove(_text));
                $(this).closest('li').remove();
                if (history.get().length >= 3) {
                    var _history = history.get();
                    $('#history').append('<li class="w100 new block needsclick clearfix"><span class="fll">' + _history[_history.length - 3] + '</span><span class="del flr"></span></li>');
                    history.init().addSearchEvent($('#history li'), function (key) {
                        history.sort(key);
                        $('.search-input').removeClass('focus').val(key).blur();
                        LoadTopicList(0, key);
                    }).addDelEvent($('#history .del'));
                }
            });
            return this;
        },
        init: function () {
            var _history_array = this.get(), _history_html = '';
            for (var i = _history_array.length, len = _history_array.length > 3 ? (_history_array.length - 3) : 0; i > len; i--) {
                _history_html += '<li class="w100 block clearfix"><span class="fll">' + _history_array[i - 1] + '</span><span class="del flr"></span></li>';
            }
            $('#history').html(_history_html);
            $('.search-back').show();
            $('.search-input').addClass('focus');
            return this;
        }
    };

    function showPosition(position) {
        try {
            $.ajax({
                type: "get",
                url: "http://api.map.baidu.com/geocoder/v2/?ak=3q9TUK5ahFNyuealiblGt8OV&output=json&pois=0&callback=getLocationCallback",
                data: {
                    location: position.coords.latitude + "," + position.coords.longitude
                },
                dataType: "jsonp",
                jsonpCallback: "getLocationCallback",
                success: function (data) {
                    //alert(JSON.stringify(data));
                    try {
                        $("#city").text(data.result.addressComponent.city);
                        fn.storage("position", JSON.stringify({
                            "timestamp": +new Date,
                            "city": data.result.addressComponent.city
                        }));
                    } catch (e) {
                        console.log(e);
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
    }

    function getLocation() {
        var timestamp = +new Date, position = localStorage.getItem("position");
        if (position && timestamp - JSON.parse(position).timestamp <= 3600000 && JSON.parse(position).city) {
            $("#city").text(JSON.parse(position).city);
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            }
        }
    }

    function LoadTopicList(type, key) {
        if (!loadListOk) return false;
        loadListOk = false;
        $('#loading').remove();
        $('.search-input').removeClass('focus');
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='" + baseUrl + "/img/loading.gif' class='loading_icon'></div>");
        if (type) {
            $(window).scrollTop($('#loading').offset().top);
        } else {
            $('#list').empty();
        }
        var city = {};
        var channel_type = $("#ct").attr("data-ct") ||"intern";
        try{
            city = {
                id: JSON.parse(fn.storage('_search_city')).id,
                name: JSON.parse(fn.storage('_search_city')).name
            };
        }catch(e){}

        var ct = "1,2";
        if(channel_type == "campus"){
            ct="3,4";
        }
        $.ajax({
            url: "/j/search?status=1&lt=time&page=" + (type ? (page + 1) : 1) + "&k=" + key + "&cid=" + (city.id || '')+"&ct="+ct,
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var jobs = data.data.jobs;
                    var len = $('.listone').length;
                    $(".new").removeClass('new');
                    var list_html = '';
                    var forward = encodeURIComponent(window.location.href);
                    for (var i = len; i < jobs.length + len; ++i) {
                        var detail_link = jobs[i - len].channel_type == 2 || jobs[i - len].channel_type == 4 ? "/det/detail/":"/job/detail/";
                        var payment = "面议";
                        var campus_mark = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"<i class='icon-corner icon-corner-campus'></i>" :" ";
                        if(jobs[i - len].min_payment && jobs[i - len].max_payment){
                            payment = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ? parseInt(jobs[i - len].min_payment/10000) + "-" + parseInt(jobs[i - len].max_payment/10000)+"万/年":jobs[i - len].min_payment + "-" + jobs[i - len].max_payment+"/天";
                        }
                        var workdays = jobs[i - len].channel_type == 3 || jobs[i - len].channel_type == 4 ?"": "<img src='" + baseUrl + "/img/icon-rili-gray.png' class='workdays-icon fll iblock'/><span class='workdays fll'>≥" + jobs[i - len].workdays + "天</span>";
                        list_html += "<a href='"+detail_link + jobs[i - len].jid + "?forward="+forward+"' class='listone clearfix w100'>\
                            <div class='left iblock job-icon new lazy fll' data-original = '" + jobs[i - len].company_avatar + "'></div>\
                            <div class='right fll'>\
                            <p class='j-title iblock clearfix'>\
                            <span class='name fll'>" + jobs[i - len].name + "</span>\
                            <span class='time flr'>" + getJobTime(parseInt(jobs[i - len].refresh_time)) + "</span>\
                        </p>\
                        <p class='j-mid clearfix'>\
                            <span class='company_name ellipsis fll'>" + jobs[i - len].company_name + "</span>\
                            </p>\
                            <p class='j-bottom iblock clearfix'>\
                            <img src='" + baseUrl + "/img/icon-address-gray.png' alt='' class='address-icon fll iblock'/>\
                            <span class='address fll'>" + jobs[i - len].city + "</span>\
                            "+workdays+"\
                        <span class='payment fll'>￥" + payment + "</span>\
                            </p>\
                            </div>\
                            </a>";
                    }
                    $("#list").append(list_html);
                    if (!type && !jobs.length) {
                        $('#list').html("<p class='tac w100 none-job'>暂无相符的职位信息</p>");
                    }
                    $(".new.lazy").lazyload({
                        effect: "fadeIn"
                    });
                } else {
                    $('#loading').html('加载失败，请重试!');
                }
                loadListOk = true;
            },
            error: function () {
                $('#loading').html('加载失败，请重试!');
                loadListOk = true;
            }
        });
    }

    $(window).scroll(function () {
        var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
        if (scrollBottom <= 4 && !!total && total > page) LoadTopicList(1, $('.search-input').val());
    });
    $(function () {
        //getLocation();
        if (window.localStorage && localStorage.getItem && localStorage.getItem("_search_city")) {
            var mySearch = JSON.parse(localStorage.getItem("_search_city"));
            if (mySearch.id && mySearch.name) {
                $("#city").attr("data-cid", mySearch.id).text(mySearch.name);
            }
        }
        var channel_type = fn.storage("_search_channel_type") || "intern";
        if(channel_type == "campus"){
            $("#ct").text("校招").attr("data-ct","campus");
            $(".ct-option").text("实习").attr("data-ct","intern");
        }
        $(".ct").click(function (e) {
            var event = e || window.event;
            event.stopPropagation();
            $('.ct-selector').toggle();
        });
        $(document).click(function (e) {
            var event = e || window.event;
            $('.ct-selector').hide();
        });
        $(".ct-option").click(function(e){
            var event = e || window.event;
            event.stopPropagation();
            var ct = $(this).attr("data-ct");
            if(ct == "campus"){
                $("#ct").text("校招").attr("data-ct","campus");
                $(".ct-option").text("实习").attr("data-ct","intern");
                fn.storage("_search_channel_type","campus");
            }else{
                $("#ct").text("实习").attr("data-ct","intern");
                $(".ct-option").text("校招").attr("data-ct","campus");
                fn.storage("_search_channel_type","intern")
            }
            $('.ct-selector').hide();
            return LoadTopicList(0, $.trim($('.search-input').val()));
        });

        FastClick.attach(document.body);
        loadListOk = true;
        $('.search-input').on('focus', function () {
            if ($(this).hasClass('focus')) return false;
            history.init().addSearchEvent($('#history li'), function (key) {
                history.sort(key);
                $('.search-input').removeClass('focus').val(key).blur();
                LoadTopicList(0, key);
            }).addDelEvent($('#history .del'));
        }).on('blur', function () {
            /*            $('.search-input').removeClass('focus');
             $('.search-back').hide();*/
        }).on("click",function(){
            $(this).focus();
        });
        //搜索按钮的事件
        $('#search').on("click", function (e) {
            e.preventDefault();
            var _text = $('.search-input').val();
            if ($.trim(_text)) {
                $('.search-input').removeClass('focus').blur();
                $('.search-back').hide();
                history.sort(_text);
                return LoadTopicList(0, _text);
            }
        });
        //热词点击事件
        $('.hot-word li').on("click", function (e) {
            e.preventDefault();
            var key = $.trim($(this).text());
            history.sort(key);
            $('.search-input').removeClass('focus').val(key).blur();
            $('.search-back').hide();
            return LoadTopicList(0, key);
        });
        $('.search-back .xx').on('click', function () {
            $('.search-back').hide();
            $('.search-input').removeClass('focus').blur();
        });
        $(".selector-mainCity .city-block").on("click", function () {
            var _cBlock = $(this);
            if (_cBlock.find(".cities").hasClass("curr")) {
                _cBlock.find(".cities").removeClass("curr");
            } else {
                $(".selector-mainCity .cities.curr").removeClass("curr");
                _cBlock.find(".cities").addClass("curr");
            }
        });
        $(".main .city").on("click", function () {
            $(".selector-mainCity").show();
            $("input").blur();
        });

        $(".selector-mainCity .btn-close").on("click", function () {
            $(".selector-mainCity").hide();
        });

        $(".selector-mainCity .city").on("click", function (e) {
            e.stopPropagation();
            if ($(this).hasClass('active')) return false;
            $('.selector-mainCity .city.active').removeClass('active');
            $(this).hasClass('active');
            var cName = $(this).text().trim();
            var cid = $(this).attr("data-cid");
            fn.storage('_search_city', JSON.stringify({
                id: cid,
                name: cName
            }));
            $("#city").text(cName).attr("data-cid", cid);
            $(".selector-mainCity").hide();
            if (!$('.search-input').hasClass('focus')) {
                return LoadTopicList(0, $.trim($('.search-input').val()));
            }
        });
    });
});