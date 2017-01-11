var account = require('./account');
var admin = require('./admin');
var user = require('./user');
var employer = require('./employer');
var job = require('./job');
var det = require('./det');
var det_report = require('./det_report');
var det_reliable = require('./det_reliable');
var resume_det_rel = require('./resume_det_rel');
var resume = require('./resume');
var resume_job_rel = require('./resume_job_rel');
var company = require('./company');
var validate = require('./validate');
var emailCode = require('./emailCode');
var stats_job = require('./stats_job');
var stats_det = require('./stats_det');
var stats_company = require('./stats_company');
var ad = require('./ad');
var open_screen = require('./open_screen');
var job_subscription = require('./job_subscription');
var article = require('./article');
var activity = require('./activity');
var auth_token = require('./auth_token');
var quick_recruit = require('./quick_recruit');
var quick_recruit_term = require('./quick_recruit_term');
var quick_recruit_apply = require('./quick_recruit_apply');
var quick_recruit_invite = require('./quick_recruit_invite');
var quick_recruit_user_history = require('./quick_recruit_user_history');
var quick_recruit_user_support = require('./quick_recruit_user_support');
var quick_recruit_user_info = require('./quick_recruit_user_info');
var favorite = require('./favorite');//收藏
var push = require('./push');
var client_notification = require('./client_notification');

var summer = require('./summer');//暑期实习

module.exports = {
    admin: admin,
    account: account,
    user: user,
    job: job,
    employer: employer,
    det: det,
    det_report: det_report,
    det_reliable: det_reliable,
    resume_det_rel: resume_det_rel,
    resume: resume,
    resume_job_rel: resume_job_rel,
    company: company,
    job_subscription: job_subscription,
    validate: validate,
    emailCode: emailCode,
    stats_job: stats_job,
    stats_det: stats_det,
    stats_company: stats_company,
    ad: ad,
    open_screen: open_screen,
    article: article,
    activity: activity,
    auth_token: auth_token,
    quick_recruit: quick_recruit,
    quick_recruit_apply: quick_recruit_apply,
    quick_recruit_term: quick_recruit_term,
    quick_recruit_invite: quick_recruit_invite,
    quick_recruit_user_support: quick_recruit_user_support,
    quick_recruit_user_history: quick_recruit_user_history,
    quick_recruit_user_info: quick_recruit_user_info,
    summer: summer,
    favorite: favorite,
    push: push,
    client_notification: client_notification
};