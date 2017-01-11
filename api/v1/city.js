var resp_status_builder = require('../../common/response_status_builder.js');
var city = require('../../common/city');
var char_city = require('../../common/client_city');

//获取职位类型
exports.getCity = function(req,res){
    res.json(resp_status_builder.build(10000,(+new Date - req.start_time)+'ms',{city:city}));
};
exports.getCharCity = function(req,res){
    res.json(resp_status_builder.build(10000,(+new Date - req.start_time)+'ms',{city:char_city}));
};


