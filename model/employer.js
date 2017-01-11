var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("employer", {
    user_id: {type: _sequelize.BIGINT(16), primaryKey: true},
    company_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0},
    nick_name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    avatar: {type: _sequelize.STRING(256), allowNull: false, defaultValue: ''},
    phone: {type: _sequelize.STRING(16), allowNull: false, defaultValue: ''},
    notice_email: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '接收简历邮箱'},
    email_subject_template:{type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '接收简历邮箱主题模板'},
    enterprise_email: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '企业验证邮箱'},
    enterprise_email_validated: {type: _sequelize.BOOLEAN, allowNull: false, defaultValue: 0, comment: '企业验证邮箱是否验证通过'},
    templates: {type: _sequelize.STRING(1024), allowNull: false, defaultValue: '', comment: '简历的通知模版'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['company_id']
        }
    ]
});