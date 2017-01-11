var express = require('express');
var router = express.Router();
var auth = require("../middlewares/auth");
var locals = require("../middlewares/locals");
var display_name = require("../middlewares/display_name");
var index = require("../controllers/user_web/index");
var doc = require("../controllers/user_web/doc");
var pdf = require("../controllers/user_web/pdf");
var job = require("../controllers/user_web/job");
var det = require("../controllers/user_web/det");
var det_report = require("../controllers/user_web/det_report");
var resume_det_rel = require("../controllers/user_web/resume_det_rel");
var company = require("../controllers/user_web/company");
var nest = require("../controllers/user_web/article");
var activity = require("../controllers/user_web/activity");
var user = require("../controllers/user_web/user");
var resume = require("../controllers/user_web/resume");
var resume_job_rel = require("../controllers/user_web/resume_job_rel");
var feedback = require('../controllers/user_web/feedback');
var userResumeAuth = require('../middlewares/resume').userResumeAuth;
var downloadResumeCheck = require('../middlewares/resume').downloadCheck;
var companyCheckOwner = require('../middlewares/company').checkSingleCompanyOwner;
var fileUpload = require("../controllers/user_web/file_upload");
var quickRecruit = require("../controllers/user_web/quick_recruit");
var quickRecruitInvite = require("../controllers/user_web/quick_recruit_invite");
var summer = require("../controllers/user_web/summer");
var favorite = require("../controllers/user_web/favorite");
var job_subscription = require("../controllers/user_web/job_subscription");


/*自定义环境变量设置*/
router.use(locals);

/*用户信息验证*/
router.use(auth.account);
router.use(display_name);
/*主页渲染*/
router.get('/', index.home);

/*用户个人信息*/
router.get('/userCenter', auth.loginRedirect,user.updateBasePage); //个人信息页面
router.post('/api/user/updateBase', auth.login, user.updateBase);//修改个人信息

/*app下载*/
router.get('/applications', index.app_download_page); //app应用介绍页面
router.get('/app/download', index.app_download); //app下载

/*简历相关*/
router.get("/myResume", auth.loginRedirect, userResumeAuth, user.myResume);//我的简历页面渲染
router.get("/resumeCreate", auth.loginRedirect, resume.createPage);//简历创建页面
router.get("/resume/detail/:rid", auth.loginRedirect, userResumeAuth, resume.detailPage);//我的单个简历预览
router.post('/api/resume/add', auth.login, userResumeAuth, resume.add);//添加一份简历
router.post('/api/resume/update/:rid', auth.login, userResumeAuth, resume.update);//修改一份简历
router.get('/api/resume/download_doc/:rid', downloadResumeCheck, doc.resume_doc_download);//简历下载(用户下载也在此),后面会加上权限设置
router.get('/api/resume/download_pdf/:rid', downloadResumeCheck, pdf.resume_pdf_download);//简历下载(用户下载也在此),后面会加上权限设置
router.get('/resume/for_pdf_download/:rid', pdf.resume_display_for_pdf);//简历下载详情（供pdf下载使用）

/*求职相关*/
router.post('/api/job/delivery', auth.login, userResumeAuth, resume_job_rel.delivery);//普通职位投递简历
router.post('/api/det/delivery', auth.login, userResumeAuth, resume_det_rel.delivery);//包打听职位投递简历
router.get('/api/job/getDeliveryDetail', auth.login, resume_job_rel.detail);//获取单个求职详情
router.get("/jobCondition", auth.loginRedirect, user.jobConditionListPage);//我的求职动态页面
router.get("/detCondition", auth.loginRedirect, resume_det_rel.listPage);//包打听投递列表

/*快招相关*/
router.get('/quickRecruit', quickRecruit.indexPage); //快招主页
router.get('/quickRecruit/manage', auth.loginRedirect, quickRecruit.managePage); // 快招管理
router.get('/quickRecruit/detail/:id', quickRecruit.detailPage);//普通用户快招精选详情页面
router.get("/api/quickRecruit/getInviteList", auth.login, quickRecruitInvite.list);// 普通用户快招邀请列表
router.post('/api/quickRecruit/response', auth.login, quickRecruitInvite.response); // 普通用户响应快招邀请
router.post('/api/quickRecruit/apply', auth.login, quickRecruit.apply); // 普通用户申请快招
router.get('/quickRecruit/process', quickRecruit.process);//快招攻略

/*职位相关*/
router.get("/job/detail/:jid", job.detailPage);//职位详情页
router.get("/j/search", job.search);//职位搜索
router.get("/j/search/suggest", job.searchSuggest); // 职位搜索建议

/*公司相关*/
router.get("/company/detail/:cid", companyCheckOwner, company.detailPage);//职位详情页
router.get("/c/search", company.search);//职位搜索

/*包打听相关*/
router.get("/det/detail/:det_id", det.detailPage);//详情页
router.post('/api/det/report/:det_id', auth.login, det_report.add);//举报

/*用户职位订阅*/
router.get('/sub/setting', auth.loginRedirect, job_subscription.settingPage);//职位信息订阅设置
router.post('/api/sub/setting', auth.login, job_subscription.createOrUpdate);//修改订阅信息
router.get('/sub/list', job_subscription.listPage);//订阅的职位列表

/*用户收藏(暂时支持职位,公司,包打听的收藏)*/
router.get('/favorite/list', auth.loginRedirect, favorite.listPage);//收藏列表
router.post('/api/favorite/add', auth.login, favorite.add);//收藏
router.post('/api/favorite/cancel', auth.login, favorite.cancel);//取消收藏

/*鸟巢*/
router.get("/nest", nest.listPage);//列表页渲染
router.get("/nest/detail/:id", nest.detailPage);//详情页渲染

/*活动*/
router.get("/activity", activity.listPage);//列表页渲染
router.get("/activity/detail/:id", activity.detailPage);//详情页渲染

/*公开的api*/
router.post('/api/feedback', feedback.add);//反馈信息
router.get('/api/upload/upToken', fileUpload.upToken); // 获取上传凭证upToken
router.post('/api/upload/callback', fileUpload.callback); // 七牛上传成功后回调地址，该接口返回的结果将直接被七牛原样返回给客户端


module.exports = router;