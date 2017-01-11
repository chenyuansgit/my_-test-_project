var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("stats_user_qr_history", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '用户唯一的id'},
    company_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    company_name:{type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    visit_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});