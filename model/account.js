var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("account", {
    uid: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '用户唯一的id'},
    pwd: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '密码'},
    account_name: {
        type: _sequelize.STRING(64),
        primaryKey: true,
        allowNull: false,
        defaultValue: '',
        comment: '登录名,可以是邮箱,电话和第三方账户'
    },
    account_type: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '账户类型:1.手机.2:邮箱,3:第三方帐户'},
    validated: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '账户是否被验证'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['uid', 'account_type']
        }
    ]
});