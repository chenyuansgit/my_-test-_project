var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var async = require('async');

var redis_key_article_type = "article_type";

exports.add = function (name, callback) {
    db.article_type.create({
        name: name,
        create_time: +new Date,
        update_time: +new Date
    }).then(function(article_type){
         cache.hset(redis_key_article_type,article_type.id,article_type.name);
         callback(null,article_type);
    }).catch(function (e) {
        callback(e);
    });
};

exports.update = function(id,name,callback){
    db.article_type.update({
        name: name,
        update_time: +new Date
    },{
        where:{
            id:id
        }
    }).then(function(row){
        if(row){
            cache.hset(redis_key_article_type,id,name);
        }
        callback(null,row);
    }).catch(function (e) {
        callback(e);
    });
};


exports.list = function(callback){
    cache.hgetall(redis_key_article_type,function(e,data){
        callback(e,data);
    });
};