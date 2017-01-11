;
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['js/web/lib/IB_jquery','js/web/lib/IB_fastclick'], function ($, FastClick) {
            return factory(1, $, FastClick);
        });
    } else {
        factory(0, $, FastClick);
    }
})(function (requirejs, $, FastClick) {
    var fn = {
        //获取url参数
        getUrlPara : function(name) {
            var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
            var r = window.location.search.substr(1).match(reg);
            if (r != null) {
                return r[2];
            }
            return '';
        },
        randomKey: function (len) {
            var key = "";
            var ascTable = ["0", "1", "2", "3", "4", "5",
                "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h",
                "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t",
                "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H",
                "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
                "U", "V", "W", "X", "Y", "Z"];
            for (var i = 0; i < len; ++i) {
                key += ascTable[parseInt(Math.random() * 62)].toString();
            }
            return key;
        },
        absoluteValue: function (a) {
            return parseFloat(a) < 0 ? -a : a;
        },
        //设置缓存
        cookie : function(c_name,c_value,expire,option){
            if(arguments.length == 1){
                var name = c_name + "=";
                var ca = document.cookie.split(';');
                for(var i=0; i<ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1);
                    if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
                }
                return "";
            }else{
                var d = new Date();
                var baseNum = 24*60*60*1000;
                if(option){
                    switch(option.expireType){
                        case "s" : baseNum = 1000;break;
                        case "m" : baseNum = 60*1000;break;
                        case "h" : baseNum = 60*60*1000;break;
                        case "d" : baseNum = 24*60*60*1000;break;
                    }
                }
                d.setTime(d.getTime() + (expire*baseNum));
                var expires = "expires="+d.toUTCString() || '';
                document.cookie = c_name + "=" + c_value + "; " + expires;
            }
        },
        removeCookie : function(c_name){
            fn.cookie(c_name, "", -1);
        },
        storage : function(name,value){
            try{
                if(arguments.length == 1) {
                    return window.localStorage? localStorage.getItem(name): fn.cookie(name);
                }else{
                    if (window.localStorage) {
                        localStorage.setItem(name, value);
                    } else {
                        fn.cookie(name, value);
                    }
                }
            }catch(e){

            }
        },
        //ajax
        doAjaxBack : function(type,url,async,dataType,data,succFunc,errFunc){
            async = (async==null || async=="" || typeof(async)=="undefined")? "true" : async;
            type = (type==null || type=="" || typeof(type)=="undefined")? "post" : type;
            dataType = (dataType==null || dataType=="" || typeof(dataType)=="undefined")? "json" : dataType;
            data = (data==null || data=="" || typeof(data)=="undefined")? {"date": new Date().getTime()} : data;
            if(type =="post"){
                data ={"option": data};
            }
            $.ajax({
                type:type,
                url:url,
                async:async,
                data:data,
                dataType:dataType,
                success:function(data){
                    succFunc(data);
                },
                error:function(data){
                    errFunc(data);
                }
            });
        },
        //实时监听输入框值的变化
        inputListener : function( input, callback ) {
            var delay = 0;
            if("onpropertychange" in input[0] && ( $.browser.ie && (parseInt( $.browser.version <= 8 )) ) ) { //ie7,8完美支持，ie9不支持
                input.bind( 'propertychange', function(e) {
                    e.originalEvent.propertyName == 'value' && callback();
                } );
            }
            else if( $.browser.ie && ( $.browser.version == 9 ) ) {
                var timer;
                var oldV = input.val();
                input.bind( 'focus', function() {
                    timer = window.setInterval(function(){
                        var newV = input.val();
                        if(newV == oldV)
                            return;
                        // 值发生变化
                        oldV = newV;
                        // 回调函数
                        callback();
                    }, 50);
                } );
                input.bind( 'blur', function() {
                    window.clearInterval(timer);
                    timer = undefined;
                } );
            }
            else {
                // 火狐、chrome完美支持
                input.bind( 'input', function(e) {
                    callback();
                } );
            }
        },
        //分页
        pagingBind : function(){
            var url = location.href;
            var curr_page = $(".page.active").data("page");
            if(url.indexOf("page=")<0){
                if(url.indexOf("?")<0){
                    url +="?page="+curr_page;
                }else{
                    url +="&page="+curr_page;
                }
            }
            $(".page").click(function(){
                var nextPage = "page="+$(this).data("page");
                url = url.replace("page="+curr_page,nextPage);
                location.href = url;
            });
            $(".pages .on").click(function(){
                var page = parseInt($(".page.active").data("page"));
                if($(this).hasClass("prev")){
                    var nextPage = "page=" + (page-1);
                    url = url.replace("page="+curr_page,nextPage);
                    location.href = url;
                }else {
                    var nextPage = "page=" + (page+1);
                    url = url.replace("page="+curr_page,nextPage);
                    location.href = url;
                }
            });
        },
        //下拉事件绑定
        selectorBind: function(){
            $(document).click(function(e){
                var event = e || window.event;
                if(!$(".btn-selector").is(event.target) && $(".btn-selector").has(event.target).length === 0){
                    $(".selector").hide();
                }
            });
            $(".btn-selector").on("click",function(e){
                var event = e || window.event;
                $(".selector").hide();
                $(this).next(".selector").show();
            });
            $(".selector li").on("click",function(e){
                var event = e || window.event;
                event.stopPropagation();
                var oSelector = $(this).parent();
                var btnSel = $(oSelector).prev(".btn-selector").find("input");
                $(btnSel).css({"color":"#000"});
                if($(this).hasClass("ct")){
                    var id = $(this).attr("data-type-id");
                    $(btnSel).attr("data-type-id",id);
                }
                $(btnSel).val($(this).text());
                $(oSelector).hide();
            });

        },
        //弹窗通用事件
        popBoxBind : function(){
            $(document).on("click",".overlay",function(){
                $(".req").removeClass("error");
                $(this).hide();
                $(".popBox").hide();
            });
            $(document).on("click",".popBox-content .btn-console",function(){
                $(".req").removeClass("error");
                $(".overlay").hide();
                $(".popBox").hide();
            });
        },
        //回到顶部
        backTopBind: function(){
            $(window).scroll(function() {
                if ($(window).scrollTop() > 500) {
                    $("#back-top").show();
                } else {
                    $("#back-top").hide();
                }
            });
            $("#back-top").click(function() {
                pageScroll();
            });
            function pageScroll() {
                window.scrollBy(0, -20);
                var scrollTimer = setTimeout(function() {
                    pageScroll();
                }, 1);
                if ($(window).scrollTop() == 0) {
                    clearTimeout(scrollTimer);
                }
            }
        }
    };
    $(document).on("click",".logout",function(){
        $.ajax({
            type:"get",
            url:"/api/quitLogin",
            dataType:"json",
            success:function(data){
                location.reload();
            },
            error:function(err){
                location.reload();
            }
        });
    });
    try{
        FastClick.attach(document.body);
    }catch(e){

    }

    /*/!*页面刚加载完成时*!/
    function resizing() {
        var w = $(window).height();  //浏览器当前窗口可视区域高度
        var d = $(document.body).outerHeight(true);  //浏览器当前窗口文档body的总高度 包括border padding margin
        if(w>=d) {
            $(".footer").css({"position":"fixed","bottom":"0"});
        }
    }

    resizing();

    /!*改变浏览器窗口*!/
    $(window).resize(function() {
        resizing();
    });*/

    //解决低版本浏览器兼容
    String.prototype.trim=function() {
        return this.replace(/(^\s*)|(\s*$)/g,'');
    };

    //时间戳格式化
    Date.prototype.format = function(format) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };
    //字符串转换成时间戳
    String.prototype.toTimeStamp = function() {
        var dot = this.indexOf("-")>-1?"-":".";
        var dt = new Date(),
            arr = this.split(dot);
        dt.setFullYear(parseInt(arr[0]));
        dt.setMonth(parseInt(arr[1]) - 1);
        dt.setDate(parseInt(arr[2])||1);
        dt.setHours(0);
        dt.setMinutes(0);
        dt.setSeconds(0);
        return dt.getTime();
    };
    if (requirejs) return fn;
    window.fn = fn;
});


















