var account = require('./account');
var admin = require('./admin');
var user = require('./user');
var company = require('./company');
var job = require('./job');
var det = require('./det');
var det_report = require('./det_report');
var resume_det_rel = require('./resume_det_rel');
var resume = require('./resume');
var resume_job_rel = require('./resume_job_rel');
var feedback = require('./feedback');
var employer = require('./employer');
var stats_job = require('./stats_job');
var stats_det = require('./stats_det');
var stats_company = require('./stats_company');
var ad = require('./ad');
var open_screen = require('./open_screen');
var article = require('./article');
var activity = require('./activity');
var job_subscription = require('./job_subscription');
var quick_recruit = require('./quick_recruit');
var stats_system = require('./stats_system');
var quick_recruit_apply = require('./quick_recruit_apply');
var quick_recruit_term = require('./quick_recruit_term');
var quick_recruit_invite = require('./quick_recruit_invite');
var stats_user_qr_info = require('./stats_user_qr_info');
var stats_user_qr_history = require('./stats_user_qr_history');
var client_notification = require('./client_notification');

exports.models = {
    account: account,
    admin: admin,
    user: user,
    company: company,
    resume: resume,
    job: job,
    det: det,
    det_report: det_report,
    resume_det_rel: resume_det_rel,
    resume_job_rel: resume_job_rel,
    employer: employer,
    feedback: feedback,
    stats_job: stats_job,
    stats_det: stats_det,
    stats_company: stats_company,
    ad: ad,
    open_screen: open_screen,
    article: article,
    activity: activity,
    job_subscription: job_subscription,
    quick_recruit: quick_recruit,
    stats_system: stats_system,
    quick_recruit_apply: quick_recruit_apply,
    quick_recruit_term: quick_recruit_term,
    quick_recruit_invite: quick_recruit_invite,
    stats_user_qr_info: stats_user_qr_info,
    stats_user_qr_history: stats_user_qr_history,
    client_notification: client_notification
};

