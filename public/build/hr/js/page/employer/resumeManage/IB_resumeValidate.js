/**
 * Created by zhphu on 16/7/29.
 */
require.config({
    baseUrl : baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:  '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn','js/common/IB_regex','js/common/IB_input_limit'], function ($, FastClick, fn, regex) {
    $(function () {
        var shareKey = fn.getUrlPara("sk"), tp = fn.getUrlPara("tp");
        $(".code").bind('keypress', function (event) {
            if (event.keyCode == "13") {
                codeValidate(shareKey,tp);
            }
        });
        $(".submit").click(function () {
            codeValidate(shareKey,tp);
        });
    });
    function codeValidate(shareKey,tp) {
        var code = $.trim($(".code").val());
        if (code.length != 6) {
            $(".input-area").nextAll(".input-tips").remove();
            $(".input-area").after("<span class='input-tips'>验证码格式错误</span>");
        } else {
            $.ajax({
                type: "post",
                url: "/resume/codeValidate?tp=" + tp,
                dataType: "json",
                data: {
                    option: {
                        code: code,
                        shareKey: shareKey
                    }
                },
                success: function (data) {
                    if (data.status == 10000) {
                        window.location.href = data.data.url;
                    } else if (data.status == 10007) {
                        $(".input-area").nextAll(".input-tips").remove();
                        $(".input-area").after("<span class='input-tips'>验证码失效，请联系转发人重新转发</span>");
                    } else if (data.status == 10006 || data.status == 10002) {
                        $(".input-area").nextAll(".input-tips").remove();
                        $(".input-area").after("<span class='input-tips'>验证码错误，请检查并重新输入</span>");
                    }
                }
            });
        }
        $(".code").blur(function () {
            if (code.length != 6) {
                $(".input-area").nextAll(".input-tips").remove();
                $(".input-area").after("<span class='input-tips'>验证码格式错误</span>");
            }
        });
        $(".code").focus(function () {
            $(".input-area").nextAll(".input-tips").remove();
        });
    }
});
