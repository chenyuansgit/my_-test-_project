var logger = require("../../common/log").logger("index");
var db = require('../../model/index').models;
var proxy = require('../../proxy/index');
var async = require('async');
var config = require('../../config_default').config;
var des = require('../../common/des');
var company_type = require('../../common/company_type.json');
var hotCity = require('../../common/hot_city.json');
var resp_status_builder = require('../../common/response_status_builder.js');

require('../../common/fn');

exports.mine = function (req, res) {
    var employer = res.locals.employer;
    proxy.company.companyDetails(employer.user_id, employer.company_id, 1, 1, function (err, company, jobs) {
        if (err) {
            logger.error(err);
        }
        res.render("employer/mycompany", {
            company: company || {},
            intern_jobs: jobs && jobs.intern ? jobs.intern : [],
            campus_jobs: jobs && jobs.campus ? jobs.campus : [],
            company_type: company_type
        });
    });
};

exports.validate = function (req, res) {
    var step = req.query.step >= 1 && req.query.step <= 3 ? req.query.step : 1, employer = res.locals.employer;
    if (req.auth_employer.error) {
        if (step == 1) {
            return res.render("company/validate/step1");
        }
        return res.redirect('/company/validate?step=1');
    }
    switch (req.auth_employer.code) {
        case 1:
            if (step == 1) {
                return res.render("company/validate/step1");
            }
            res.redirect('/company/validate?step=1');
            break;
        case 2:
            if (step == 1) {
                return res.render("company/validate/step1");
            }
            if (step == 2) {
                if (req.signedCookies['intern_company_validate_mail']) {
                    return res.render("company/validate/step2");
                } else {
                    return res.redirect('/company/validate?step=1');
                }
            }
            if (step == 3) {
                return res.redirect('/company/validate?step=1');
            }
            break;
        case 3:
            if (step != 3) {
                return res.redirect('/company/validate?step=3');
            }
            db.company.findAll({
                where: {
                    enterprise_email_name: employer.enterprise_email.split('@')[1].toLowerCase()
                }
            }).then(function (company) {
                if (!company || !company.length) {
                    return res.render('company/validate/step3_create', {
                        company: {},
                        company_type: company_type
                    });
                }
                return res.render('company/validate/step3_join', {
                    company: company,
                    company_type: company_type
                });
            });
            break;
        case 4:
            res.redirect("/myCompany");
            break;
    }
};
/*公司设置 end*/
/*简历管理*/
exports.resumeManage = function (req, res) {
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time, page = req.query.page > 1 ? req.query.page : 1, status = req.query.status >= 1 && req.query.status <= 4 ? req.query.status : 1;
    var employer = res.locals.employer, job_id = req.query.job_id || 0;
    async.parallel([function (callback) {
        if (!job_id) {
            return callback(null, null);
        }
        proxy.job.findOneById(job_id, function (e, job) {
            callback(e, job && job.user_id == employer.user_id ? job.name : null);
        });
    }, function (callback) {
        proxy.resume.getListByCompany({
            status: status,
            job_user_id: employer.user_id,
            job_id: job_id,
            timestamp: timestamp,
            page: page,
            read_type: req.query.read_type,
            transmitted: req.query.transmitted,
            marked: req.query.marked,
            interviewed: req.query.interviewed || ''
        }, function (e, data) {
            callback(e, data);
        });
    }, function (callback) {
        proxy.company.findOne(employer.company_id, function (e2, company) {
            callback(e2, company);
        });
    }], function (err, results) {
        if (err) {
            logger.error(err);
            return res.render("employer/resumeManage/list", {
                resumes: [],
                company:[],
                pages: 0,
                page: page,
                job_name: null,
                job_id: job_id || 0,
                status: status,
                count: 0
            });
        }
        if (results[1].resumes && results[1].resumes.length && page === 1) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        var data = results[1] || {};
        data.company = results[2] || {};
        data.status = status;
        data.job_name = results[0];
        data.job_id = job_id || 0;
        res.render("employer/resumeManage/list", data);
    });
};
/*简历管理 end*/

