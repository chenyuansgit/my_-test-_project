var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("client_notification", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    type_id: {
        type: _sequelize.INTEGER(4),
        allowNull: false,
        defaultValue: 0,
        comment: '链接类型:1.职位 2.公司 3.内部其他页面(包含活动,说明等) 4.第三方页面 5.消息'
    },
    title: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    desc: {type: _sequelize.STRING(128), allowNull: false, defaultValue: ''},
    cover: {type: _sequelize.STRING(256), allowNull: false, defaultValue: ''},
    url: {type: _sequelize.STRING(128), allowNull: false, defaultValue: ''},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['type_id']
        },
        {
            unique: false,
            fields: ['create_time']
        }
    ]
});