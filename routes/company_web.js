var express = require('express');
var router = express.Router();
var auth = require("../middlewares/auth");
var locals = require("../middlewares/locals");
var display_name = require("../middlewares/display_name");
var index = require("../controllers/company_web/index");
var doc = require("../controllers/company_web/doc");
var pdf = require("../controllers/company_web/pdf");
var job = require("../controllers/company_web/job");
var company = require("../controllers/company_web/company");
var resume = require("../controllers/company_web/resume");
var resume_job_rel = require("../controllers/company_web/resume_job_rel");
var employer = require('../controllers/company_web/employer');
var validate = require('../controllers/company_web/validate');
var companyJobAuth = require('../middlewares/job').checkJobsEmployerPublisher;
var employerCheckResume = require('../middlewares/resume').employerCheckResume;
var downloadResumeCheck = require('../middlewares/resume').downloadCheck;
var fileUpload = require("../controllers/company_web/file_upload");
var quickRecruit = require("../controllers/company_web/quick_recruit");
var quickRecruitInvite = require("../controllers/company_web/quick_recruit_invite");
var quickRecruitSupport = require("../controllers/company_web/quick_recruit_user_support");


/*自定义环境变量设置*/
router.use(locals);
/*用户信息验证*/
router.use(auth.account);
router.use(display_name);

router.get('/', index.home);//主页重定向
/*公司相关*/
router.get("/myCompany", auth.loginRedirect, auth.employerRender, company.mine);//公司主页
router.get("/company/validate", auth.loginRedirect, auth.checkEmployerValidate, company.validate);//公司验证
router.post('/api/c/update', auth.login, auth.employerApi, company.updateInfo);//修改企业信息
router.post('/api/c/sendValidateEmail', auth.login, validate.companyValidateStep);//公司企业邮箱验证发送
router.get('/api/c/mailValidate', company.validateEmail);//验证企业邮箱
router.post('/api/c/join', auth.login, auth.checkEmployerValidate, company.join);//加入公司
router.post('/api/c/create', auth.login, auth.checkEmployerValidate, company.create);//创建新公司
router.post('/api/c/joinCreate', auth.login, auth.checkEmployerValidate, company.joinCreate);//创建同企业邮箱后缀名的公司


/*职位相关*/
router.get("/job/detail/:jid", job.detailPage);//职位修改页面
router.get("/job/list", auth.loginRedirect, auth.employerRender, company.companyPositionPage);//职位列表页面
router.get("/job/add", auth.loginRedirect, auth.employerRender, company.postPositionPage);//职位添加页面
router.get("/job/edit/:jid", auth.loginRedirect, auth.employerRender, companyJobAuth, company.editPositionPage);//职位修改页面
router.get("/api/jobs/mine", auth.login, auth.employerApi, job.getListByEmployer); //hr获取自己发布的所有职位
router.post("/api/jobs/add", auth.login, auth.employerApi, job.add);//添加单条job信息
router.get("/job/preview", job.previewPage);//添加单条job信息
router.post("/api/jobs/update/:jid", auth.login, auth.employerApi, job.update);//修改某个job信息
router.post("/api/jobs/delete/:jid", auth.login, auth.employerApi, job.delete); //删除单条job信息
router.post("/api/jobs/refresh/:jid", auth.login, auth.employerApi, job.refresh);//刷新单个job的列表时间,相当于置顶,后面会加上权限控制
router.post("/api/jobs/offline/:jid", auth.login, auth.employerApi, job.offline);// 下线某个job信息
router.post("/api/jobs/online/:jid", auth.login, auth.employerApi, job.online);// 上线某个job信息


/*快招相关*/
router.get('/quickRecruit', auth.loginRedirect, auth.employerRender, quickRecruit.indexPage); // hr快招主页
router.get('/quickRecruit/manage', auth.loginRedirect, auth.employerRender, quickRecruit.managePage); // hr快招管理页面
router.get('/quickRecruit/detail/:id', quickRecruit.detailPage);//hr查看快招精选详情
router.get('/quickRecruit/process', quickRecruit.process);//快招攻略
router.get('/api/quickRecruit/inviteList', auth.login, auth.employerApi, quickRecruitInvite.list); // hr获取发出邀约记录列表
router.post('/api/quickRecruit/sendInvite', auth.login, auth.employerApi, quickRecruitInvite.sendInvite);// hr发送快招邀请

/*人才库相关*/
router.get('/talentPool/detail/:uid', auth.loginRedirect, auth.employerRender, quickRecruit.talentResumePage); // hr查看人才库详情
router.get('/talentPool/list', auth.loginRedirect, auth.employerRender, quickRecruit.talentResumesListPage); // hr查看人才库列表页面
router.post('/api/talentPool/support', auth.login, quickRecruitSupport.support);//点赞
router.post('/api/talentPool/supportCancel', auth.login, quickRecruitSupport.cancel);//取消赞

/*简历管理*/
router.get("/resume/list", auth.loginRedirect, auth.employerRender, company.resumeManage);//简历管理
router.get("/resume/detail/:rid", auth.loginRedirect, auth.employerRender, employerCheckResume, resume.deliveryResumePreview);//简历预览
router.post('/api/resume/transmit', auth.login, auth.employerApi, companyJobAuth, resume.resumeTransmitted);//转发简历
router.post('/api/resume/updateStatus', auth.login, auth.employerApi, companyJobAuth, resume_job_rel.updateResumeStatus);//企业用户更新简历状态
router.post('/api/resume/clearStatus', auth.login, auth.employerApi, companyJobAuth, resume_job_rel.removeResumeJobs);//企业删除投递的简历
router.get('/api/resume/download_doc/:rid', downloadResumeCheck, doc.resume_doc_download);//简历下载(用户下载也在此),后面会加上权限设置
router.get('/api/resume/download_pdf/:rid', downloadResumeCheck, pdf.resume_pdf_download);//简历下载(用户下载也在此),后面会加上权限设置
router.get('/resume/for_pdf_download/:rid', pdf.resume_display_for_pdf);//简历下载详情（供pdf下载使用）


//hr招聘设置
router.get('/employer/setting', auth.loginRedirect, auth.employerRender, employer.settingPage);//招聘设置
router.post('/employer/updateInfo', auth.login, auth.employerApi, employer.update);//招聘设置


//公开的api
router.get('/public/resumeValidate', resume.resumeValidatePage);//分享简历验证页面
router.post('/resume/codeValidate', resume.resumeValidate);//分享出去的简历code查看验证
router.get('/resume/s/:shareKey', resume.shareResumePreview);//简历分享出去的视为公开
router.get('/resume/det/:shareKey', resume.detResumePreview);//简历分享出去的视为公开
router.get('/api/upload/upToken', fileUpload.upToken); // 获取上传凭证upToken
router.post('/api/upload/callback', fileUpload.callback); // 七牛上传成功后回调地址，该接口返回的结果将直接被七牛原样返回给客户端
router.post('/api/resume/updatePublicStatus', resume.publicUpdateResumeStatus);//公开的修改简历状态api
router.post('/api/resume/publicTransmit', resume.publicResumeTransmitted);//公开的转发简历api


module.exports = router;