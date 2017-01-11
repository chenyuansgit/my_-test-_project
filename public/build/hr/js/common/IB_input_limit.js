;(function(factory){
    if(typeof define == 'function' && define.amd){
        define(["js/lib/IB_jquery"],factory);
    }else{
        factory(window.jQuery);
    }
})(function($){
    $("[data-type='int']").on("keyup",function(){
        $(this).val($(this).val().replace(/\D+/g,''));
    });
    $("input.required").focus(function(){
        $(this).nextAll(".input-tips").remove();
    });
});



