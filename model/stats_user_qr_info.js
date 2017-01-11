var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("stats_user_qr_info", {
    user_id: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0, primaryKey: true},
    invited_num :{type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0,comment:'被企业邀请次数'},
    accepted_num:{type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0,comment:'已接受邀请次数'},
    supported_num:{type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0,comment:'被支持次数'},
    deliveries: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0,comment:'投递次数'},
    views: {type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0,comment:'快招阅读次数'},
    today_visitor_num:{type: _sequelize.INTEGER(11), allowNull: false, defaultValue: 0,comment:'快招今日访客'},
    recent_visitor:{type: _sequelize.STRING(1024),allowNull: false, defaultValue: '',comment:'最近访客'},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['user_id']
        }
    ]
});