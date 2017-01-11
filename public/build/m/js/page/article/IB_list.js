require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn','js/lib/IB_zepto', 'js/lib/IB_fastclick','js/lib/IB_lazyload'], function (fn,$,FastClick) {
    var total = 0, page = 0, loadListOk;

    function LoadTopicList(category_id,type) {
        if (!loadListOk) return false;
        loadListOk = false;
        $('#loading').remove();
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='"+baseUrl+"/img/loading.gif' class='loading_icon'></div>");
        if (type) {
            $(window).scrollTop($('#loading').offset().top);
        }
        $.ajax({
            url: "/nest/getListByTime?category_id="+category_id+"&page=" + (type?(page+1):1),
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    total = parseInt(data.data.pages);
                    var articles = data.data.articles;
                    var list_html = '';
                    for (var i = 0; i < articles.length; i++) {
                        if(articles[i].cover&&articles[i].cover.length>0) {
                        list_html += "<div class='listone w100'>\
                            <a href='/nest/detail/"+articles[i].id+"'>\
                            <div class='lazyImg new lazy' data-original = '"+articles[i].cover+"?imageView2/2/w/720'></div>\
                            <div class='info'>\
                            <div class='title'>"+articles[i].title+"</div>\
                            <div class='next clearfix'><span class='fll'>"+articles[i].author+"</span><span class='flr'>"+new Date(parseInt(articles[i].create_time)).format('MM月dd日')+"</span></div>\
                            </div></a></div>";
                        } else {
                            list_html += "<div class='listone w100'>\
                            <a href='/nest/detail/"+articles[i].id+"'>\
                            <div class='lazyImg new lazy' data-original = '"+baseUrl+"/img/default-img.png'></div>\
                            <div class='info'>\
                            <div class='title'>"+articles[i].title+"</div>\
                            <div class='next clearfix'><span class='fll'>"+articles[i].author+"</span><span class='flr'>"+new Date(parseInt(articles[i].create_time)).format('MM月dd日')+"</span></div>\
                            </div></a></div>";
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
        $(".listone").remove();
        LoadTopicList(0,0);
    });

    //点击切换事件
    $(document).on("click",".nav li", function () {
        var $this = $(this);
        if($this.hasClass("cur"))
            return;
        $(".nav li").removeClass("cur");
        $this.addClass("cur");
        var category_id = $this.attr("category_id");
        $(".listone").remove();
        LoadTopicList(category_id,0);
    });

    $(window).scroll(function () {
        var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
        var category_id = $("li.cur").attr("category_id");
        if (scrollBottom <= 4 && !!total && total > page) LoadTopicList(category_id,1);
    });
});