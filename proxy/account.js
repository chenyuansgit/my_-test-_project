var db = require('../model/index').models;
var cache = require('../cache/index').cache;
var async = require('async');
var rankey = require('../common/fn').rankey;
var config = require("../config_default").config;
var user = require('./user');
var employer = require('./employer');
var md5 = require("md5");

var redis_key_account_name = "account_name_";
var redis_key_account_name_expire = 30 * 24 * 3600;//过期时间一个月
var redis_key_account_uid = "account_uid_";
var redis_key_display_name = "account_display_name";


function checkUid(uid, cb) {
    db.account.findOne({
        where: {
            uid: uid
        }
    }).then(function (account2) {
        cb(null, account2 ? false : true);
    }).catch(function (err) {
        cb(err);
    });
}
function createUid(callback) {
    var ran = parseInt('1000' + rankey(10000000, 99999999).toString());
    checkUid(ran, function (e1, result1) {//第一次查找
        if (e1) {
            return callback(e1);
        }
        if (!!result1) {
            return callback(null, ran);
        }
        ran = parseInt('1000' + rankey(10000000, 99999999).toString());

        checkUid(ran, function (e2, result2) {//第二次查找
            if (e2) {
                return callback(e2);
            }
            if (!!result2) {
                return callback(null, ran);
            }
            ran = parseInt('1000' + rankey(10000000, 99999999).toString());

            checkUid(ran, function (e3, result3) {//第三次查找,三次查找都碰撞返回失败
                if (e3) {
                    return callback(e3);
                }
                if (!!result3) {
                    return callback(null, ran);
                }
                callback('find error');
            });
        });
    });
}

function getOneByName(account_name, callback) {
    cache.get(redis_key_account_name + account_name, function (err, account) {
        if (!err && account && account.uid) {
            return callback(null, JSON.parse(account));
        }
        db.account.findOne({
            where: {
                account_name: account_name
            }
        }).then(function (account1) {
            if (account1) {
                insertCache(account1);
            }
            callback(null, account1);
        }).catch(function (err) {
            callback(err);
        });
    });
}
function getOneByType(uid, account_type, callback) {
    db.account.findOne({
        where: {
            account_type: account_type,
            uid: uid
        }
    }).then(function (account) {
        callback(null, account && account.dataValues ? account.dataValues : null);
    }).catch(function (e) {
        callback(e);
    });
}
function create(option, callback) {
    db.account.create(option).then(function (account) {
        if (account) {
            insertCache(account);
        }
        callback(null, account);
    }).catch(function (e) {
        callback(e);
    });
}
function getAllByUid(uid, callback) {
    db.account.findAll({
        where: {
            uid: uid
        }
    }).then(function (accounts) {
        callback(null, accounts);
    }).catch(function (e) {
        callback(e);
    });
}


function insertCache(account, callback) {//redis异常,不抛出
    cache.set(redis_key_account_name + account.account_name, JSON.stringify(account.dataValues), function (e) {
        if (e) {
            return callback && callback(e);
        }
        cache.expire(redis_key_account_name + account.account_name, redis_key_account_name_expire);
        callback && callback(null, account);
    });
    cache.hset(redis_key_account_uid, account.account_type, account.account_name);
}

function updateOneByName(account_name, account, values, callback) {
    db.account.update(values, {
        where: {
            account_name: account_name
        }
    }).then(function (row) {
        if (!row[0]) {
            return callback('update error');
        }
        for (var i in values) {
            account[i] = values[i];
        }
        if (account_name != account.account_name) {
            cache.del(redis_key_account_name + account_name);
        }
        insertCache(account, function (err) {
            if (err) {
                cache.del(redis_key_account_name + account_name);
            }
            callback(null, account);
        });
    }).catch(function (e) {
        callback(e);
    });
}

/**
 * @return { 1: '18601695636', 2: '456846384@qq.com', 3: 'qq_openid' }
 * @param uid
 * @param callback
 */
function getListById(uid, callback) {//uid
    cache.hgetall(redis_key_account_uid + uid, function (err, accounts) {
        if (!err && accounts) {
            return callback(null, accounts);
        }
        db.account.findAll({
            where: {
                uid: uid
            }
        }).then(function (accs) {
            var json_accounts = {};
            for (var i = 0; i < accs.length; i++) {
                json_accounts[accs[i].account_type] = accs[i].account_name;
            }
            cache.hmset(redis_key_account_uid + uid, json_accounts);
            callback(null, json_accounts);
        }).catch(function (e) {
            callback(e);
        });
    });
}

