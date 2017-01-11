var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("activity", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    title: {type: _sequelize.STRING(32), allowNull: false, defaultValue: '', comment: '活动主标题'},
    subtitle: {type: _sequelize.STRING(32), allowNull: false, defaultValue: '', comment: '活动副标题'},
    sponsor: {type: _sequelize.STRING(32), allowNull: false, defaultValue: '', comment: '活动发起者,主办方'},
    cover:{type: _sequelize.STRING(256), allowNull: false, defaultValue: '', comment:'封面'},
    content: {type: _sequelize.TEXT, allowNull: true, comment: '活动主体内容'},
    status: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 1, comment: '活动状态'},
    start_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '活动开始时间'},
    end_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '活动结束时间'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['start_time']
        },
        {
            unique: false,
            fields: ['status']
        }
    ]
});
