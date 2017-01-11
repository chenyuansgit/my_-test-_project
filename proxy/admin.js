var db = require('../model/index').models;

exports.findOneByName = function (account_name, callback) {
    db.admin.findOne({
        where: {
            account_name: account_name
        }
    }).then(function (admin) {
        callback(null, admin ? admin.dataValues : null);
    }).catch(function (e) {
        callback(e);
    });
};
exports.findOneByOption = function (option, callback) {
    db.admin.findOne(option).then(function (admin) {
        callback(null, admin);
    }).catch(function (e) {
        callback(e);
    });
};
exports.create = function (option, callback) {
    db.admin.create(option).then(function (admin) {
        callback(null, admin.dataValues);
    }).catch(function (e) {
        callback(e);
    });
};

exports.updateOneByName = function (option, account_name, callback) {
    db.admin.update(option, {
        where: {
            account_name: account_name
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};