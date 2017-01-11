var config = require('./config_default').config;
var auth = config.auth;
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger1 = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var RedisStore = require('connect-redis')(session);
var indexRouter = require('./' + config.path.routes);
var app = express();


var session_max_age = 30 * 24 * 60 * 60 * 1000;//一个月


//前端模板定义
if (config.path && config.path.views) {
    app.set('views', path.join(__dirname, config.path.views));
    app.set('view engine', 'ejs');
}

var resoucePath = "/";
app.locals.resoucePath = resoucePath;


//前端静态资源文件根目录
if (config.path.baseUrl) {
    app.locals.baseUrl = config.path.baseUrl.indexOf('http') > -1 ? config.path.baseUrl : ('/' + config.path.baseUrl);
}
//环境变量定义
if (config.env) {
    app.locals.env = config.env;
}
app.locals.homepage = config.homepage || '';

//静态资源服务器
app.use("/public", express.static(path.join(__dirname, 'public')));


app.use(favicon());
app.use(compression());
app.use(logger1('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser(auth.auth_token_secret));

var session_name = config.env === 'prod' ? "IB_SESSION_ID" : ("IB_" + config.env + "_SESSION_ID");

//session中间件
app.use(session({
    resave: true,
    name: session_name,
    saveUninitialized: true,
    secret: auth.auth_token_secret,
    domain: config.domain,
    cookie: {
        maxAge: session_max_age,
        domain: config.domain
    },
    store: new RedisStore({
        host: config.redis.host,
        port: config.redis.port
    })
}));

//禁止在前端显示express

app.disable('x-powered-by');

//路由控制
if (config.name == 'client') {
    app.use(resoucePath + "v1/", indexRouter);
} else {
    app.use(resoucePath, indexRouter);
}

// 404异常捕获
app.use(function (req, res, next) {
    var err = new Error('Page Not Found');
    res.render('error/404', {
        message: err.message,
        title: '404',
        error: {
            status: '404',
            stack: 'We looked everywhere but we could not find it!'
        }
    });
});


// 500异常捕获
app.use(function (err, req, res, next) {
    var err = new Error('Server Error');
    res.render('error/500', {
        message: err.message,
        title: '500',
        error: {
            status: '500',
            stack: 'Some problems with our Server,sorry!'
        }
    });
});

app.listen(config.port);

console.log("Express server listening at:" + config.port + " start...");