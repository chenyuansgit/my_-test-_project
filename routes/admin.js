var express = require('express');
var router = express.Router();
var authAdmin = require("../middlewares/admin");
var index = require('../controllers/admin/index');
var sign = require('../controllers/admin/sign');
var recruit = require('../controllers/admin/recruit');
var ad = require('../controllers/admin/ad');
var open_screen = require('../controllers/admin/open_screen');
var employer = require('../controllers/admin/employer');
var article = require('../controllers/admin/article');
var activity = require('../controllers/admin/activity');
var feedback = require('../controllers/admin/feedback');
var company = require('../controllers/admin/company');
var job = require('../controllers/admin/job');
var quickRecruit = require('../controllers/admin/quick_recruit');
var fileUpload = require('../controllers/admin/file_upload');
var resume = require('../controllers/admin/resume');
var quickRecruitApply = require('../controllers/admin/quick_recruit_apply');
var quickRecruitTerm = require('../controllers/admin/quick_recruit_term');
var quickRecruitInvite = require('../controllers/admin/quick_recruit_invite');
var summer = require('../controllers/admin/summer');
var notification = require('../controllers/admin/client_notification');
var push = require('../controllers/admin/push');
var det = require('../controllers/admin/det');
var det_report = require('../controllers/admin/det_report');


router.post('/api/upload/callback', fileUpload.callback); // 七牛上传成功后回调地址，该接口返回的结果将直接被七牛原样返回给客户端


router.use(authAdmin.account); //路由用户验证的中间件

router.post("/api/login", sign.login);//登陆api
router.post("/api/logout", sign.logout);//登陆api
router.get("/login", sign.loginPage);//登陆页面渲染
router.use(authAdmin.admin); //路由用户验证的中间件

/*********** 权限检验 **************/
router.use('/home*', authAdmin.permissionCheck('data'));
router.use('/company/*', authAdmin.permissionCheck('company'));
router.use('/ad/*', authAdmin.permissionCheck('ad'));
router.use('/open_screen/*', authAdmin.permissionCheck('ad'));
router.use('/job/*', authAdmin.permissionCheck('job'));
router.use('/employer/*', authAdmin.permissionCheck('employer'));
router.use('/activity/*', authAdmin.permissionCheck('activity'));
router.use('/feedback/*', authAdmin.permissionCheck('other'));
router.use('/summer/*', authAdmin.permissionCheck('other'));
router.use('/push/*', authAdmin.permissionCheck('message'));
router.use('/push/notification/push/*', authAdmin.permissionCheck('admin'));
router.use('/article/*', authAdmin.permissionCheck('article'));
router.use('/resume/*', authAdmin.permissionCheck('student'));
router.use('/quick_recruit*', authAdmin.permissionCheck('quick_recruit'));
router.use('/det/*', authAdmin.permissionCheck('det'));


router.get('/home', index.home); //主页渲染

/*********** 公司管理 **************/
router.get('/company/list', company.list); //公司列表
router.get('/company/search', company.search); //公司搜索
router.post('/company/del/:cid', company.del); //公司屏蔽
router.post('/company/recover/:cid', company.recover); //公司屏蔽
router.post('/company/delWithJobs/:cid', company.delWithJobs); //屏蔽公司及职位
router.post('/company/edit/:cid', company.updateInfo); //更新公司信息
router.get('/company/edit/:cid', company.updateInfoPage); //更新公司信息页面

/*********** 职位管理 **************/
router.get('/job/list', job.list);
router.post('/job/del/:jid', job.del);
router.post('/job/recover/:jid', job.recover);
router.post('/job/offline/:jid', job.offline);
router.post('/job/online/:jid', job.online);
router.post('/job/recommend/:jid', job.recommend);
router.post('/job/recommend_cancel/:jid', job.recommend_cancel);
router.post('/job/refresh/:jid', job.refresh);

/* 广告管理*/
router.get('/ad/list', ad.list);
router.get('/ad/add', ad.addPage);  // 广告添加页面渲染
router.post('/ad/add', ad.add);
router.get('/ad/edit/:id', ad.editPage);  // 广告编辑页面渲染
router.post('/ad/edit/:id', ad.edit); // 广告编辑
router.post('/ad/del/:id', ad.del);
router.post('/ad/online/:id', ad.online);
router.post('/ad/offline/:id', ad.offline);

/*开屏广告*/
router.get("/open_screen/list", open_screen.list);
router.get("/open_screen/curr", open_screen.currPage);
router.post("/open_screen/add", open_screen.add);
router.get("/open_screen/add", open_screen.addPage);
router.post("/open_screen/edit/:id", open_screen.edit);
router.get("/open_screen/edit/:id", open_screen.editPage);
router.post("/open_screen/offline", open_screen.offline);//取消开屏,恢复默认
router.post("/open_screen/online", open_screen.online);//取消开屏,恢复默认


/* hr管理 */
router.get('/employer/list', employer.list);

/* 企业邮箱开通 */
router.get('/employer/unvalidatedList', employer.unvalidatedList);
router.post('/employer/validated/:uid', employer.validated);


