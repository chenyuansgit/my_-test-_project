var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("detective_job", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    type: {type: _sequelize.STRING(16), allowNull: false, defaultValue: '', comment: '职位子类型'},
    type_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '职位子类型id'},
    parent_type: {type: _sequelize.STRING(16), allowNull: false, defaultValue: '', comment: '职位父类型'},
    parent_type_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '职位父类型id'},
    name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '职位名称'},
    company_name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '公司名称'},
    company_avatar: {type: _sequelize.STRING(256), allowNull: false, defaultValue: '', comment: '公司头像'},
    company_type: {type: _sequelize.STRING(32), allowNull: false, defaultValue: '', comment: '公司类型'},
    company_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '关联到的正式企业id'},
    min_payment: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '最低薪资,日薪或者年薪'},
    max_payment: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '最高薪资,日薪或者年薪'},
    workdays: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '实习时间,每周次数'},
    regular: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '可否转正:1 可以 0 不可以'},
    education: {
        type: _sequelize.INTEGER(2),
        allowNull: false,
        defaultValue: 0,
        comment: '教育要求 0:不限  1：大专  2:本科  3:硕士  4:博士及以上'
    },
    city: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '职位工作所在地'},
    city_id: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    address: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '工作具体地址'},
    content: {type: _sequelize.TEXT, comment: '招聘内容'},
    redirect_uri: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '跳转的公司主页或者职位主页'},
    notice_email: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '接收简历邮箱'},
    email_subject_template: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '接收简历邮箱主题模板'},
    state: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '状态 1:在线  2:下线  9:删除'},
    channel: {type: _sequelize.STRING(16), allowNull: false, defaultValue: '', comment: '包打听来源'},
    channel_type: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '包打听来源类型 2.普通实习 4.校招'},
    deadline: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '截止招收时间'},
    refresh_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '职位刷新时间'},
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
