var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("quick_recruit_term", {
    term_id: {type: _sequelize.INTEGER(4), primaryKey: true, autoIncrement: true},
    title: {type: _sequelize.STRING(32), allowNull: false, defaultValue: ''},
    img: {type: _sequelize.STRING(128), allowNull: false, defaultValue: ''},
    status: {type: _sequelize.INTEGER(16), allowNull: false, defaultValue: 0},  // 1：发布  2：未发布
    start_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    end_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});