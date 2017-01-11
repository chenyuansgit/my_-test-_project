//活动
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        }
    }
});

require(['js/lib/IB_jquery','js/common/IB_fn'], function ($,fn) {
    $(function () {

      //var timestamp = Date.parse(new Date());

        //分页绑定
        fn.pagingBind();
    });
});