//修改密码(需要原密码)
function updatePwd(uid, old_pass, new_pass, callback) {
    db.account.update({pwd: md5(md5(new_pass + config.auth.auth_token_secret)), update_time: +new Date}, {
        where: {
            uid: uid,
            pwd: md5(md5(old_pass + config.auth.auth_token_secret))
        }
    }).then(function (row) {
        if (!row[0]) {
            return callback(null, row);
        }
        db.account.findAll({
            where: {
                uid: uid
            }
        }).then(function (accounts) {
            for (var i = 0; i < accounts.length; i++) {
                cache.del(redis_key_account_name + accounts[i].account_name);
            }
        }).catch(function (err) {
            return callback(err);
        });
        callback(null, row);
    }).catch(function (e) {
        callback(e);
    });
}
//找回密码(不需要原密码)
function findPwd(uid, new_pass, callback) {
    db.account.update({pwd: md5(md5(new_pass + config.auth.auth_token_secret)), update_time: +new Date}, {
        where: {
            uid: uid
        }
    }).then(function (row) {
        if (!row[0]) {
            return callback(null, row);
        }
        db.account.findAll({
            where: {
                uid: uid
            }
        }).then(function (accounts) {
            for (var i = 0; i < accounts.length; i++) {
                cache.del(redis_key_account_name + accounts[i].account_name);
            }
        }).catch(function (err) {
            callback(err);
        });
        callback(null, row);
    }).catch(function (e) {
        callback(e);
    });
}


function findAccount(accounts, field, val) {
    for (var i = 0, len = accounts.length; i < len; ++i) {
        if (accounts[i][field] == val) {
            return accounts[i];
        }
    }
    return null;
}
function findVal(accounts, field) {
    for (var i = 0, len = accounts.length; i < len; ++i) {
        if (accounts[i][field]) {
            return accounts[i][field];
        }
    }
    return '';
}

/**
 * 修改手机号
 * @param uid
 * @param newPhone
 * @param callback
 */
function updatePhone(uid, new_phone, cb) {
    //考虑到如果没有找到account_type为1的账户时,不能正确的返回密码
    getAllByUid(uid, function (err, accounts) {
        if (err) {
            return cb(err);
        }
        var account = findAccount(accounts, 'account_type', 1), time = +new Date, pwd = findVal(accounts, 'pwd');
        if (!account) {//创建新的手机account
            return create({
                account_name: new_phone,
                uid: uid,
                pwd: pwd,
                account_type: 1,
                create_time: time,
                update_time: time
            }, function (e1) {
                cb(e1);
            });
        }
        db.account.update({//update手机account
            account_name: new_phone,
            update_time: time
        }, {
            where: {
                account_name: account.account_name
            }
        }).then(function (rows) {
            cache.del(redis_key_account_name + account.account_name);
            cache.hset(redis_key_account_uid + uid, account.account_type, new_phone);
            cb(null, !rows[0] ? false : true);
        }).catch(function (e1) {
            cb(e1);
        });
    });
}

function getDisplayName(uid, system, callback) {
    cache.hget(redis_key_display_name, uid, function (err, name) {
        if (!err && name) {
            return callback(null, name);
        }
        async.parallel([function (_callback) {//查找相应的用户名
            var system_user = system === 'hr' ? employer : user;
            system_user.getOneById(uid, function (e, _system_user) {
                _callback(e, _system_user && _system_user.nick_name ? _system_user.nick_name : '');
            });
        }, function (_callback) {//查找登录名
            getAllByUid(uid, function (e, accounts) {
                if (e) {
                    return _callback(e);
                }
                var phone_account = findAccount(accounts, 'account_type', 1), email_account = findAccount(accounts, 'account_type', 2);
                _callback(null, phone_account ? phone_account.account_name : (email_account ? email_account.account_name : ''));
            });
        }], function (error, results) {
            if (error) {
                return callback(error);
            }
            var name = results[0] || results[1];
            if (name) {
                setDisplayName(uid, name);
            }
            callback(null, name || '');
        });

    });
}
function setDisplayName(uid, name, callback) {
    cache.hset(redis_key_display_name, uid, name, function (err) {
        callback && callback(err);
    });
}

function delDisplayName(uid, callback) {
    cache.hdel(redis_key_display_name, uid, function (err) {
        callback && callback(err);
    });
}


module.exports = {
    create: create,
    updateOneByName: updateOneByName,
    getOneByName: getOneByName,
    getOneByType: getOneByType,
    getAllByUid: getAllByUid,
    createUid: createUid,
    getListById: getListById,
    updatePwd: updatePwd,
    findPwd: findPwd,
    updatePhone: updatePhone,
    display_name: {
        set: setDisplayName,
        get: getDisplayName,
        del: delDisplayName
    }
};

