var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("quick_recruit_apply", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    user_id: {type: _sequelize.BIGINT(20),allowNull: false, defaultValue: 0},
    name: {type: _sequelize.STRING(32), allowNull: false, defaultValue: ''},
    male: {type: _sequelize.BOOLEAN, allowNull: false, defaultValue: 1, comment: '1:男  0：女'},
    phone: {type: _sequelize.STRING(11), allowNull: false, defaultValue: ''},
    email: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    status: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 1, comment:'1：待处理  2：通过  3：拒绝'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    school: {type: _sequelize.STRING(32), allowNull: false, defaultValue: ''},
    term_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    resume_id: {type: _sequelize.BIGINT(20),allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'term_id']
        }
    ]
});