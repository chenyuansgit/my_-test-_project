var _sequelize = require('./connect').Sequelize;
var sequelize = require('./connect').sequelize;

module.exports = sequelize.define("article", {
    id: {type: _sequelize.INTEGER(11), primaryKey: true, autoIncrement: true},
    title: {type: _sequelize.STRING(32), allowNull: false, defaultValue: ''},
    author: {type: _sequelize.STRING(16), allowNull: false, defaultValue: ''},
    cover:{type: _sequelize.STRING(256), allowNull: false, defaultValue: '', comment:'封面'},
    category_id: {type: _sequelize.INTEGER(4), allowNull: false, defaultValue: 0},
    summary: {type: _sequelize.STRING(128), allowNull: false, defaultValue: ''},
    content: {type: _sequelize.TEXT, allowNull: true},
    status: {type: _sequelize.INTEGER(1), allowNull: false, defaultValue: 1},
    create_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0},
    update_time: {type: _sequelize.BIGINT(16), allowNull: false, defaultValue: 0}
}, {
    freezeTableName: true,
    indexes: [
        {
            unique: false,
            fields: ['category_id']
        },
        {
            unique: false,
            fields: ['status']
        }
    ]
});