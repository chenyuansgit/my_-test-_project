var express = require('express');
var router = express.Router();
var auth = require("../middlewares/auth");
var locals = require("../middlewares/locals");
var company = require("../controllers/company_mobile/company");
var resume_job_rel = require("../controllers/company_mobile/resume_job_rel");
var employerCenter = require("../controllers/company_mobile/employerCenter");
var employerCheckResume = require('../middlewares/resume').employerCheckResume;
var companyJobAuth = require('../middlewares/job').checkJobsEmployerPublisher;
var job = require("../controllers/company_mobile/job");
var message = require("../controllers/company_mobile/message");
var quick_reruit = require("../controllers/company_mobile/quick_reruit");
var quick_recruit_user_support = require("../controllers/company_mobile/quick_recruit_user_support");
var qucik_recruit_invite = require("../controllers/company_mobile/qucik_recruit_invite");
var resume = require("../controllers/company_mobile/resume");
var fileUpload = require("../controllers/company_mobile/file_upload");


/*自定义环境变量设置*/
router.use(locals);

/*用户信息验证*/
router.use(auth.account);


/*快招部分*/
router.get("/", quick_reruit.homeListPage);//快招首页(主页)
router.get('/api/talentPool/list', auth.login, auth.employerApi, resume.talentPoolList); // hr查看人才库列表
router.post('/api/quick_recruit/invite', auth.login, auth.employerApi, qucik_recruit_invite.send);// 人才库,快招精选发送快招邀请
router.get('/qrManage', auth.loginRedirect, auth.employerRender, qucik_recruit_invite.listPage);//快招邀请记录页面
router.get('/api/quick_recruit_invite/getListByEmployer', auth.login, auth.employerApi, qucik_recruit_invite.list); //hr获取发出邀约记录列表
router.get('/talentPool/detail/:uid', auth.loginRedirect, auth.employerRender, quick_reruit.talentPoolDetail);//人才库详情页面
router.get('/quickRecruit/detail/:id', quick_reruit.specialDetail);//快招精选详情页面
router.post('/api/talentPool/support', auth.login, quick_recruit_user_support.support);//人才库点赞
router.post('/api/talentPool/supportCancel', auth.login, quick_recruit_user_support.cancel);//人才库取消赞

/*公司验证*/
router.get("/company/validate", auth.loginRedirect, auth.checkEmployerValidate, company.validate);//公司主页设置


/*消息页*/
router.get('/message', message.index);//消息主页

/*简历管理*/
router.get('/resumeManage', auth.loginRedirect, auth.employerRender, resume.conditionListPage);//简历管理列表页面
router.get('/api/resume/getList', auth.login, auth.employerApi, resume.manageList);//简历管理列表
router.get("/resume/detail/:rid", auth.loginRedirect, auth.employerRender, employerCheckResume, resume.deliveryResumePreview);//简历预览
router.post('/api/c_resume/updateStatus', auth.login, auth.employerApi, companyJobAuth, resume_job_rel.companyUpdateResumeStatus);//企业用户更新简历状态
router.post('/api/c_resume/transmit', auth.login, auth.employerApi, companyJobAuth, resume_job_rel.resumeTransmitted);//转发简历


/*我的*/
router.get('/mine', employerCenter.index);//我的页面
router.post('/api/employer/updateBase', auth.employerApi, employerCenter.updateBase);//修改hr个人资料,仅支持avatar和nick_name修改
router.get('/mine/jobList', auth.loginRedirect, auth.employerRender, job.allListPage);//我发布的所有有效职位
router.get('/job/detail/:jid', auth.loginRedirect, auth.employerRender, job.singleJobRender);//职位预览
router.get('/mine/company', auth.loginRedirect, auth.employerRender, company.homePage);//我的公司主页
router.get("/api/jobs/mine", auth.login, auth.employerApi, job.myAllList); //hr获取自己发布的所有职位

router.get('/api/upload/upToken', fileUpload.upToken); // 获取上传图片凭证upToken

module.exports = router;