var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("stats_det", {
    det_id: {type: _sequelize.BIGINT(16), primaryKey: true, allowNull: false, defaultValue: 0, comment: '包打听唯一id'},
    resume_num: {type: _sequelize.INTEGER(6), allowNull: false, defaultValue: 0, comment: '申请量'},
    view_num: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '浏览量'},
    resume_check_num: {type: _sequelize.INTEGER(6), allowNull: false, defaultValue: 0, comment: '简历查看数,一个简历投递多次查看不重复计入'}
}, {
    freezeTableName: true
});