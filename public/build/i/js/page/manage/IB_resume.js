require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_zepto','js/lib/IB_fn', 'js/lib/IB_fastclick', 'js/lib/IB_lazyload'], function ($,fn, FastClick) {
    var shouldRequest = 0, page = 0, loadListOk;

    function LoadTopicList(scroll, status) {
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
        $.ajax({
            url: "/api/resume/getList?status="+status+"&page=" + (scroll ? (page + 1) : 1),
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    var resumes = data.data.resumes;
                    shouldRequest = resumes.length >=10? 1 : 0;
                    $(".new").removeClass('new');
                    var list_html = '';
                    if(resumes.length){
                        for (var i = 0; i < resumes.length; ++i) {
                            var eduHTML = '';
                            try{
                                var edu = JSON.parse(resumes[i].education_detail);
                                eduHTML = "<span class='school ellipsis'>"+edu[0].school+"</span><span class='ellipsis'>|</span>\
                                       <span class='major ellipsis'>"+edu[0].major+"</span><span class='ellipsis'>|</span>\
                                       <span class='stage ellipsis'>"+edu[0].stage+"</span>";

                            }catch(e){}
                            var rid = resumes[i].rid;
                            var jid = resumes[i].job_id;
                            var forward = encodeURIComponent(location.href);
                            var resume_bottom = "";
                            if(status == 3){
                                try{
                                    var interview_info = JSON.parse(resumes[i].interview_info);
                                    resume_bottom = "<div class='resume-bottom'>\
                                                <span class='resume-option'>面试时间 : "+new Date(+interview_info.interview_time).format('yyyy-MM-dd hh:mm')+"</span>\
                                             </div>";
                                }catch(e){}

                            }
                            list_html += "<a class='resume clearfix' href='/resume/detail/"+rid+"?jid="+jid+"&forward="+forward+"' data-rid='"+resumes[i].rid+"'>\
                                        <div class='resume-l'>\
                                            <div class='avatar new lazy' data-original='"+ resumes[i].avatar + "'></div>\
                                            <div class='name ellipsis'>"+resumes[i].name+"</div>\
                                        </div>\
                                        <div class='resume-r'>\
                                            <div class='resume-top'>\
                                                <span class='job-name ellipsis'>"+resumes[i].job_name+"</span>\
                                                <span class='time'>"+new Date(resumes[i].delivery_time).format('yyyy.MM.dd')+"</span>\
                                            </div>\
                                            <div class='resume-center clearfix'>\
                                                <span class='sex ellipsis'>"+(resumes[i].male?'男':'女')+"</span>\
                                                "+eduHTML+"\
                                            </div>\
                                            "+resume_bottom+"\
                                        </div>\
                                    </a>";
                        }
                    }else{
                        $('#list').after("<div class='w100 loading tac' id='loading'>没有符合条件的简历信息</div>");
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
        shouldRequest = 1;
        switch(location.href.split('#')[1]){
            case '2':
                LoadTopicList(0,2);
                $(".tab-area .tab-2").addClass("curr");
                break;
            case '3':
                LoadTopicList(0,3);
                $(".tab-area .tab-3").addClass("curr");
                break;
            case '4':
                LoadTopicList(0,4);
                $(".tab-area .tab-4").addClass("curr");
                break;
            default:
                LoadTopicList(0,1);
                $(".tab-area .tab-1").addClass("curr");
                break;
        }
        $(window).scroll(function () {
            var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
            if (scrollBottom <= 4 && shouldRequest) {
                LoadTopicList(1,parseInt($(".tab.curr").attr("data-id")));
            }
        });
        $(document).on('click', '.tab', function () {
            var that = $(this);
            if (that.hasClass('curr')) {
                return false;
            }
            $('.tab.curr').removeClass('curr');
            that.addClass('curr ');
            switch (that.attr('data-id')) {
                case '1':
                    LoadTopicList(0,1);
                    break;
                case '2':
                    LoadTopicList(0, 2);
                    break;
                case '3':
                    LoadTopicList(0, 3);
                    break;
                case '4':
                    LoadTopicList(0, 4);
                    break;
                default:
                    $('#list').empty();
                    break;
            }
        });
    });
});