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
            url: "/quickRecruit/list?page=" + (type?(page+1):1),
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var quick_recruits = data.data.quick_recruits;
                    var len = $('.listone').length;
                    $(".new").removeClass('new');
                    var list_html = '';
                    for (var i = len; i < quick_recruits.length + len; ++i) {
                        list_html += "<a href='/quickRecruit/detail/"+quick_recruits[i - len].id+"' class='listone w100'>\
                            <div class='time'>"+new Date(parseInt(quick_recruits[i - len].release_time)).format('MM月dd日')+"</div>\
                            <div class='detail clearfix'>\
                            <div class='fll block new lazy recruit_icon iblock' data-original = '"+(quick_recruits[i - len].img.indexOf('http')>-1?quick_recruits[i - len].img:'')+"'></div>\
                            <div class='fll iblock right' >\
                                <p class='title'>"+quick_recruits[i - len].title+"</p>\
                                <p class='summary'>"+quick_recruits[i - len].summary+"</p>\
                            </div></div>\
                            </a>";
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