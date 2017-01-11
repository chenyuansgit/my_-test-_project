var config = require('../config_default').config;
var redis = require("redis"),
    client = redis.createClient(config.redis.port, config.redis.host);

client.on("error", function (err) {
   console.log("redis error:" + err);
});


exports.client = client;