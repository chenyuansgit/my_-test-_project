var db = require('../model/index').models;
var async = require('async');
var sequelize = require('../model/connect').sequelize;


exports.create = function (option, callback) {
    db.det_report.create(option).then(function (det_report) {
        callback(null, det_report);
    }).catch(function (e) {
        callback(e);
    });
};


exports.updateOneById = function (option, id, callback) {
    db.det_report.update(option, {
        where: {
            id: id
        }
    }).then(function (rows) {
        callback(null, rows);
    }).catch(function (e) {
        callback(e);
    });
};

exports.list = function (option, callback) {
    var timestamp = option.timestamp, page = option.page, status = option.status;
    async.parallel([
        function (_callback) {
            sequelize.query("select * from det_report where " + (status >= 1 ? 'status = :status and' : '') + " create_time < :timestamp order by create_time desc limit :offset,10", {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    timestamp: timestamp,
                    status: status,
                    offset: (page - 1) * 10
                }
            }).then(function (det_reports) {
                _callback(null, det_reports);
            }).catch(function (e) {
                _callback(e);
            });
        }, function (_callback) {
            sequelize.query("select count(*) as count from det_report where " + (status >= 1 ? 'status = :status and' : '') + " create_time < :timestamp", {
                type: sequelize.QueryTypes.SELECT,
                replacements: {
                    status: status,
                    timestamp: timestamp
                }
            }).then(function (count) {
                _callback(null, count[0].count);
            }).catch(function (e) {
                _callback(e);
            });
        }
    ], function (err, results) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            det_reports: results[0],
            pages: results[1] % 10 == 0 ? results[1] / 10 : (parseInt(results[1] / 10) + 1),
            page: page,
            count: results[1]
        });
    });
};



