var logger = require("../../common/log").logger("index");
var config = require("../../config_default").config;
var proxy = require('../../proxy/index');
var db = require('../../model/index').models;
var des = require('../../common/des');
var resp_status_builder = require('../../common/response_status_builder.js');
var reg = require('../../common/utils/reg');

function findAccount(accounts, field, val) {
    for (var i = 0, len = accounts.length; i < len; ++i) {
        if (accounts[i][field] == val) {
            return accounts[i];
        }
    }
    return null;
}

exports.updateBasePage = function (req, res) { //账户基本信息设置页面
    var uid = res.locals.uid, _accounts = {};
    proxy.account.getAllByUid(uid, function (err, accounts) {
        if (err) {
            logger.error(err);
            return res.render("web/setting/updateBase", {accounts: _accounts});
        }
        var phone_account = findAccount(accounts, 'account_type', 1);
        var email_account = findAccount(accounts, 'account_type', 2);
        var wechat_account = findAccount(accounts, 'account_type', 3);
        var qq_account = findAccount(accounts, 'account_type', 4);
        var weibo_account = findAccount(accounts, 'account_type', 5);
        if (phone_account) {
            _accounts.phone = {
                value: phone_account.account_name,
                validated: 1
            };
        }
        if (email_account) {
            _accounts.email = {
                value: email_account.account_name,
                validated: email_account.validated
            };
        }
        if(wechat_account){
            _accounts.wechat = {
                value: wechat_account.account_name.split('wechat_')[1],
                validated: wechat_account.validated
            };
        }
        if(qq_account){
            _accounts.qq = {
                value: qq_account.account_name.split('qq_')[1],
                validated: qq_account.validated
            };
        }
        if(weibo_account){
            _accounts.weibo = {
                value: weibo_account.account_name.split('weibo_')[1],
                validated: weibo_account.validated
            };
        }
        res.render("web/setting/updateBase", {
            accounts: _accounts
        });
    });

};
exports.updatePwdPage = function (req, res) { //账户密码修改页面
    var uid = res.locals.uid, isBind = 0;
    proxy.account.getAllByUid(uid, function (err, accounts) {
        if (err) {
            logger.error(err);
            return res.render("web/setting/updatePwd", {isBind: isBind});
        }
        var phone_account = findAccount(accounts, 'account_type', 1), email_account = findAccount(accounts, 'account_type', 2);
        if (phone_account || email_account) {
            isBind = 1;
        }
        res.render("web/setting/updatePwd", {isBind: isBind});
    });
};
exports.accountBindPage = function (req, res) { //账户绑定设置页面
    res.render("web/setting/accountBind");
};

exports.updatePhone = function (req, res) {
    var option = req.body.option || {}, uid = res.locals.uid;
    if (!reg.mobile_phone.test(option.phone) || !option.code) {
        return res.json(resp_status_builder.build(10002));
    }
    proxy.validate.get(option.phone, function (err, code) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10011));
        }
        if (!code) {//验证码过期
            return res.json(resp_status_builder.build(10011));
        }
        if (code != option.code) {//验证码不正确
            return res.json(resp_status_builder.build(10012));
        }

        proxy.account.updatePhone(uid, option.phone, function (err) {
            if (err) {
                logger.error(err);
                return res.json(resp_status_builder.build(10003));
            }
            //删除验证码缓存数据
            proxy.validate.del(option.phone);
            //删除显示昵称信息
            req.session.account_name = null;
            proxy.account.display_name.del(uid);

            res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
        });
    });
};
exports.updateEmail = function (req, res) {
    var key = req.query.k, decode, uid, email, time, now = +new Date;
    try {
        decode = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, key));
        uid = decode.user_id;
        email = decode.email;
        time = decode.time;
    } catch (e) {
        res.render('web/setting/validateSucc', {code: '1', msg: 'url error', email: null});
    }
    if (now - time >= 60 * 60 * 1000) {
        return res.render('web/setting/validateSucc', {
            code: '4',
            msg: 'url expired',
            email: null
        });
    }
    proxy.account.getOneByType(uid, 2, function (e1, account) {
        if (e1) {
            logger.error(e1);
            return res.render('web/setting/validateSucc', {
                code: '2',
                msg: 'database error' + e1,
                email: null
            });
        }
        if (!!account) {//修改更新帐户信息和用户信息
            return proxy.account.updateOneByName(account.account_name, account, {
                account_name: email,
                validated: 1,
                update_time: time
            }, function (e) {
                if (e) {
                    logger.error(e);
                    return res.render('web/setting/validateSucc', {
                        code: '2',
                        msg: 'database error' + e,
                        email: null
                    });
                }
                //删除显示昵称信息
                req.session.account_name = null;
                proxy.account.display_name.del(uid);

                res.render('web/setting/validateSucc', {
                    code: '0',
                    msg: 'ok',
                    email: email
                });
            });
        }
        db.account.findOne({
            where: {
                uid: uid
            }
        }).then(function (accountone) {
            if (!accountone) {
                return res.render('web/setting/validateSucc', {
                    code: '3',
                    msg: 'no this user',
                    email: null
                });
            }
            proxy.account.create({
                pwd: accountone.pwd,
                account_type: 2,
                uid: uid,
                account_name: email,
                create_time: now,
                update_time: now
            }, function (e) {
                if (e) {
                    logger.error(e);
                    return res.render('web/setting/validateSucc', {
                        code: '2',
                        msg: 'database error' + e,
                        email: null
                    });
                }
                //删除显示昵称信息
                req.session.account_name = null;
                proxy.account.display_name.del(uid);

                res.render('web/setting/validateSucc', {
                    code: '0',
                    msg: 'ok',
                    email: email
                });
            });
        }).catch(function (er) {
            res.render('web/setting/validateSucc', {
                code: '2',
                msg: 'database error' + er,
                email: null
            });
        });
    });
};