/* 文章管理 */
router.get('/article/list', article.list);
router.get('/article/edit/:id', article.editPage); //文章编辑页面渲染
router.post('/article/edit/:id', article.edit);
router.get('/article/add', article.addPage);   //文字管理 页面渲染
router.post('/article/add', article.add);
router.post('/article/del/:id', article.del);
router.post('/article/publish/:id', article.publish);
router.post('/article/offline/:id', article.offline);
router.get("/article/detail/:id", article.detailPage);//详情页渲染
router.get('/article/preview', article.previewPage);//文章发布前预览


/* 活动管理 */
router.get('/activity/list', activity.list);
router.get('/activity/edit/:id', activity.editPage); //文章编辑页面渲染
router.post('/activity/edit/:id', activity.edit);
router.get('/activity/add', activity.addPage);   //文字管理 页面渲染
router.post('/activity/add', activity.add);
router.post('/activity/del/:id', activity.del);
router.post('/activity/publish/:id', activity.publish);
router.post('/activity/offline/:id', activity.offline);
router.get("/activity/detail/:id", activity.detailPage);//详情页渲染
router.get('/activity/preview', activity.previewPage);//文章发布前预览


/* 快招管理 */
router.get('/quick_recruit/list', quickRecruit.list);
router.get('/quick_recruit/edit/:id', quickRecruit.editPage); //文章编辑页面渲染
router.post('/quick_recruit/edit/:id', quickRecruit.edit);
router.get('/quick_recruit/add', quickRecruit.addPage);   //文字管理 页面渲染
router.post('/quick_recruit/add', quickRecruit.add);
router.post('/quick_recruit/del/:id', quickRecruit.del);
router.post('/quick_recruit/online/:id', quickRecruit.online);
router.post('/quick_recruit/offline/:id', quickRecruit.offline);

/* 快招邀请管理 */
router.get('/quick_recruit_invite/list', quickRecruitInvite.getListByUid);


/* 快招申请管理 */
router.get('/quick_recruit_apply/list', quickRecruitApply.list);
router.post('/quick_recruit_apply/agree/:id', quickRecruitApply.agree);
router.post('/quick_recruit_apply/refused/:id', quickRecruitApply.refused);

/* 快招档期管理 */
router.get('/quick_recruit_term/list', quickRecruitTerm.list);
router.get('/quick_recruit_term/edit/:term_id', quickRecruitTerm.editPage); //文章编辑页面渲染
router.post('/quick_recruit_term/edit/:term_id', quickRecruitTerm.edit);
router.get('/quick_recruit_term/add', quickRecruitTerm.addPage);   //文字管理 页面渲染
router.post('/quick_recruit_term/add', quickRecruitTerm.add);
router.post('/quick_recruit_term/online/:term_id', quickRecruitTerm.online);
router.post('/quick_recruit_term/offline/:term_id', quickRecruitTerm.offline);

/* 简历管理 */
router.get('/resume/search', resume.search);
router.get('/resume/detail/:rid', resume.detail);
router.get('/resume/list', resume.listPage);
router.post('/resume/operate/:rid', resume.operate);
router.post('/resume/shield/:rid', resume.shield);
router.post('/resume/unshield/:rid', resume.unshield);
router.get('/resume/delivery/list', resume.deliveryList);//单个简历的投递列表

/* 包打听 */
router.get('/det/list', det.list);
router.get('/det/search', det.search); //包打听搜索
router.get('/det/edit/:det_id', det.editPage);
router.post('/det/edit/:det_id', det.edit);
router.get('/det/add', det.addPage);
router.post('/det/checkEmail', det.checkEmail);
router.post('/det/add', det.add);
router.post('/det/del/:det_id', det.del);

router.post('/det/online/:det_id', det.online);//上线
router.post('/det/offline/:det_id', det.offline);//下线(恢复也使用此接口)
router.post('/det/del/:det_id', det.del);//删除
router.post('/det/refresh/:det_id', det.refresh);//刷新


/* 包打听举报管理 */
router.get('/det/report/list', det_report.list);
router.get('/det/companySearch', det.companySearch); //公司搜索
router.post('/det/report/success/:id', det_report.success);
router.post('/det/report/failed/:id', det_report.failed);


/* 反馈信息 */
router.get('/feedback/list', feedback.list);//反馈列表页面

/* 公司暑期实习 */
router.post('/summer/company/isJoiner/:cid', summer.isCompanyJoiner);//返回公司是否是暑期实习
router.post('/summer/company/join/:cid', summer.companyJoin);//公司加入暑期实习
router.post('/summer/company/quit/:cid', summer.companyQuit);//公司退出暑期实习

/* 客户端推送 */
router.get('/push/notification/add', notification.addPage);//添加页面
router.post('/push/notification/add', notification.add);//添加api
router.get('/push/notification/edit/:id', notification.editPage);//添加页面
router.post('/push/notification/edit/:id', notification.edit);//添加api
router.get('/push/notification/list', notification.list);//列表页面
router.post('/push/notification/push/:id', notification.push);//消息推送

router.get('/push/test', push.testPage);//推送测试页面
router.post('/push/test', push.test);//推送测试

/* 第三方图片上传 */
router.get("/imgUpload",fileUpload.imgUploadPage);
router.post('/api/upload/img', fileUpload.imgUpload); // 上传第三方图片

router.get('/api/upload/upToken', fileUpload.upToken); // 获取上传凭证upToken

module.exports = router;