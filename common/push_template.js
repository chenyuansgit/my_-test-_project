//简历进入待沟通
exports.toBeCommunicated = function () {
    return {
        APNS: false,
        transmissionContent: {
            msg: '简历状态更改为待沟通',
            code: 1001
        }
    };
};

//简历通知面试
exports.interview = function (company_name) {
    return {
        APNS: true,
        transmissionContent: {
            msg: company_name + '向您发送了面试邀请',
            code: 1001,
            uri: 'internbird://m.internbird.com/msg/jobCondition/list?status=3'
        }
    };
};
//即将面试提醒
exports.toBeInterview = function () {
    return {
        APNS: true,
        transmissionContent: {
            msg: '您有面试将在2小时之后开始,请提前准备',
            code: 1001,
            uri: 'internbird://m.internbird.com/msg/jobCondition/list?status=3'
        }
    };
};
//简历不合适
exports.improper = function () {
    return {
        APNS: false,
        transmissionContent: {
            msg: '简历状态更改为不合适',
            code: 1001
        }
    };
};
//新访问提醒
exports.newVisitor = function (company_name) {
    return {
        APNS: false,
        transmissionContent: {
            msg: company_name + '通过快招查看了您的简历',
            code: 1003
        }
    };
};
//快招邀请
exports.quickRecruitInvite = function (company_name) {
    return {
        APNS: true,
        transmissionContent: {
            msg: company_name + '向您发送了快招邀请',
            code: 1002,
            uri: 'internbird://m.internbird.com/msg/quickRecruitInvite/list?status=1'
        }
    };
};
//其他自定义推送通知(系统通知,活动通知,职位推荐等)
exports.notification = function (APNS, msg, code, uri) {
    var content = {
        APNS: APNS,
        transmissionContent: {
            msg: msg,
            code: code
        }
    };
    if (uri) {
        content.transmissionContent.uri = uri;
    }
    return content;
};
