var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("ad", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    type_id:{type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0,comment:'广告类型:1.职位 2.公司 3.内部其他页面(包含活动,说明等)  4.第三方页面 5包打听职位'},
    title: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    sub_title: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    desc: {type: _sequelize.STRING(128), allowNull: false, defaultValue: ''},
    image: {type: _sequelize.STRING(256), allowNull: false, defaultValue: '{}'},
    url: {type: _sequelize.STRING(128), allowNull: false, defaultValue: ''},
    category_id: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0},
    status: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 1},
    start_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    end_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    order: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});