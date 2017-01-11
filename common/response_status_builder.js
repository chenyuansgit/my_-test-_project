var RESP_STATUS_CODE = {
    // 正常返回
    STATUS_CODE_10000: {desc: "ok", status: 10000},
    // 对象已存在无法继续操作
    STATUS_CODE_10001: {desc: "object exists", status: 10001},
    // 客户端参数错误
    STATUS_CODE_10002: {desc: "params error", status: 10002},
    // 数据库异常
    STATUS_CODE_10003: {desc: "database error", status: 10003},
    // 未登录
    STATUS_CODE_10004: {desc: "not login", status: 10004},
    // 服务器异常
    STATUS_CODE_10005: {desc: "server error", status: 10005},
    // 请求对象未找到或不存在
    STATUS_CODE_10006: {desc: "object not found", status: 10006},
    // 没有权限
    STATUS_CODE_10007: {desc: "access forbidden", status: 10007},
    // hr加入公司失败
    STATUS_CODE_10008: {desc: "join failed", status: 10008},
    // 公司信息已经设置
    STATUS_CODE_10009: {desc: "company information has been set", status: 10009},
    //验证码 或邀请 或者xxxx过期
    STATUS_CODE_10011: {desc: "code may be expired", status: 10011},
    // 验证码错误
    STATUS_CODE_10012: {desc: "code may be not correct", status: 10012},
    // 操作次数达到上限（投递简历，发布职位等）
    STATUS_CODE_10013: {desc: "hit limit", status: 10013},
    // 邮箱不存在，不是真实邮箱
    STATUS_CODE_10015: {desc: "email address not exists", status: 10015},
    // ouath错误
    STATUS_CODE_10014: {desc: "oauth error", status: 10014},


    //客户端授权错误
    //1.app_timestamp错误
    STATUS_CODE_10020: {desc: "app timestamp error", status: 10020},
    //2.app_key错误
    STATUS_CODE_10021: {desc: "app key error", status: 10021},
    //3.app_sign错误
    STATUS_CODE_10022: {desc: "app sign error", status: 10022},
    //4.uid错误
    STATUS_CODE_10023: {desc: "uid error", status: 10023},
    //5.auth_token错误
    STATUS_CODE_10024: {desc: "auth token error", status: 10024},
    //6.auth_token过期
    STATUS_CODE_10025: {desc: "auth token expired", status: 10025}
};


exports.build = function (status, desc, data) {

    return data && typeof data === 'object' ? {
        status: status,
        desc: desc || RESP_STATUS_CODE["STATUS_CODE_" + status].desc,
        data: data
    } : {
        status: status,
        desc: desc || RESP_STATUS_CODE["STATUS_CODE_" + status].desc
    };
};