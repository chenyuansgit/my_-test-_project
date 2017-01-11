/**
 * Created by zhphu on 16/8/15.
 */
;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['js/m/lib/IB_zepto','js/m/lib/IB_fastclick'], function ($, FastClick) {
            return factory(1, $, FastClick);
        });
    } else {
        factory(0, $, FastClick);
    }
})(function (requirejs, $, FastClick) {
    var authUtil = {
        getAuthUrl : function(type,forward){
            return "/oauth/"+type+"/redirect?forward="+forward+"&type=user";
        }
    };
    if (requirejs) return authUtil;
    window.authUtil = authUtil;
});


















