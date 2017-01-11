var solr = require("./solr").client;
var logger = require("../common/log").logger("index");
var sequelize = require('../model/connect').sequelize;


function deleteById(cid, callback) {
    solr.company.deleteByID(cid, function (err, obj) {
        if (err) {
            logger.error(err);
        }
        callback && callback(err, obj);
    });
}
exports.deleteById = deleteById;


function addOrUpdate(companies, callback) {
    solr.company.add(companies, function (err, obj) {
        if (err) {
            logger.error(err);
        }
        callback && callback(err, obj);
    });
}
exports.addOrUpdate = addOrUpdate;

exports.update = function (cid, callback) {
    var sql = "select cid,status,name,city,city_id,create_time,scale_type,avatar,type,type_id,trade_type,title,tag ,b.count,c.det_count from company a left join (select company_id,count(*) as count from job where state = 1 group by company_id) b on a.cid = b.company_id  left join (select company_id,count(*) as det_count from detective_job where state = 1 group by company_id )c on c.company_id = a.cid where  a.cid = :cid";
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT,
        replacements: {
            cid: cid
        }
    }).then(function (company) {
        if (company && company[0] && company[0].status == 1) {
            company[0].job_num = (company[0].count || 0) + (company[0].det_count || 0);
            delete company[0].count;
            delete  company[0].det_count;
            delete company[0].status;
            return addOrUpdate(company[0], function (e, obj) {
                callback && callback(e, obj);
            });
        }
        deleteById(cid, function (e, obj) {
            callback && callback(e, obj);
        });
    }).catch(function (err) {
        logger.error(err);
        callback && callback(err);
    });
};


/**
 * 公司搜索
 * @param option
 * @param callback
 */
exports.queryCompany = function (option, callback) {
    var q = option.key || "*";
    if (option.page > 3000) {
        option.page = 1;
    }
    var query = solr.resume.createQuery()
        .q(q)
        .start((option.page - 1) * option.size)
        .rows(option.size)
        .df("key")
        .qop("AND")
        .sort({create_time: 'desc'});

    query.matchFilter("create_time", "[0 TO " + option.timestamp + "]");

    if (option.scale_type) {
        query.matchFilter("scale_type", option.scale_type);
    }
    if (option.city_id >= 1) {
        query.matchFilter("city_id", option.city_id);
    }
    if (option.type_id > 0) {
        query.matchFilter("type_id", option.type_id);
    }
    solr.company.search(query, function (err, companies) {
        if (err) {
            logger.error(err);
            return callback(err);
        }
        callback(null, {
            companies: companies.response.docs,
            count: companies.response.numFound,
            page: option.page > 1 ? option.page : 1,
            pages: companies.response.numFound % 10 == 0 ? companies.response.numFound / 10 : (parseInt(companies.response.numFound / 10) + 1)
        });
    });
};
