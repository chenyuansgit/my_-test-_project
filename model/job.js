var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("job", {
    jid: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    type: {type: _sequelize.STRING(16), allowNull: false, defaultValue: '', comment: '职位子类型'},
    type_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '职位子类型id'},
    parent_type: {type: _sequelize.STRING(16), allowNull: false, defaultValue: '', comment: '职位父类型'},
    parent_type_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '职位父类型id'},
    name: {type: _sequelize.STRING(64), allowNull: false, defaultValue: '', comment: '职位名称'},
    min_payment: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '最低薪资,日薪或者年薪'},
    max_payment: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '最高薪资,日薪或者年薪'},
    recruitment: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '职位需求人数'},
    workdays: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '实习时间,每周次数'},
    regular: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 0, comment: '可否转正:1 可以 0 不可以'},
    city: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '职位工作所在地'},
    city_id: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    address: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '工作具体地址'},
    education: {
        type: _sequelize.INTEGER(2),
        allowNull: false,
        defaultValue: 0,
        comment: '教育要求 0:不限  1：大专  2:本科  3:硕士  4:博士'
    },
    profession: {type: _sequelize.STRING(128), allowNull: false, defaultValue: 0, comment: '专业需求'},
    deadline: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '截止招收时间'},
    remarks: {type: _sequelize.STRING(1024), allowNull: false, defaultValue: 0, comment: '备注信息'},
    content: {type: _sequelize.TEXT, comment: '招聘内容'},
    state: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '职位状态 1:在线  2:下线  9:删除'},
    company_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0, comment: '发布者公司id'},
    user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '发布者用户id'},
    refresh_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, comment: '职位刷新时间'},
    channel_type: {type: _sequelize.INTEGER(2), allowNull: false, defaultValue: 1, comment: '职位来源类型 1.普通实习 3.校招'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    recommend_id: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0, comment: '职位推荐分类id'}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['company_id', 'user_id']
        }
    ]
});
