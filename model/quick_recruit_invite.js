var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("quick_recruit_invite", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    user_id: {type: _sequelize.BIGINT(20),allowNull: false, defaultValue: 0},
    job_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    employer_user_id: {type: _sequelize.BIGINT(20),allowNull: false, defaultValue: 0},
    company_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    status: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 1, comment:'1：待处理  2：通过  3：拒绝  4:过期  9:删除'},
    term_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    resume_id: {type: _sequelize.BIGINT(20), allowNull: false, defaultValue: 0},
    version:{type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'job_id']
        }
    ]
});