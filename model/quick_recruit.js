var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("quick_recruit", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    term_id: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 1,comment:'快招期数:1,2,3..'},
    resume_id: {type: _sequelize.BIGINT(20), allowNull: false, defaultValue: 0},
    user_id: {type: _sequelize.BIGINT(20), allowNull: false, defaultValue: 0},
    title: {type: _sequelize.STRING(32), allowNull: false, defaultValue: ''},
    summary: {type: _sequelize.STRING(64), allowNull: false, defaultValue: ''},
    content: {type: _sequelize.TEXT('medium'), allowNull: true},
    img: {type: _sequelize.STRING(256), allowNull: false, defaultValue: ''},
    status: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 2},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    release_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0,comment:'快招发布时间'},
    //category_id:{type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0},
    version:{type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});