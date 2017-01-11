//var NodeCache = require( "node-cache" );
var redis = require('./redis');

//exports.cache = new NodeCache();
exports.cache = redis.client;