/*公司职位管理*/
exports.companyPositionPage = function (req, res) { //公司职位页面
    var now_time = +new Date, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var employer = res.locals.employer;

    var option = {
        timestamp: timestamp,
        page: req.query.page > 1 ? req.query.page : 1,
        uid: employer.user_id
    };
    option.state = req.query.state == 2 ? 2 : 1;
    async.parallel([function (callback) {
        proxy.job.getListByState(option, function (err, data) {
            callback(err, data);
        });
    }, function (callback) {
        proxy.quick_recruit.recommend(null, function (err, quick_recruit) {
            callback(err, quick_recruit);
        });
    }], function (e, results) {
        if (e) {
            logger.error(e);
            return res.render("employer/positionManage/companyPosition", {
                jobs: [],
                pages: 0,
                page: req.query.page > 1 ? req.query.page : 1,
                count: 0,
                quick_recruit: {}
            });
        }
        if (results[0].jobs.length && (!req.query.page || req.query.page <= 1)) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        res.render("employer/positionManage/companyPosition", {
            jobs: results[0].jobs,
            pages: results[0].pages,
            page: req.query.page > 1 ? req.query.page : 1,
            count: results[0].count,
            quick_recruit: results[1] || {}
        });
    });
};
exports.postPositionPage = function (req, res) { //职位发布页面
    var employer = res.locals.employer;
    async.parallel([
        function (callback) {
            proxy.job.getPubTimes(employer.user_id, function (e1, count) {
                if (e1) {
                    logger.error(e1);
                    return callback(e1);
                }
                count = config.company.job_release_times - count;
                callback(null, count < 0 ? 0 : count);
            });
        }, function (callback) {
            proxy.company.findOne(employer.company_id, function (e2, company) {
                callback(e2, company);
            });
        }], function (err, results) {
        if (err) {
            return res.render("employer/positionManage/postPosition", {
                remaining_pub_times: 0,
                company: {}
            });
        }
        res.render("employer/positionManage/postPosition", {
            remaining_pub_times: results[0],
            company: results[1]
        });
    });
};
exports.editPositionPage = function (req, res) { //职位修改页面
    var employer = res.locals.employer;
    proxy.company.findOne(employer.company_id, function (err, company) {
        if (err) {
            logger.error(err);
        }
        res.render("employer/positionManage/editPosition", {
            job: req.insert_data.jobs[0] || {},
            company: company || {}
        });
    });
};
exports.saveSuccessPage = function (req, res) { //职位发布成功页面
    res.render("employer/positionManage/saveSuccess");
};
/*公司职位管理 end*/
//加入公司
exports.join = function (req, res) {
    var ae = req.auth_employer, option = req.body.option || {}, employer = res.locals.employer;
    var enterprise_email_name = employer.enterprise_email.split('@')[1].toLowerCase();
    if (ae.code == 3) {
        return proxy.company.findOne(option.company_id, function (err, company) {
            if (err) {
                return res.json(resp_status_builder.build(10003));
            }
            if (company && company.enterprise_email_name == enterprise_email_name) {
                return proxy.employer.updateOneById(employer.user_id, {
                    company_id: company.cid,
                    update_time: +new Date
                }, function (e1, row) {
                    if (e1 || !row) {
                        logger.error(e1);
                        return res.json(resp_status_builder.build(10008));
                    }
                    if (row[0]) {
                        return res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
                    }
                    res.json(resp_status_builder.build(10008));
                });
            }
            res.json(resp_status_builder.build(10008));
        });
    }
    res.json(resp_status_builder.build(10008));
};
exports.create = function (req, res) {
    var ae = req.auth_employer, option = req.body.option, employer = res.locals.employer;
    if (ae.code == 3) {
        return db.company.findOne({
            where: {
                enterprise_email_name: employer.enterprise_email.split('@')[1].toLowerCase()
            }
        }).then(function (company) {
            if (!company) {
                option.create_time = option.update_time = +new Date;
                option.enterprise_email_name = employer.enterprise_email.split('@')[1].toLowerCase();
                if (option.cid) delete option.cid;
                if (option.authenticated) delete option.authenticated;
                if (option.last_login_time) delete option.last_login_time;

                return proxy.company.create(option, function (err, com) {
                    if (err) {
                        logger.error(err);
                        return res.json(resp_status_builder.build(10003));
                    }
                    if (com) {
                        return proxy.employer.updateOneById(employer.user_id, {
                            company_id: com.cid,
                            update_time: +new Date
                        }, function (e, row) {
                            if (e) {
                                logger.error(e);
                                return res.json(resp_status_builder.build(10008));
                            }
                            if (row[0]) {
                                return res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
                            }
                            res.json(resp_status_builder.build(10008));
                        });
                    }
                    res.json(resp_status_builder.build(10008));
                });
            }
            res.json(resp_status_builder.build(10008));
        });
    }
    res.json(resp_status_builder.build(10008));
};
exports.joinCreate = function (req, res) {
    var ae = req.auth_employer, option = req.body.option, employer = res.locals.employer;
    if (ae.code == 3) {
        return db.company.findOne({
            where: {
                enterprise_email_name: employer.enterprise_email.split('@')[1].toLowerCase()
            }
        }).then(function (company) {
            if (!!company) {
                option.create_time = option.update_time = +new Date;
                option.enterprise_email_name = employer.enterprise_email.split('@')[1].toLowerCase();
                if (option.cid) delete option.cid;
                if (option.authenticated) delete option.authenticated;
                if (option.last_login_time) delete option.last_login_time;

                return proxy.company.create(option, function (err, com) {
                    if (err) {
                        logger.error(err);
                        return res.json(resp_status_builder.build(10003));
                    }
                    if (com) {
                        return proxy.employer.updateOneById(employer.user_id, {
                            company_id: com.cid,
                            update_time: +new Date
                        }, function (e, row) {
                            if (e) {
                                logger.error(e);
                                return res.json(resp_status_builder.build(10008));
                            }
                            if (row[0]) {
                                return res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms'));
                            }
                            res.json(resp_status_builder.build(10008));
                        });
                    }
                    res.json(resp_status_builder.build(10008));
                });
            }
            res.json(resp_status_builder.build(10008));
        });
    }
    res.json(resp_status_builder.build(10008));
};
//修改公司资料
exports.updateInfo = function (req, res) {
    var option = req.body.option || {}, employer = res.locals.employer;
    var black = ['cid', 'authenticated', 'create_time', 'last_login_time'];
    for (var i = 0, len = black.length; i < len; ++i) {
        if (typeof option[black[i]] !== 'undefined') delete option[black[i]];
    }
    option.update_time = +new Date;

    proxy.company.update(employer.company_id, option, function (err, com) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10003));
        }
        if (!com[0]) {
            return res.json(resp_status_builder.build(10006, "no this company or phone,email validate error"));
        }
        res.json(resp_status_builder.build(10000, +new Date - req.start_time));

    });
};
exports.validateEmail = function (req, res) {
    var key = req.query.k, decode, email, uid, time, now = +new Date;
    try {
        decode = JSON.parse(des.decipher(config.des_3.algorithm, config.des_3.key, key));
        uid = decode.user_id;
        email = decode.email;
        time = decode.time;
    } catch (e) {
        logger.error('wrong key:' + key + ",error:" + e);
        return res.render('company/validate/validateSucc', {
            code: '1',
            msg: 'url error',
            email: null
        });
    }
    if (now - time >= 60 * 1000 * 1000) {
        return res.render('company/validate/validateSucc', {
            code: '2',
            msg: 'url expired',
            email: email
        });
    }
    var option = {
        enterprise_email_validated: 1,
        enterprise_email: email,
        updateTime: +new Date
    };
    proxy.employer.updateOneById(uid, option, function (err, row) {
        if (err) {
            logger.error(err);
            return res.render('company/validate/validateSucc', {
                code: '1',
                msg: 'url error',
                email: null
            });
        }
        res.redirect('/company/validate?step=3');
    });
};
exports.companySearch = function (req, res) {
    var now_time = +new Date, page = req.query.page > 1 ? req.query.page : 1, timestamp = (req.query.page > 1 && req.cookies['intern_list_ts']) ? req.cookies['intern_list_ts'] : now_time;
    var option = {
        ct: req.query.ct,
        st: req.query.st || 0,
        cid: req.query.cid,
        k: req.query.k
    };
    async.parallel([function (callback) {
        proxy.ad.findOnShowList(3, function (e, ads) {
            callback(e, ads);
        });
    }, function (callback) {
        proxy.company.search({
            key: option.k,//关键词
            ct: req.query.ct,//公司类型
            st: req.query.st,//公司规模
            cid: req.query.cid,//公司地址
            timestamp: timestamp,
            page: page//页数,默认为1
        }, function (err, data) {
            callback(err, data);
        });
    }], function (e, results) {
        if (e) {
            logger.error(e);
            res.render('companySearch', {
                option: option,
                hotCity: hotCity,
                companies: [],
                company_type: company_type,
                ads: results[0] || [],
                pages: 0,
                page: page,
                count: 0
            });
        }
        var data = results[1], ads = results[0];
        if (data.companies.length && (page == 1)) {
            res.cookie('intern_list_ts', now_time, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 30,
                signed: false,
                httpOnly: true
            });
        }
        data.option = option;
        data.company_type = company_type;
        data.hotCity = hotCity;
        data.ads = ads;
        res.render('companySearch', data);
    });
};