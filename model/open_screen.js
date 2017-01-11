var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("open_screen", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    desc: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '广告描述'},
    img320: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '开屏尺寸:320*480'},
    img480: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '开屏尺寸:480*800'},
    img720: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '开屏尺寸:720*1280'},
    img750: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '开屏尺寸:750*1334'},
    img1080: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '开屏尺寸:10800*1920'},
    url: {type: _sequelize.STRING(128), allowNull: false, defaultValue: '', comment: '跳转地址'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true
});