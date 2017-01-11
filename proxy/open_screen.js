var cache = require('../cache/index').cache;
var db = require('../model/index').models;

var redis_key_client_open_screen = "client_open_screen";

exports.create = function(option,callback){
    db.open_screen.create(option).then(function(open_screen){
        update(open_screen,function(err){
            callback(err,open_screen);
        });
    }).catch(function (e) {
        callback(e);
    });
};

function update(open_screen,callback){
    cache.hmset([redis_key_client_open_screen,'state',2,'id',open_screen.id,'desc',open_screen.desc,'img320',open_screen.img320,'img480',open_screen.img480,'img720',open_screen.img720,'img750',open_screen.img750,'img1080',open_screen.img1080,'url',open_screen.url],function(err){
        return callback(err);
    });
}
exports.update = update;


exports.getLatest = function(callback){
    cache.hgetall(redis_key_client_open_screen,function (err,open_screen) {
        return callback(err,open_screen || {});
    })
};

function offline(){
    cache.hset(redis_key_client_open_screen,'state',2);
}
function online(){
    cache.hset(redis_key_client_open_screen,'state',1);
}
exports.offline = offline;
exports.online = online;

exports.findOneById = function (id, callback) {
    db.open_screen.findOne({
        where: {
            id: id
        }
    }).then(function (open_screen) {
        callback(null, open_screen);
    }).catch(function (e) {
        callback(e);
    });
};
exports.findOneByOption = function (option, callback) {
    db.open_screen.findOne(option).then(function (open_screen) {
        callback(null, open_screen);
    }).catch(function (e) {
        callback(e);
    });
};
exports.updateOneById = function (option, id, callback) {
    db.open_screen.update(option, {
        where: {
            id: id
        }
    }).then(function (rows) {
        cache.hget(redis_key_client_open_screen,'id',function (err,curr_id) {
            if(id !== curr_id){
               return callback(err,rows)
            }
            update(option,function(err){
                return callback(err,rows)
            })

        })

    }).catch(function (e) {
        callback(e);
    });
};
