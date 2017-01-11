;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['js/lib/IB_zepto', 'js/lib/IB_jweixin'], function ($, wx) {
            return factory(1, $, wx);
        });
    } else {
        factory(0, $, wx);
    }
})(function (requirejs, $, wx) {

    var appId = 'wxb2182e3727f1cacc';
    var jsApiList = ["onMenuShareTimeline", "onMenuShareAppMessage"];//需要使用的JS接口列表

    function jsApiAuth(option, callback) {
        $.ajax({
            url: 'http://account.dev.internbird.com/oauth/wechat/jsapi_ticket?url=' + encodeURIComponent(option.url),
            type: 'get',
            dataType: 'jsonp',
            jsonpCallback: 'call',
            success: function (data) {
                wx.config({
                    debug: false,
                    appId: appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: jsApiList
                });
                wx.ready(function () {
                    callback(null);
                });
                wx.error(function (err) {
                    callback(err);
                });
            }
        });
    }

    var wxAuth = {
        jsApiAuth: jsApiAuth,
        isWeixin: navigator.userAgent.toLowerCase().indexOf('micromessenger') > -1 ? true : false
    };
    if (requirejs) return wxAuth;
    window.wxAuth = wxAuth;
});