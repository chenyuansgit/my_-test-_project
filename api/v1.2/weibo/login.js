var resp_status_builder = require('../../../common/response_status_builder.js');
var logger = require("../../../common/log").logger("index");
var config = require('../../../config_default').config;
var proxy = require('../../../proxy/index');
var WeiboLogin = require('../../../oauth/weibo/login');
var async = require('async');
var md5 = require('md5');
var bind_token = require('../../../oauth/bind_token');
var fn = require('../../../common/fn');
var file_upload = require('../../../common/file_upload_util');

var AppKey = config.weibo.client[0].AppKey;
var AppSecret = config.weibo.client[0].AppSecret;

var ACCOUNT_NAME_PREFIX = 'weibo_';
var IMAGE_HOST = 'image.internbird.com';
var ACCOUNT_TYPE = 5;

var client_login = new WeiboLogin({AppKey: AppKey, AppSecret: AppSecret});

function uploadRemoteFile(url, uid, callback) {
    var key = md5(uid) + '/' + md5(+new Date) + '.png';
    file_upload.uploadRemoteFile(url, key, function (err, ret) {
        if (err) {
            logger.error(err);
            return callback(err);
        }
        var new_avatar = "http://" + IMAGE_HOST + '/' + key;
        callback(null, new_avatar);
    });
}

function createAccount(userInfo, callback) {
    var account_name = ACCOUNT_NAME_PREFIX + userInfo.uid;
    async.waterfall([
        function (_callback) {//创建uid
            proxy.account.createUid(function (e, uid) {
                _callback(e, uid);
            });
        },
        function (uid, _callback) {
            proxy.account.create({//创建账户
                uid: uid,
                account_name: account_name,
                account_type: ACCOUNT_TYPE,
                validated: 1,
                create_time: +new Date,
                update_time: +new Date
            }, function (e, account) {
                _callback(e, account);
            });
        },
        function (account, _callback) {
            proxy.user.create({//创建学生用户或者hr用户
                user_id: account.uid,
                avatar: userInfo.avatar_large,
                nick_name: userInfo.name,
                crate_time: +new Date,
                update_time: +new Date
            }, function (e, mod) {
                //异步修改头像,将第三方头像改成qiniu服务器地址
                if (!e) {
                    uploadRemoteFile(userInfo.avatar_large, account.uid, function (e0, avatar) {
                        if (e0) {
                            return logger.error(e0);
                        }
                        proxy.user.updateOneById(account.uid, mod, {avatar: avatar}, function (e1) {
                            if (e1) {
                                logger.error(e1);
                            }
                        });
                    });
                } else {
                    logger.error(e);
                }
                _callback(e, [account, mod]);
            });
        }
    ], function (err, results) {
        callback(err, results && results[0] ? results[0] : {}, results && results[1] ? 1 : 0);
    });
}

function bindAccount(uid, userInfo, callback) {
    var account_name = ACCOUNT_NAME_PREFIX + userInfo.uid;
    proxy.account.create({//创建账户
        uid: uid,
        account_name: account_name,
        account_type: ACCOUNT_TYPE,
        validated: 1,
        create_time: +new Date,
        update_time: +new Date
    }, function (e, account) {
        callback(e, account);
    });
}

exports.login = function (req, res) {
    var option = req.body.option || {}, app_device_id = req.headers['app_device_id'] || option.app_device_id, app_channel = req.headers['app_channel'] || option.app_channel, app_platform = req.headers['app_platform'];
    if (!option.access_token || !option.uid) {
        return res.json(resp_status_builder.build(10002));
    }
    client_login.getUserInfoByUid(option.access_token, option.uid, function (err, userInfo) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10011));
        }
        userInfo.uid = option.uid;
        var account_name = ACCOUNT_NAME_PREFIX + userInfo.uid;
        proxy.account.getOneByName(account_name, function (e0, account) {//查找用户
            if (e0) {
                logger.error(e0);
                return res.json(resp_status_builder.build(10005));
            }
            if (account) {//判断已经存在了该用户,直接返回登录信息
                var auth_token = md5(account.uid + app_device_id + app_platform + app_channel + (+new Date));
                //存储auth_token
                proxy.auth_token.set(account.uid, auth_token);
                return res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                    uid: account.uid,
                    auth_token: auth_token,
                    avatar: userInfo.avatar_large,
                    nick_name: userInfo.name,
                    new_account: 0
                }));
            }
            //如果用户不存在,说明第一次使用此第三方登录,先跳转绑定
            var token = md5(account_name + Date.now() + fn.ranStr(15));//生成绑定的token
            bind_token.set(ACCOUNT_NAME_PREFIX, token, userInfo);//存储token
            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                token: token,
                new_account: 1,
                avatar: userInfo.avatar_large,
                nick_name: userInfo.name
            }));
        });
    });
};


exports.bind = function (req, res) {
    var option = req.body.option || {}, app_device_id = req.headers['app_device_id'] || option.app_device_id, app_channel = req.headers['app_channel'] || option.app_channel, app_platform = req.headers['app_platform'];
    if (!option.token) {
        return res.json(resp_status_builder.build(10002));
    }
    if (option.bind == 1 && !(option.account_name && option.password)) {
        return res.json(resp_status_builder.build(10002));
    }
    bind_token.get(ACCOUNT_NAME_PREFIX, option.token, function (err, userInfo) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        if (!userInfo) {//token不存在或者已过期
            return res.json(resp_status_builder.build(10011));
        }
        var account_name = ACCOUNT_NAME_PREFIX + userInfo.uid;
        proxy.account.getOneByName(account_name, function (e, account0) {
            if (e) {
                logger.error(e);
                return res.json(resp_status_builder.build(10005));
            }
            if (account0) {
                return res.json(resp_status_builder.build(10008, "此用户已绑定"));
            }
            if (option.bind == 1) {//需要绑定
                proxy.account.getOneByName(option.account_name, function (e0, account) {
                    if (e0) {
                        logger.error(e0);
                        return res.json(resp_status_builder.build(10005));
                    }
                    if (!account) {
                        return res.json(resp_status_builder.build(10006, "用户不存在"));
                    }
                    if (account.pwd != md5(md5(option.password + config.auth.auth_token_secret))) {
                        return res.json(resp_status_builder.build(10007, "用户名或者密码错误"));
                    }
                    bindAccount(account.uid, userInfo, function (e1, account) {
                        if (e1) {
                            logger.error(e1);
                            return res.json(resp_status_builder.build(10009));
                        }
                        var auth_token = md5(account.uid + app_device_id + app_platform + app_channel + (+new Date));
                        //存储auth_token
                        proxy.auth_token.set(account.uid, auth_token);
                        bind_token.del(ACCOUNT_NAME_PREFIX, option.token);//删除绑定的token
                        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                            uid: account.uid,
                            auth_token: auth_token
                        }));
                    });
                });
            } else {//跳过绑定
                createAccount(userInfo, function (e2, account) {
                    if (e2) {
                        logger.error(e2);
                        return res.json(resp_status_builder.build(10005));
                    }
                    var auth_token = md5(account.uid + app_device_id + app_platform + app_channel + (+new Date));
                    //存储auth_token
                    proxy.auth_token.set(account.uid, auth_token);
                    bind_token.del(ACCOUNT_NAME_PREFIX, option.token);//删除绑定的token
                    res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
                        uid: account.uid,
                        auth_token: auth_token
                    }));
                });
            }
        });
    });
};