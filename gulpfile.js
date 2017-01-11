/*项目静态文件打包文件*/

var config = require('./config_default').config;
var src = config.path.gulp.build;
var dist = config.path.gulp.dist;//打包后最终文件存放目录
var temporary = dist.replace('dist', 'temporary');//临时存放目录

var gulp = require('gulp'),
    less = require('gulp-less'),
    base64 = require('gulp-base64'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-rimraf'),
    concat = require('gulp-concat'),
    RevAll = require('gulp-rev-all'),
    revReplace = require('gulp-rev-replace'),
    replace = require("gulp-replace"),
    livereload = require('gulp-livereload');


//将字体文件base64编译
gulp.task('base64-font', function () {
    gulp.src('public/' + src + '/less/font-base64/fonts.less')
        .pipe(base64({
            extensions: ['eot', 'otf', 'svg', 'ttf', 'woff'],
            maxImageSize: 10 * 1024 * 1024, // bytes
            debug: true
        }))
        .pipe(gulp.dest('public/' + src + '/less/'));
});

//Less解析
gulp.task('build-less', ['base64-font'], function () {
    gulp.src('public/' + src + '/less/page/**')
        .pipe(less())
        .pipe(replace('_baseUrl_', config.path.baseUrl))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/' + src + '/css/page'))
        .pipe(gulp.dest('public/' + temporary + '/css/page'));
});

// 脚本
gulp.task('build-js', function () {
    if (config.env === 'prod') {
        return gulp.src('public/' + src + '/js/**')
            .pipe(uglify())
            .pipe(gulp.dest('public/' + temporary + '/js'));
    }
    return gulp.src('public/' + src + '/js/**')
        .pipe(gulp.dest('public/' + temporary + '/js'));
});

// 图片
gulp.task('build-img', function () {
    return gulp.src('public/' + src + '/img/**')
        /*.pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))*/
        .pipe(gulp.dest('public/' + temporary + '/img'));
});

//给所有build文件加md5戳
gulp.task("revAll", ['build-less', 'build-img', 'build-js'], function () {
    var revAll = new RevAll({hashLength: 12});
    return gulp.src(['public/' + temporary + '/js/**', 'public/' + temporary + '/css/**', 'public/' + temporary + '/img/**'])
        .pipe(revAll.revision())
        .pipe(gulp.dest('public/' + temporary))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('public/' + temporary));
});

//替换静态资源的url
gulp.task("resource-replace", ["revAll"], function () {
    var manifest = gulp.src("./public/" + temporary + "/rev-manifest.json");
    return gulp.src("public/" + temporary + "/**")
        .pipe(revReplace({manifest: manifest, replaceInExtensions: '.css,.js,.img'}))
        .pipe(gulp.dest("public/" + temporary));
});

//替换模版中的静态资源url地址
gulp.task("ejs-replace", ["revAll"], function () {
    var manifest = gulp.src("./public/" + temporary + "/rev-manifest.json");
    return gulp.src("views/" + src + "/**")
        .pipe(revReplace({manifest: manifest, replaceInExtensions: '.ejs'}))
        .pipe(gulp.dest("views/" + temporary));
});

// 清理临时资源存放区
gulp.task('clean-temporary', function () {
    return gulp.src(['public/' + temporary, 'views/' + temporary], {read: false}).pipe(clean());
});

// 清理资源真实存放区
gulp.task('clean-dist', ['ejs-replace', 'resource-replace'], function () {
    return gulp.src(['public/' + dist, 'views/' + dist], {read: false}).pipe(clean());
});

//将临时存放区的静态资源数据移动端真实资源存放区
gulp.task('resource-move', ['clean-dist'], function () {
    return gulp.src('public/' + temporary + '/**')
        .pipe(gulp.dest('public/' + dist + '/'));
});
//将临时存放区的ejs数据移动端真实资源存放区
gulp.task('ejs-move', ['clean-dist'], function () {
    return gulp.src('views/' + temporary + '/**')
        .pipe(gulp.dest('views/' + dist + '/'));
});

// 任务开始入口
gulp.task('default', ['clean-temporary'], function () {
    gulp.start('resource-move', 'ejs-move');
});
