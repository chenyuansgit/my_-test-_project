var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("user", {
    user_id: {type: _sequelize.BIGINT(16), primaryKey: true},
    nick_name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    avatar: {type: _sequelize.STRING(256), allowNull: false, defaultValue: ''},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});