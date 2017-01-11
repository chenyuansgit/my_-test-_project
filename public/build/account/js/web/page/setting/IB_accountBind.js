require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/web/lib/IB_jquery': {
            exports: '$'
        },
        'js/web/plugin/IB_jquery.cookie': {
            deps:['js/web/lib/IB_jquery'],
            exports: 'cookie'
        }
    }
});

require(['js/web/lib/IB_jquery', 'js/web/plugin/IB_jquery.cookie','js/web/lib/IB_fastclick','js/web/common/IB_fn','js/web/page/setting/IB_auth'], function ($, cookie, FastClick, fn,authUtil) {
    var forward = window.location.href;
    $(".bind-account").click(function () {
        var type = $(this).attr("data-type");
        var authRedirUrl = encodeURIComponent(forward);
        window.open(authUtil.getAuthUrl(type,authRedirUrl));
    });
});
