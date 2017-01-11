module.exports = function(userAgent){
    return {
        isMobile:userAgent.toLowerCase().match(/android|webos|iphone|ipad|ipod|blackberry|windows phone/i),
        isAndroid:userAgent.toLowerCase().match(/android/i),
        isIOS:userAgent.toLowerCase().match(/iphone|ipad|ipod/i),
        isWeixin:userAgent.toLowerCase().match(/micromessenger/i),
        isAppInner:userAgent.toLowerCase().match(/internbird/i),
        isWeb:!userAgent.toLowerCase().match(/android|webos|iphone|ipad|ipod|blackberry|windows phone/i)
    };
};
