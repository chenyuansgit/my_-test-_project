var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("stats_job", {
    jid: {type: _sequelize.INTEGER(11), primaryKey: true, allowNull: false, defaultValue: 0, comment: 'job唯一的id'},
    resume_num: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, comment: '申请量'},
    view_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '浏览量'},
    resume_treat_percent: {type: _sequelize.INTEGER(3), allowNull: false, defaultValue: 0, comment: '简历处理率'},
    resume_treat_delay: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, comment: '简历处理用时，单位小时'},
    resume_treat_num: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, comment: '简历已处理数量'}
}, {
    freezeTableName: true
});