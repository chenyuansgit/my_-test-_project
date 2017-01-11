var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("company", {
    cid: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    authenticated: {type: _sequelize.BOOLEAN, allowNull: false, defaultValue: 0},
    enterprise_email_name: {type: _sequelize.STRING(32), allowNull: false, defaultValue: '', comment: '企业邮箱后缀(唯一)'},
    name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    full_name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    title: {type: _sequelize.STRING(256), allowNull: false, defaultValue: ''},
    city: {type: _sequelize.STRING(16), allowNull: false, defaultValue: ''},
    city_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    scale_type: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '企业规模类型'},
    type: {type: _sequelize.STRING(32), allowNull: false, defaultValue: '', comment: '公司类型'},
    type_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '公司类型id'},
    trade_type: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '公司领域'},
    address: {type: _sequelize.STRING(512), allowNull: false, defaultValue: '', comment: '公司地址'},
    homepage: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '公司主页'},
    tag: {type: _sequelize.STRING(256), allowNull: false, defaultValue: '', comment: '公司标签，json数组'},
    avatar: {type: _sequelize.STRING(256), allowNull: false, defaultValue: '', comment: '公司头像'},
    introduction: {type: _sequelize.TEXT, comment: '公司介绍'},
    last_login_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '公司上次来访时间'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    status: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '状态 1:正常 9:屏蔽'}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['enterprise_email_name']
        }
    ]
});