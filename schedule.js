var schedule = require('node-schedule');
var job = require('./schedules/job_schedule');
var det = require('./schedules/det_schedule');
var company = require('./schedules/company_schedule');
var system = require('./schedules/system_stats_schedule');
var ad = require('./schedules/ad');
var quick_recruit_invite = require('./schedules/quick_recruit_invite');
var quick_recruit_user_history = require('./schedules/quick_recruit_user_history');
var resume_interview_notification = require('./schedules/notification/resume/interview');
var resume_improper_notification = require('./schedules/notification/resume/improper');
var send_det_promotion_email = require('./schedules/notification/promotion/send_det_email');


var rule1 = new schedule.RecurrenceRule();
rule1.second = [0, 10, 20, 30, 40, 50];
schedule.scheduleJob(rule1, function () { // 每10秒执行1次job,det,company统计
    job.doBgService(100);
    det.doBgService(100);
    company.doBgService(100);
});

var rule2 = new schedule.RecurrenceRule();
rule2.minute = [0, 10, 20, 30, 40, 50];
schedule.scheduleJob(rule2, function () { // 每10分钟执行1次job,det过期下线
    job.delExpiredJobs();
    det.delExpiredDet();
});

var rule3 = new schedule.RecurrenceRule();  // 每小时执行一次系统统计任务
rule3.minute = 0;
schedule.scheduleJob(rule3, function () {
    system.doBgService();
});

schedule.scheduleJob(rule3, function () {//每一个小时执行一次快招邀请时间的过期操作
    quick_recruit_invite.expiredInivtes();
});

var rule4 = new schedule.RecurrenceRule();
rule4.minute = [2, 12, 22, 32, 42, 52];
schedule.scheduleJob(rule4, function () {// 每10分钟执行1次广告过期下线,预定上线
    ad.updateOnShowList();
});
var rule5 = new schedule.RecurrenceRule();
rule5.second = 10;
schedule.scheduleJob(rule5, function () {// 每1分钟将快招的历史记录加到mysql里面
    quick_recruit_user_history.doBgService(100);
});

var rule6 = new schedule.RecurrenceRule();
rule6.hour = 0;
rule6.minute = 0;
rule6.second = 1;
schedule.scheduleJob(rule6, function () {// 每天0点更新今日访客数
    quick_recruit_user_history.refreshTodayVisitor();
});


var rule7 = new schedule.RecurrenceRule();
rule7.hour = 10;
rule7.minute = 1;
schedule.scheduleJob(rule7, function () {// 每天10点检查广告过期,并邮件提醒相关负责人
    ad.sendWarning();
});

var rule8 = new schedule.RecurrenceRule();
rule8.second = 0;
schedule.scheduleJob(rule8, function () {// 每一分钟给即将在两个小时内面试的学生用户发送面试提醒
    resume_interview_notification.doBgService();
});


var rule9 = new schedule.RecurrenceRule();
rule9.minute = 0;
schedule.scheduleJob(rule9, function () {// 每一个小时将未被处理的投递状态变为不合适
    resume_improper_notification.doBgService();
});

var rule10 = new schedule.RecurrenceRule();
rule10.dayOfWeek = [1, 2, 3, 4, 5];
rule10.hour = 9;
rule10.minute = 40;
schedule.scheduleJob(rule10, function () {// 给昨天上传的包打听职位的hr邮箱发送推广邮件
    send_det_promotion_email.doBgService();
});
