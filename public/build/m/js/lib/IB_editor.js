;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_zepto'], factory);
    } else {
        factory(window.jQuery || window.Zepto);
    }
})(function ($) {
    var Editor = function (editEle) {
        var styles = {
            "-webkit-user-select": "text",
            "user-select": "text",
            "overflow-y": "auto",
            "text-break": "brak-all",
            "outline": "none"
        };
        $(editEle).css(styles).attr("contenteditable", true).addClass("needsclick");
        $(editEle).click(function(){
           $(this).focus();
        });
        this.getValue = function(){
            var encodeHtml = util.encodeHtml($(editEle).html().trim());
            return util.getPlainContent(encodeHtml);
        };
        var util = {
            /*REGX_HTML_ENCODE : /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g,
            encodeHtml : function(s){
                return (typeof s != "string") ? s :
                    s.replace(util.REGX_HTML_ENCODE,
                        function($0){
                            var c = $0.charCodeAt(0), r = ["&#"];
                            c = (c == 0x20) ? 0xA0 : c;
                            r.push(c); r.push(";");
                            return r.join("");
                        });
            }*/
            REGX_HTML_ENCODE: /<script.*?>.*?<\/script>/g,
            encodeHtml : function(s){
                return (typeof s != "string") ? s :
                    s.replace(util.REGX_HTML_ENCODE, "");
            },
            getPlainContent : function(content){
                var objE = document.createElement("div");
                objE.innerHTML = content;
                var tags = objE.getElementsByTagName('*');
                for(var i=0,len=tags.length;i<len;i++){
                    tags[i].removeAttribute('style');
                }
                return objE.innerHTML;
            }
        };
    };

    if (!$.fn.hasOwnProperty('editor')) {
        $.fn.editor = function (user_options) {
            var $elements = this;
            return new Editor($elements);
        };
    }
});
