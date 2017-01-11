var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("admin", {
    account_name: {
        type: _sequelize.STRING(64),
        primaryKey: true,
        allowNull: false,
        defaultValue: '',
        comment: '登录名,企业邮箱'
    },
    pwd: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '密码'},
    permission: {type: _sequelize.STRING(512), allowNull: false, defaultValue: '', comment: '权限,json string'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});