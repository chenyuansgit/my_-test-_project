require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_fastclick','js/lib/IB_lazyload'], function (fn,FastClick) {
    var total = 0, page = 0, loadListOk;

    function LoadTopicList(type) {
        if (!loadListOk) return false;
        loadListOk = false;
        $('#loading').remove();
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='"+baseUrl+"/img/loading.gif' class='loading_icon'></div>");
        if (type) {
            $(window).scrollTop($('#loading').offset().top);
        }
        $.ajax({
            url: "/activity/getListByTime?page=" + (type?(page+1):1),
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var curTime = +new Date;
                    var activities = data.data.activities;
                    $(".new").removeClass('new');
                    var list_html = '';
                    for (var i = 0; i < activities.length; i++) {
                        var end_time = activities[i].end_time;
                        var start_time = activities[i].start_time;
                        var activitiesStatus = "";
                        if(curTime > end_time)
                            activitiesStatus = "<span class='isOver'>活动已结束</span>";
                        else if (curTime<=end_time)
                            activitiesStatus = "<span class='ongoing'>活动进行中</span>";
                        else if (curTime<start_time)
                            activitiesStatus = "<span class='notStart'>活动未开始</span>";
                        if(activities[i].cover && activities[i].cover.length>0) {   //如果活动没有缩略图
                            list_html += "<div class='listone'>\
                            <div class='info'>\
                                <p class='title'><a href='/activity/detail/"+activities[i].id+"'>"+activities[i].title+"</a></p>\
                            </div>\
                            <div class='lazyImg'>\
                                <a href='/activity/detail/"+activities[i].id+"'><img class='new lazy' data-original = '"+activities[i].cover+"?imageView2/2/w/720' /></a> \
                                <div class='time'>"+activitiesStatus+"</div>\
                            </div>\
                            <div class='info' >\
                                <p class='subTitle'>"+activities[i].subtitle+"</p>\
                            </div>\
                            </div>";
                        } else {
                            list_html += "<div class='listone'>\
                            <div class='info'>\
                                <p class='title'><a href='/activity/detail/"+activities[i].id+"'>"+activities[i].title+"</a></p>\
                            </div>\
                            <div class='lazyImg'>\
                                <a href='/activity/detail/"+activities[i].id+"'><img class='new lazy' data-original = '"+baseUrl+"/img/default-img.png' /></a> \
                                <div class='time'>"+activitiesStatus+"</div>\
                            </div>\
                            <div class='info' >\
                                <p class='subTitle'>"+activities[i].subtitle+"</p>\
                            </div>\
                            </div>";
                        }
                    }
                    $("#list").append(list_html);
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

    $(function () {
        FastClick.attach(document.body);
        loadListOk = true;
        LoadTopicList(0);
    });
    $(window).scroll(function () {
        var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
        if (scrollBottom <= 4 && !!total && total > page) LoadTopicList(1);
    });
});