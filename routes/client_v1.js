var express = require('express');
var router = express.Router();
var auth = require("../middlewares/client_v1_auth");
var job = require("../api/v1/job");
var job1_2 = require("../api/v1.2/job");
var det = require("../api/v1.2/det");
var det_report = require("../api/v1.2/det_report");
var resume_det_rel = require("../api/v1.2/resume_det_rel");
var company = require("../api/v1/company");
var ad = require("../api/v1/ad");
var open_screen = require("../api/v1.2/open_screen");
var job_subscription = require("../api/v1/job_subscription");
var account = require("../api/v1/account");
var user = require("../api/v1/user");
var resume = require("../api/v1/resume");
var city = require("../api/v1/city");
var resume_job_rel = require("../api/v1/resume_job_rel");
var feedback = require('../api/v1/feedback');
var validate = require('../api/v1/validate');
var favorite = require('../api/v1/favorite');
var fileUpload = require("../api/v1/file_upload");
var quickRecruitInvite = require("../api/v1/quick_recruit_invite");
var push = require("../api/v1/push");
var notification = require("../api/v1/notification");
var wechat_client_login = require("../api/v1.2/wechat/login");
var qq_client_login = require("../api/v1.2/qq/login");
var weibo_client_login = require("../api/v1.2/weibo/login");


router.use(auth.apiSign); //路由用户验证的中间件

router.post("/login", account.login);//登陆api
router.post("/register", account.register);//注册api
router.post("/quitLogin", auth.login, account.quitLogin);//退出登录api
router.get('/user/getInfo', auth.login, user.getUserInfo);//获取用户基本资料
router.post('/user/updateBase', auth.login, user.updateBase);//修改用户基本资料
router.post('/user/updatePhone', auth.login, user.updatePhone);//修改手机号码
router.post('/account/updatePass', auth.login, account.updatePass);//修改账户密码
router.post('/sendFindPwdCode', validate.sendFindPwdCode);//发送找回密码验证码
router.post('/validateFindPwdCode', validate.validateFindPwdCode);//验证找回密码验证码
router.post('/pwd/reset', account.findPwd);//找回密码

//职位信息
router.get('/job/status/:jid', job.getStatus);//获取单个对应职位的投递收藏状态
router.post('/sub/setting', auth.login, job_subscription.createOrUpdate);//修改订阅信息
router.get('/sub/getInfo', auth.login, job_subscription.getInfo);//获取订阅信息


//包打听
router.get("/det/status/:det_id", det.getStatus);//详情页
router.post("/private/resume/detDelivery", auth.login, auth.userResumeAuth, resume_det_rel.resumeDelivery);//简历投递
router.post('/det/report/:det_id', auth.login, det_report.add);//举报
router.get("/private/getDetConditionList", auth.login, auth.userResumeAuth, resume_det_rel.list);//包打听投递列表


//公司信息
router.get('/company/status/:cid', company.getStatus);//获取单个对应职位的投递收藏状态
router.get('/c/search', company.search);


//收藏
router.get('/favorite/list', auth.login, favorite.list);//收藏列表
router.post('/favorite/add', auth.login, favorite.add);//收藏
router.post('/favorite/cancel', auth.login, favorite.cancel);//取消收藏
router.post('/favorite/empty', auth.login, favorite.empty);//清空收藏

//快招
router.get('/quickRecruitInvite/getListByUser', auth.login, quickRecruitInvite.getListByUser);//学生获取快招记录信息
router.post('/quickRecruit/response', auth.login, quickRecruitInvite.quickRecruitResponse); // 普通用户响应快招邀请
router.get('/quickRecruit/getStatsInfo', auth.login, quickRecruitInvite.getStatsInfo);//学生获取快招记录信息

//实习生个人简历

router.get("/private/resume", auth.login, auth.userResumeAuth, user.getResumesList);//我的所有简历信息
router.get("/private/resume/detail/:rid", auth.login, auth.userResumeAuth, user.getResumeInfo);//获取我的单个简历信息
router.post("/private/resume/update/:rid", auth.login, auth.userResumeAuth, resume.update);//简历修改
router.post("/private/resume/add", auth.login, auth.userResumeAuth, resume.add);//简历添加
router.post("/private/resume/delivery", auth.login, auth.userResumeAuth, resume_job_rel.resumeDelivery);//简历投递

//求职管理
router.get("/private/getConditionList", auth.login, auth.userResumeAuth, user.getJobConditionList);//我的求职信息
router.get('/private/getDeliveryDetail', auth.login, resume_job_rel.getDetail);//获取单个求职详情


//推送
router.get('/notification/list', notification.list);//获取系统通知列表

//第三方登录-微信
router.post('/oauth/wechat/login', wechat_client_login.login);//登录
router.post('/oauth/wechat/bind', wechat_client_login.bind);//绑定

//第三方登录-qq
router.post('/oauth/qq/login', qq_client_login.login);//登录
router.post('/oauth/qq/bind', qq_client_login.bind);//绑定

//第三方登录-微博
router.post('/oauth/weibo/login', weibo_client_login.login);//登录
router.post('/oauth/weibo/bind', weibo_client_login.bind);//绑定


//公开的api
router.post('/sendCode', validate.sendPhoneCode);//发送验证码
router.post('/sendEmail', auth.login, validate.sendAccountValidateEmail);//发送帐户验证邮件
router.get("/j/search", job.jobSearch);//搜索job,solr搜索
router.get("/b2/j/search", job1_2.jobSearch);//搜索job,solr搜索(新版)
router.get("/j/search/suggest", job.searchSuggest);//搜索关键词建议
router.get("/j/list", job.allList);//按条件检索所有职位列表,mysql搜索
router.post('/feedback', feedback.post);//反馈信息
router.get('/upload/upToken', auth.login, fileUpload.upToken); //获取上传图片凭证upToken
router.get('/openScreen', open_screen.getDetail);
router.get('/ad/list', ad.getAdList);//获取首页轮播图广告
router.get('/getCity', city.getCity);//获取全部省市
router.get('/getCharCity', city.getCharCity);//按字母获取部分城市
router.get('/getJobType', job.getJobType);//获取职位类型
router.get('/getHotWords', job.getHotWords);//获取搜索热词
router.get('/getCompanyType', company.getCompanyType);//获取公司行业类型

module.exports = router;