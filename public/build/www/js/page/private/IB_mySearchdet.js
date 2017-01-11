require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn'], function ($, FastClick, fn) {
    $(function () {
        //分页事件绑定
        fn.pagingBind();
    });
});