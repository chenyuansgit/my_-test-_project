;(function(window){
    var regex = {
        username :  /^[a-zA-z]\w{3,15}$/,
        pwd : /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/,
        phone : /^0?1[3|4|5|6|7|8][0-9]\d{8}$/,
        phone_2 : /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/,
        email : /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
        code : /^\d{4}$/,
        tel: /^(\(\d{3,4}\)|\d{3,4}-)?\d{7,8}$/,
        qq: /^[1-9]\d{4,9}$/,
        url: /.*?((?:http|https)(?::\/{2}[\w]+)(?:[\/|\.]?)(?:[^\s"]*)).*?/i
};
    if(typeof define == 'function' && define.amd){
        define(function(){
            return regex;
        });
    }else{
        window.regex = regex;
    }
})(this);