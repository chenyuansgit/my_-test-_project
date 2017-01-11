var account_template = require("./email_template/account");
var quick_recruit_template = require("./email_template/quick_recruit");
var resume_template = require("./email_template/resume");
var det_template = require("./email_template/det");


//简历通过初选时候,发送的简历模版
exports.contact = resume_template.contact;
//简历不合适邮件模板
exports.improper = resume_template.improper;
//面试通知邮件模板
exports.interview = resume_template.interview;
//简历转发后，发给求职者邮件模板
exports.transmit = resume_template.transmit;
//简历转发后，发给转发邮箱的模板
exports.resumeTransmitted = resume_template.resumeTransmitted;
//简历投递成功后,发送给公司hr的简历
exports.delivery = resume_template.delivery;


//验证账户邮箱
exports.accountValidate = account_template.accountValidate;
//验证找回密码(激活链接方式)
exports.accountFindPwd = account_template.accountFindPwd;
//验证找回密码(验证码方式)
exports.accountFindPwdCode = account_template.accountFindPwdCode;
//验证企业邮箱
exports.companyValidate = account_template.companyValidate;


//快招 学生收到申请通过的邮件(term_id)
exports.quickRecruitApplySuccess = quick_recruit_template.quickRecruitApplySuccess;
//快招 学生收到申请未通过的邮件(term_id)
exports.quickRecruitApplyRefused = quick_recruit_template.quickRecruitApplyRefused;
//快招 学生收到申请待定的邮件（term_id)
exports.quickRecruitApplyDetermined = quick_recruit_template.quickRecruitApplyDetermined;
//快招 学生收到后台快招邀请的邮件
exports.quickRecruitApplyReInvite = quick_recruit_template.quickRecruitApplyReInvite;
//快招 学生收到公司邀请的邮件
exports.quickRecruit = quick_recruit_template.quickRecruit;
//快招 学生接受公司邀请后收到的邮件
exports.quickRecruitAccept = quick_recruit_template.quickRecruitAccept;
//快招 hr收到学生接受快招邀请的邮件
exports.quickRecruitDelivery = quick_recruit_template.quickRecruitDelivery;
//快招 hr收到学生拒绝快招邀请的邮件
exports.quickRecruitRefused = quick_recruit_template.quickRecruitRefused;


//包打听,hr收到的邮件
exports.detDelivery = det_template.delivery;