require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn','js/page/quickRecruit/IB_common'], function ($, FastClick, fn, quickRecruit ) {
    $(function () {
        var can_request = true;
        fn.popBoxBind();
        fn.backTopBind();

        //申请
        $(".join").click(function () {
            $(".overlay").show();
            $(".popBox-join").show();
            var term_id = global.term_id;
            $(".popBox-join .btn-apply").attr("data-term-id", term_id);
        });
        $(".popBox .btn-ok").click(function () {
            $(".overlay").hide();
            $(".popBox").hide();
        });
        quickRecruit.applyBind();


        //分页
        var ifNext = global.pageOne < 10 ? 0 : 1;
        var page = 1;
        var detailURL = "/private/quickRecruit/detail/";
        if (window.location.href.indexOf("/employer/quickRecruit") > -1) {
            detailURL = "/employer/quickRecruit/detail/";
        }
        $(window).on('scroll', function () {
            showResumeDetail();
            if ($(document).height() == $(window).scrollTop() + $(window).height()) {
                if (ifNext) {
                    $(".quick-content").append("<div class='loading'></div>");
                    ifNext = 0;
                    page += 1;
                    $.ajax({
                        type: "get",
                        url: "/api/quickRecruit",
                        dataType: "json",
                        data: {
                            page: page
                        },
                        success: function (data) {
                            if (data.status == 10000) {
                                $(".loading").remove();
                                var recruits = data.data.quick_recruits;
                                var len = recruits.length;
                                if (len > 0) {
                                    ifNext = (len == 10) ? 1 : 0;
                                    for (var i = 0; i < len; i++) {
                                        var typeClass = (i % 2) > 0 ? "even" : "odd";
                                        var newResume = "<div class='resume-block " + typeClass + "'>\
                                                     <div class='center-line'></div>\
                                                     <div class='resume-time'>" + new Date(recruits[i].release_time).format("yyyy.MM.dd") + "</div>\
                                                     <div class='circle'></div>\
                                                    <div class='resume-detail animation'>\
                                                        <div class='resume-title'>\
                                                            <span class='title'>" + recruits[i].title + "</span>\
                                                        </div>\
                                                        <div class='resume-bottom clearfix'>\
                                                             <a class='avatar' href='" + detailURL + recruits[i].id + "' target='_blank'  style='background-image: url(" + recruits[i].img + ")'></a>\
                                                             <div class='intro-area'>\
                                                                <div class='intro'>" + recruits[i].summary + " </div>\
                                                                <a href='" + detailURL + recruits[i].id + "' target='_blank' class='look'><i></i>看看ta</a>\
                                                             </div>\
                                                        </div>\
                                                    </div>\
                                                </div>";
                                        $(".blocks").append(newResume);
                                    }
                                } else {
                                    ifNext = 0;
                                }
                            }
                        }
                    });
                }
            }
        });

        showResumeDetail();
        function showResumeDetail() {
            var windowHeight = $(window).height();
            $('.resume-block:even').each(function () {
                var $this = $(this).find(".resume-detail");
                if ($this.offset().top <= $(window).scrollTop() + windowHeight - 216) {
                    $this.addClass('flipLeft');
                }
            });
            $('.resume-block:odd').each(function () {
                var $this = $(this).find(".resume-detail");
                if ($this.offset().top <= $(window).scrollTop() + windowHeight - 216) {
                    $this.addClass('flipRight');
                }
            });
        }
    });
});