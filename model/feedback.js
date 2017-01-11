var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("feedback", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    user_id:{type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0,comment:'用户id'},
    content: {type: _sequelize.STRING(512), allowNull: false, defaultValue: ''},
    qq: {type: _sequelize.STRING(16), allowNull: false, defaultValue: ''},
    email: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    phone:{type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    device_info:{type: _sequelize.STRING(512), allowNull: false, defaultValue: '',comment:'设备信息,浏览器的话提供当前的userAgent信息,客户端提供当前设备信息,平台'},
    visualness:{type: _sequelize.INTEGER(4),allowNull: false, defaultValue: 0,comment:"视觉满意度"},
    easiness:{type: _sequelize.INTEGER(4),allowNull: false, defaultValue: 0,comment:"易用满意度度"},
    practicability:{type: _sequelize.INTEGER(4),allowNull: false, defaultValue: 0,comment:"功能实用度"},
    service:{type: _sequelize.INTEGER(4),allowNull: false, defaultValue: 0,comment:"服务满意度"},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});
