var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("stats_company", {
    cid: {type: _sequelize.INTEGER(11), primaryKey: true, allowNull: false, defaultValue: 0, comment: '唯一id'},
    job_online_num: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, comment: '企业在线job数'},
    resume_treat_percent: {type: _sequelize.INTEGER(3), allowNull: false, defaultValue: 0, comment: '简历及时处理率'},
    resume_treat_delay: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, comment: '简历平均响应时间,单位小时'},
    last_login_time: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, comment: '企业最近登录时间'}
}, {
    freezeTableName: true
});