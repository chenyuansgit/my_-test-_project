var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;


module.exports = sequelize.define("resume", {
    rid: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, primaryKey: true},
    name: {type: _sequelize.STRING(16), allowNull: false, defaultValue: ''},
    phone: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    email: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    male: {type: _sequelize.BOOLEAN, allowNull: false, defaultValue: 1, comment: '1:男  0：女'},
    signature: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '',comment: '个性签名,作为快招简述'},
    work_state: {
        type: _sequelize.INTEGER(1),
        allowNull: false,
        defaultValue: 0,
        comment: '0.在学校  1.在实习 2.在公司所在城市  3.暂时无法实习'
    },
    address: {type: _sequelize.STRING(256), allowNull: false, defaultValue: ''},
    avatar: {type: _sequelize.STRING(256), allowNull: false, defaultValue: ''},
    birthday: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    highest_degree_stage:{
        type: _sequelize.INTEGER(2),
        allowNull: false,
        defaultValue: 0,
        comment: '最高学历 1：大专  2:本科  3:硕士  4:博士及以上'
    },
    education_detail: {type: _sequelize.TEXT, comment: '教育经历'},
    intern_expect_cid:{type: _sequelize.STRING(64), allowNull: false, defaultValue: 0,comment: '期望职位工作所在地id'},
    intern_expect_city:{type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '期望职位工作所在地'},
    intern_expect_dur_type:{type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '实习持续周期:1.一个月以下 2.两个月以下 3.三个月以下 4.三个月以上'},
    intern_expect_position:{type: _sequelize.STRING(32), allowNull: false, defaultValue: '',comment: '期望的职位'},
    intern_expect_position_type:{type: _sequelize.STRING(32), allowNull: false, defaultValue: '',comment: '期望的职位类型id集合,逗号隔开'},
    intern_expect_days_type:{type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '期望每周实习天数:1.1-2天 2.3天 3.4天 4.5天 5.6-7天'},
    intern_expect_min_payment:{type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '期望日最低薪资'},
    intern_expect: {type: _sequelize.STRING(1024), allowNull: false, defaultValue: '', comment: '期望职位详情'},
    skill: {type: _sequelize.TEXT, comment: '职业技能'},
    works:{type: _sequelize.TEXT, comment: '作品集'},
    project_exp: {type: _sequelize.TEXT, comment: '项目经历'},
    school_exp: {type: _sequelize.TEXT, comment: '校园经历'},
    inter_exp: {type: _sequelize.TEXT, comment: '实习经历'},
    self_desc: {type: _sequelize.STRING(1024), allowNull: false, defaultValue: ''},
    default_resume: {type: _sequelize.BOOLEAN, allowNull: false, defaultValue: 0, comment: '是否是默认简历'},
    user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    status: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1,comment:'简历状态:1.正常 2.被屏蔽(不在人才库列表中展示)'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    refresh_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    version: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, primaryKey: true},
    is_public: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['user_id']
        }
    ]
});