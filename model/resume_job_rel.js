var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define('resume_job_rel', {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    resume_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '简历id'},
    resume_user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '简历发布者的用户id'},
    job_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '职位id'},
    version: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0},
    job_user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '职位发布者的用户id'},
    job_company_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '职位发布的公司id'},
    status: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '1:投递成功  2:待沟通  3:通知面试  4:不合'},
    marked: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '标记（收藏）已投递（我）的简历  0:未收藏 1:已收藏'},
    read_type: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '阅读状态   0：未阅读  1:已阅读'},
    transmitted: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '转发状态  0：未转发  1：已转发'},
    transmit_email: {type: _sequelize.STRING(512), allowNull: false, defaultValue: '', comment: '转发的邮箱  json数组'},
    interview_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '面试时间'},
    contact_info: {
        type: _sequelize.STRING(512),
        allowNull: false,
        defaultValue: '',
        comment: '简历状态变为待沟通后的信息,包括状态更改时间等'
    },
    interview_info: {
        type: _sequelize.STRING(512),
        allowNull: false,
        defaultValue: '',
        comment: '简历状态变为通知面试后的信息,包括状态更改时间,面试信息等'
    },
    improper_info: {
        type: _sequelize.STRING(512),
        allowNull: false,
        defaultValue: '',
        comment: '简历状态变为不适合后的信息,包括状态更改时间,不合适原因等'
    },
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    recruit_type: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 1, comment: '招聘方式，1:普通投递 2:快招 3校招'},
    term_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '快招期数:1,2,3..'}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: true,
            fields: ['resume_id', 'job_id']
        },
        {
            unique: false,
            fields: ['status']
        }
    ]
});