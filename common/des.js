var crypto = require('crypto');
var config = require("../config_default").config;
//var data = '203658974852';


//加密
exports.cipher = function (algorithm, a_key, buf) {
    var key = new Buffer(a_key);
    var iv = new Buffer(config.des_3.iv ? config.des_3.iv : 0);
    var encrypted = "";
    var cip = crypto.createCipheriv(algorithm, key, iv);
    cip.setAutoPadding(config.des_3.autoPad);
    encrypted += cip.update(buf, 'utf8', 'hex');
    encrypted += cip.final('hex');
    return encrypted;
};
//解密
exports.decipher = function (algorithm, a_key, encrypted) {
    var key = new Buffer(a_key);
    var iv = new Buffer(config.des_3.iv ? config.des_3.iv : 0);
    var decrypted = "";
    var decip = crypto.createDecipheriv(algorithm, key, iv);
    decip.setAutoPadding(config.des_3.autoPad);
    decrypted += decip.update(encrypted, 'hex', 'utf8');
    decrypted += decip.final('utf8');
    return decrypted;
};