(function(_this){
    var reg = {
        username_reg: /^[a-zA-z]\w{3,15}$/,
        pwd_reg: /^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,22}$/,
        phone_reg: /^0?1[3|4|5|6|7|8][0-9]\d{8}$/,
        phone_reg_2: /^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$/,
        email_reg: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
        code_reg: /^\d{4}$/,
        vcode_reg: /^([a-z]|[A-Z]|[0-9]){4}$/
    };
    if(typeof define === 'function' && define.amd){
        define(function(){
            return reg;
        });
    }else{
        _this.reg = reg;
    }
})(this);