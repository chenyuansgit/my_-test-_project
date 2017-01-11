var express = require('express');
var router = express.Router();
var auth = require("../middlewares/auth");
var locals = require("../middlewares/locals");
var display_name = require("../middlewares/display_name");
var login = require('../controllers/account_system/login');
var register = require('../controllers/account_system/register');
var info = require('../controllers/account_system/info');
var password = require('../controllers/account_system/password');
var validate = require('../controllers/account_system/validate');
var js_ticket = require('../controllers/account_system/wechat/js_api_ticket');
var wechat_web_login = require('../controllers/account_system/wechat/web_login');
//var qq_web_login = require('../controllers/account_system/qq/web_login');
var weibo_web_login = require('../controllers/account_system/weibo/web_login');

//自定义环境变量设置
router.use(locals);
router.use(auth.account);
router.use(display_name);

/*登录/注册*/
router.post("/api/login", login.login);//登陆api
router.get("/login", login.loginPage);//登陆页面渲染
router.post("/api/register", register.register);//注册api
router.get("/register", register.registerPage);//注册页面渲染
router.get("/api/quitLogin", auth.login, login.quitLogin);//退出登录api

/*找回密码*/
router.get("/findPwd", password.findPwdPage);//找回密码页面渲染
router.post('/api/sendFindPwdCode', validate.sendFindPwdCode);//发送找回密码的验证码
router.post('/api/validateFindPwdCode', validate.validateFindPwdCode);//移动端验证找回密码验证码
router.post('/api/mail/findPwd', validate.sendFindPwdEmail);//web发送找回密码邮件
router.post('/api/pwd/reset', password.findPwd);//找回密码api(by='email')
router.get('/vcode/create', validate.codeImg);

/*账户设置*/
router.get("/setting/bind", auth.login, info.accountBindPage);//账户绑定设置页面
router.get("/setting/base", auth.loginRedirect, info.updateBasePage);//账户基本信息修改页面渲染
router.get("/setting/user", auth.loginRedirect, info.updatePwdPage);//账户密码修改页渲染
router.post('/api/user/pass', auth.login, password.updatePass);// 账户设置修改密码
router.post('/api/sendCode', validate.sendPhoneCode);//发送验证码
router.post('/api/code/validate', auth.login, info.updatePhone);//验证手机验证码是否正确
router.post('/api/sendEmail', auth.login, validate.sendAccountValidateEmail);//发送帐户验证邮件
router.get('/api/mail/validate', info.updateEmail);//验证邮箱

/*第三方账户设置-微信登录*/
router.get('/oauth/wechat/redirect', wechat_web_login.redirect);//微信登录跳转
router.get('/oauth/wechat/callback', wechat_web_login.callback);//微信登录回调
router.get('/oauth/wechat/bind', wechat_web_login.bindPage);//微信账户确认绑定页面
router.post('/oauth/wechat/bind', wechat_web_login.bind);//微信账户确认绑定

/*第三方账户设置-微博登录*/
router.get('/oauth/weibo/redirect', weibo_web_login.redirect);//微信登录跳转
router.get('/oauth/weibo/callback', weibo_web_login.callback);//微信登录回调
router.get('/oauth/weibo/bind', weibo_web_login.bindPage);//微信账户确认绑定页面
router.post('/oauth/weibo/bind', weibo_web_login.bind);//微信账户确认绑定



/*公共api*/

router.get('/oauth/wechat/jsapi_ticket', js_ticket.getJsApiTicket);//微信js-api token获取


module.exports = router;