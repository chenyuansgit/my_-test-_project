(function (window) {
    var fn = {
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]).replace(/\s/g, "");
            return "";
        },
        rankey: function (len) {
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
        cookie : function(c_name,c_value,expiredays){
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
        }
    };
    Date.prototype.format = function (format) {
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
    String.prototype.toTimeStamp = function() {
        var dt = new Date(),
            dot = this.replace(/\d/g, '').charAt(0),
            arr = this.split(dot);

        dt.setFullYear(arr[0]);
        dt.setMonth(arr[1] - 1);
        dt.setDate(arr[2] || 1);
        return +dt;
    };
    String.prototype.trim = function(){
        return this.replace(/(^\s*)|(\s*$)/g, "");
    };
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
        return this;
    };
    if (typeof define === 'function' && define.amd) {
        define(function () {
            'use strict';
            return fn;
        });
    } else {
        window.fn = fn;
    }
})(this);