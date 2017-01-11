var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("stats_system", {
    date: {type: _sequelize.STRING(8), primaryKey: true, allowNull: false, defaultValue: 0, comment: '日期'},
    user_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0}, // 用户数
    employer_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0}, // hr数量
    company_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0}, // 公司总数
    job_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0}, // 职位总数
    det_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0}, // 包打听总数
    resume_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0} // 简历总数
}, {
    freezeTableName: true
});