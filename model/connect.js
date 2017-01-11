var Sequelize = require("sequelize");
var config = require('../config_default').config;
exports.sequelize = new Sequelize(config.database.db, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
    pool: config.database.pool,
    define: {
        engine: 'InnoDB',
        timestamp: false,
        createdAt: false,
        updatedAt: false,
        charset: 'utf8mb4'
    }
});
exports.Sequelize = Sequelize;