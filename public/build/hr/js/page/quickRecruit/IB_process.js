require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery'], function ($) {
    $(function(){
        $(".intro-head .btn-tap").click(function(){
            var $this = $(this);
            $(".btn-tap.curr").removeClass("curr");
            $this.addClass("curr");
            var type = $this.attr("data-type");
            $(".blocks").hide();
            $(".blocks-"+type).show();
        });
    })
});
