var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define('resume_det_rel', {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    resume_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '简历id'},
    resume_user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '简历发布者的用户id'},
    version: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0},
    det_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '包打听id'},
    recruit_type: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 2, comment: '招聘方式，2.实习包打听 4.校招包打听'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['resume_user_id', 'det_id']
        }
    ]
});