'use strict';
var GeTui = require('./GT.push');
var Target = require('./getui/Target');
var SingleMessage = require('./getui/message/SingleMessage');
var TransmissionTemplate = require('./getui/template/TransmissionTemplate');
var config = require('../../config_default').config;
var RequestError = require('./RequestError');
var APNPayload = require('./payload/APNPayload');
var SimpleAlertMsg = require('./payload/SimpleAlertMsg');
var AppMessage = require('./getui/message/AppMessage');

//别名推送方式
//var ALIAS = '';
var HOST = 'http://sdk.open.api.igexin.com/apiex.htm';

//根据uid别名设置推送
function pushMessageToSingle(gt, template, alias, callback) {
    //单推消息体
    var message = new SingleMessage({
        isOffline: true,                        //是否离线
        offlineExpireTime: 3600 * 12 * 1000,    //离线时间
        data: template                          //设置推送消息类型
    });
    //接收方
    var target = new Target({
        appId: config.getui_push.appId,
        alias: alias
    });

    //target.setAppId(config.getui_push.appId).setClientId(clientId);
    target.setAppId(config.getui_push.appId).setAlias(alias);
    gt.pushMessageToSingle(message, target, function (err, res) {
        if (err != null && err.exception != null && err.exception instanceof RequestError) {
            var requestId = err.exception.requestId;

            //发送异常重传
            return gt.pushMessageToSingle(message, target, requestId, function (e, res) {
                callback && callback(e, res);
            });
        }
        callback && callback(err, res);
    });
}
function pushMessageToApp(gt, template, callback) {
    var message = new AppMessage({
        isOffline: true,
        offlineExpireTime: 3600 * 12 * 1000,
        data: template,
        appIdList: [config.getui_push.appId]
    });

    gt.pushMessageToApp(message, null, function (err, res) {
        callback && callback(err, res);
    });
}

function transmissionTemplate(APNS, content) {
    content.time = +new Date;
    var template = new TransmissionTemplate({
        appId: config.getui_push.appId,
        appKey: config.getui_push.appKey,
        transmissionType: 2,
        transmissionContent: JSON.stringify(content)
    });
    if (APNS) {
        //iOS推送需要设置的pushInfo字段
        var payload = new APNPayload();
        var alertMsg = new SimpleAlertMsg();
        alertMsg.alertMsg = content.msg;
        payload.alertMsg = alertMsg;
        payload.badge = 1;
        payload.contentAvailable = 1;
        payload.category = "ACTIONABLE";
        //payload.sound="test1.wav";
        payload.customMsg.payload = JSON.stringify(content);
        template.setApnInfo(payload);
    }
    return template;
}


exports.transmissionTemplate = transmissionTemplate;


exports.toSingleByUid = function (template, uid, callback) {
    var gt = new GeTui(HOST, config.getui_push.appKey, config.getui_push.masterSecret);
    gt.connect(function (e) {
        if (e) {
            return callback && callback(e);
        }
        pushMessageToSingle(gt, template, uid, function (err, res) {
            callback && callback(err, res);
        });
    });
};
exports.toApp = function (template, callback) {
    var gt = new GeTui(HOST, config.getui_push.appKey, config.getui_push.masterSecret);
    gt.connect(function (e) {
        if (e) {
            return callback && callback(e);
        }
        pushMessageToApp(gt, template, function (err, res) {
            callback && callback(err, res);
        });
    });
};
