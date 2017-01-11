require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_fn', 'js/lib/IB_zepto','js/lib/IB_fastclick', 'js/lib/IB_wxAuth', 'js/lib/IB_jweixin'], function (fn, $,FastClick, wxAuth, wx) {
    $(function () {
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        function delivery(option, callback) {
            $.ajax({
                type: 'post',
                url: '/api/u_resume/resumeDelivery',
                data: {
                    option: option
                },
                dataType: 'json',
                success: function (data) {
                    if (data.status == 10000) return callback(null);
                    callback(data.desc, data.status);
                },
                error: function (err) {
                    callback(err);
                }
            });
        }
        FastClick.attach(document.body);
        var forward = decodeURIComponent($.trim(fn.getQueryString('forward')));
        $('.back').attr('href', forward || '/');

        $('.delivery.on').on("click", function (e) {
            e.preventDefault();
            if ($(this).hasClass('ing')) return false;
            if(!isLogin){
                 window.location.href = account_host+"/login?forward=" + encodeURIComponent(location.href);
                 return;
            }
            $(this).addClass('ing').text('正在投递...');
            delivery({
                job_id: $('#content').attr('data-jid'),
                job_user_id: $('#content').attr('data-job-user-id'),
                job_company_id: $('#content').attr('data-job-company-id')
            }, function (err, code) {
                if (err) {
                    $('.delivery.on').removeClass('ing').text('投递');
                    if(code == 10004){
                        return window.location.href = account_host+"/login?forward=" + encodeURIComponent(location.href);
                    }
                    if (code == 10006) {
                        return window.location.href = "/private/resumeCreate?forward=" + encodeURIComponent(location.href);
                    }
                    if (code == 10013) {
                        return alert('您今日的投递已超过上限,请明天再来!');
                    }
                    if (code == 10007) {
                        return alert('您已经投递过该职位!');
                    }
                    return alert('系统错误,请稍后再试!');
                }
                $('.delivery').removeClass('on').removeClass('ing').addClass('off').text('已投递').off("click");
            });
        });
        var data_src = $('.avatar').attr('data-src');
        var imgUrl = data_src.indexOf('http') > -1 ? data_src : ('http://' + location.hostname + data_src);
        wxAuth.jsApiAuth({
            url: window.location.href.split('#')[0]
        }, function (err) {
            console.log(err);
            wx.onMenuShareTimeline({
                title: $('.share-back').attr('data-title'), // 分享标题
                desc: $('.share-back').attr('data-desc'),
                imgUrl: imgUrl, // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
            wx.onMenuShareAppMessage({
                title: $('.share-back').attr('data-title'), // 分享标题
                desc: $('.share-back').attr('data-desc'),
                imgUrl: imgUrl, // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
        });
        if (wxAuth.isWeixin) {
            $('.share-back').on("click", function (e) {
                e.preventDefault();
                $(this).addClass('none');
            });
            $("#share").on("click", function () {
                $('.share-back').removeClass('none');
            });
        }
    });
});