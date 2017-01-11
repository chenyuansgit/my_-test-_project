var solr = require('solr-client');
var config = require('../config_default').config;

var jobClient = solr.createClient(config.solr.job_core.host, config.solr.job_core.port, config.solr.job_core.core);
var resumeClient = solr.createClient(config.solr.resume_core.host, config.solr.resume_core.port, config.solr.resume_core.core);
var companyClient = solr.createClient(config.solr.company_core.host, config.solr.company_core.port, config.solr.company_core.core);

// 自动提交，每15秒一次
jobClient.autoCommit = resumeClient.autoCommit = true;

exports.client = {
    job: jobClient,
    resume: resumeClient,
    company:companyClient
};
