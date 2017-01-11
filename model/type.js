var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("job_type", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},//类型id
    name: {type: _sequelize.STRING(32), allowNull: false, defaultValue: ''},//招聘名称
    parent_name: {type: _sequelize.STRING(32), allowNull: false, defaultValue: ''},//父类型名称
    parent_tid: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},//父类型id
    level: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0},
    parents_name_arr: {type: _sequelize.STRING(256), allowNull: false, defaultValue: '[]'},//父类型名称集合
    parents_id_arr: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},//父类型id集合
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});
