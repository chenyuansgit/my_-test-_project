require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_fastclick','js/lib/IB_wxAuth', 'js/lib/IB_jweixin', 'js/lib/IB_lazyload'], function (fn, FastClick, wxAuth, wx) {
    var total = 0, page = 0, loadListOk;

    function LoadTopicList(scroll, type) {
        if (!loadListOk) return false;
        loadListOk = false;
        $('#loading').remove();
        if(!scroll){
            $('#list').empty();
        }
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='" + baseUrl + "/img/loading.gif' class='loading_icon'></div>");
        if (scroll) {
            $(window).scrollTop($('#loading').offset().top);
        }
        var forward = encodeURIComponent(location.href);
        $.ajax({
            url: "/api/summer/getJobList?status=1&lt=time&page=" + (scroll ? (page + 1) : 1) + "&rec=" + (type == 'recommend' ? 1 : ''),
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
                    for (var i = len; i < jobs.length + len; ++i) {
                        list_html += "<a href='/job/detail/" + jobs[i - len].jid + "?forward="+forward +"' class='listone clearfix w100'>\
                            <div class='left iblock job-icon new lazy fll' data-original = '" + jobs[i - len].company_avatar + "'></div>\
                            <div class='right fll'>\
                            <p class='j-title iblock clearfix'>\
                            <span class='name fll'>" + jobs[i - len].name + "</span>\
                            <span class='time flr'>" + new Date(parseInt(jobs[i - len].refresh_time)).format('yyyy-MM-dd') + "</span>\
                        </p>\
                        <p class='j-mid clearfix'>\
                            <span class='company_name ellipsis fll'>" + jobs[i - len].company_name + "</span>\
                            </p>\
                            <p class='j-bottom iblock clearfix'>\
                            <img src='" + baseUrl + "/img/icon-address-gray.png' alt='' class='address-icon fll iblock'/>\
                            <span class='address fll'>" + jobs[i - len].city + "</span>\
                            <img src='" + baseUrl + "/img/icon-rili-gray.png' class='workdays-icon fll iblock'/>\
                            <span class='workdays fll'>≥" + jobs[i - len].workdays + "天</span>\
                        <span class='payment fll'>￥" + jobs[i - len].min_payment + "-" + jobs[i - len].max_payment + "/天</span>\
                            </p>\
                            </div>\
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
        switch(location.href.split('#')[1]){
            case 'b':
                $('.rec').addClass('active');
                LoadTopicList(0,'recommend');
                break;
            case 'c':
                $('#loading').remove();
                $('.interpolation').addClass('active');
                $('.interpolation-list').show();
                break;
            default:
                $('.all').addClass('active');
                LoadTopicList(0);
                break;
        }
        $(window).scroll(function () {
            var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
            if (scrollBottom <= 4 && !!total && total > page && !$('.nav .active.interpolation').length) LoadTopicList(1,$('.nav .active').attr('data-recommend-id')==1?'recommend':'');
        });
        $(document).on('click', '.nav a', function () {
            var that = $(this);
            if (that.hasClass('active')) {
                return false;
            }
            $('.nav a.active').removeClass('active');
            that.addClass('active');
            switch (that.attr('data-recommend-id')) {
                case '0':
                    $('.interpolation-list').hide();
                    LoadTopicList(0);
                    break;
                case '1':
                    $('.interpolation-list').hide();
                    LoadTopicList(0, 'recommend');
                    break;
                default:
                    $('.interpolation-list').show();
                    $('#list').empty();
                    break;
            }
        });

        //微信分享
        wxAuth.jsApiAuth({
            url: window.location.href.split('#')[0]
        }, function (err) {
            console.log(err);
            wx.onMenuShareTimeline({
                title: "2016暑期实习风暴月，挑选最适合你的职位", // 分享标题
                desc: "优质的实习职位都在这里，这个暑假，可以换一种方式找实习了",
                imgUrl: "http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/658670ae231f6ea563d047879276baed.png", // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
            wx.onMenuShareAppMessage({
                title: "2016暑期实习风暴月，挑选最适合你的职位", // 分享标题
                desc: "优质的实习职位都在这里，这个暑假，可以换一种方式找实习了",
                imgUrl: "http://image.internbird.cn/21232f297a57a5a743894a0e4a801fc3/658670ae231f6ea563d047879276baed.png", // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
        });
    });
});