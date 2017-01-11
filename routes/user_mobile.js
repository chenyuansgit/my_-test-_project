var express = require('express');
var router = express.Router();
var auth = require("../middlewares/auth");
var locals = require("../middlewares/locals");
var job = require("../controllers/user_mobile/job");
var det = require("../controllers/user_mobile/det");
var det_report = require("../controllers/user_mobile/det_report");
var resume_det_rel = require("../controllers/user_mobile/resume_det_rel");
var job_subscription = require("../controllers/user_mobile/job_subscription");
var company = require("../controllers/user_mobile/company");
var nest = require("../controllers/user_mobile/article");
var activity = require("../controllers/user_mobile/activity");
var user = require("../controllers/user_mobile/user");
var resume = require("../controllers/user_mobile/resume");
var resume_job_rel = require("../controllers/user_mobile/resume_job_rel");
var feedback = require('../controllers/user_mobile/feedback');
var userResumeAuth = require('../middlewares/resume').userResumeAuth;
var fileUpload = require("../controllers/user_mobile/file_upload");
var quickRecruit = require("../controllers/user_mobile/quick_recruit");
var quickRecruitInvite = require("../controllers/user_mobile/quick_recruit_invite");

/*自定义环境变量设置*/
router.use(locals);

/*用户信息验证*/
router.use(auth.account);

router.get('/', job.indexPage);//主页
router.get('/campus', job.campusPage);//主页
//router.get('/sub',job_subscription.listPage);

router.get('/userCenter', user.centerPage); //用户中心
router.post('/api/user/updateBase', auth.login, auth.user, user.updateBase);//修改个人信息


//包打听
router.get("/det/detail/:det_id", det.detailPage);//详情页
router.post('/api/det/resumeDelivery', auth.login, userResumeAuth, resume_det_rel.resumeDelivery);//投递简历
router.post('/api/det/report/:det_id', auth.login, det_report.add);//举报
router.get("/private/det", auth.loginRedirect, resume_det_rel.listPage);//包打听投递列表页面
router.get("/api/det/getConditionList", auth.login, userResumeAuth, resume_det_rel.list);//包打听投递列表信息

//职位列表
//router.get('/', job.recommendList);//推荐列表页面
router.get('/job/search', job.searchPage);//搜索列表页面


//职位订阅
router.get('/sub/setting', auth.loginRedirect, job_subscription.subscriptionPage);//职位信息订阅设置
router.post('/api/sub/setting', auth.login, job_subscription.createOrUpdate);//修改订阅信息
router.get('/sub/list', job_subscription.listPage);

//快招
router.get('/quickRecruit', quickRecruit.quickRecruitPage);
router.get('/quickRecruit/list', quickRecruit.getQuickRecruitList);
router.get('/quickRecruit/detail/:id', quickRecruit.quickRecruitDetailPage);

router.get('/private/quickRecruit', auth.loginRedirect, quickRecruit.userQrPage);//学生的快招记录页面
router.get('/api/quick_recruit_invite/getListByUser', auth.login, quickRecruitInvite.getListByUser);//学生获取快招记录信息
router.post('/api/quick_recruit/response', auth.login, quickRecruitInvite.quickRecruitResponse); // 普通用户响应快招邀请

//实习生个人求职信息
router.get("/private/resumeCreate", auth.loginRedirect, user.resumeCreatePage);//简历创建页面渲染
router.get("/private/resume", auth.loginRedirect, userResumeAuth, user.resumePage);//我的简历页面渲染
router.get("/private/resume_detail/:rid", auth.loginRedirect, userResumeAuth, resume.privateResumePreview);//我的单个简历预览
router.get("/private/job", auth.loginRedirect, userResumeAuth, user.jobConditionPage);//我的求职页渲染
router.get("/private/resumeCondition/:jid", auth.loginRedirect, userResumeAuth, user.resumeConditionPage);//职位投递记录渲染
router.get("/api/u_job/getConditionList", auth.login, userResumeAuth, user.getJobConditionList);//我的求职信息
router.get('/api/u_job/getDeliveryDetail', auth.login, resume_job_rel.getDetail);//获取单个求职详情

//鸟巢
router.get("/nest", nest.listPage);//列表页渲染
router.get('/nest/getListByTime', nest.list);//获取列表数据
router.get("/nest/detail/:id", nest.detailPage);//详情页渲染

//活动
router.get("/activity", activity.listPage);//列表页渲染
router.get('/activity/getListByTime', activity.list);//获取列表数据
router.get("/activity/detail/:id", activity.detailPage);//详情页渲染


//权限api


//实习生个人简历管理
router.post('/api/u_resume/add', auth.login, auth.user, userResumeAuth, resume.resumeAdd);//添加一份简历
router.post('/api/u_resume/update/:rid', auth.login, auth.user, userResumeAuth, resume.resumeUpdate);//修改一份简历
router.post('/api/u_resume/resumeDelivery', auth.login, auth.user, userResumeAuth, resume_job_rel.resumeDelivery);//投递简历

//普通用户帐户管理


//公开的api
router.get("/job/detail/:jid", job.singleJobRender);//职位详情页渲染
router.get("/company/detail/:cid", company.companyPage);//公司详情页面
router.get("/j/search", job.jobSearch);//搜索job,solr搜索
router.post('/api/feedback', feedback.post);//反馈信息
router.get('/api/upload/upToken', fileUpload.upToken); // 获取上传图片凭证upToken

router.get("/bw/jobList", job.heiBaiCampusSearch);//黑白校园职位获取
router.get("/bw/city.json", job.allCity);//黑白校园职位获取

module.exports = router;