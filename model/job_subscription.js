var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("job_subscription", {
    user_id: {type: _sequelize.BIGINT(16), primaryKey: true},
    key:{type: _sequelize.STRING(32), allowNull: false, defaultValue: '', comment: '关键词'},
    name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '职位名称'},
    min_payment: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '日最低薪资'},
    workdays: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '实习时间,每周次数'},
    city: {type: _sequelize.STRING(16), allowNull: false, defaultValue: '', comment: '职位工作所在地'},
    city_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    education: {
        type: _sequelize.INTEGER(2),
        allowNull: false,
        defaultValue: 0,
        comment: '教育要求 0:不限  1：大专  2:本科  3:硕士  4:博士'
    },
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});
