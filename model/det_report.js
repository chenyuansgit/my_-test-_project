var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("det_report", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '举报者的id'},
    det_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '包打听职位id'},
    title: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '举报标题'},
    desc: {type: _sequelize.STRING(512), allowNull: false, defaultValue: 0, comment: '具体描述'},
    type: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '包打听类型 1.实习 2.校招'},
    status: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '状态 1:待处理  2:举报成功  3:举报失败'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['user_id']
        },
        {
            unique: false,
            fields: ['status']
        }
    ]
});
