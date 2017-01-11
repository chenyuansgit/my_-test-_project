var express = require('express');
var proxy = require("../../proxy/index");
require('../../common/fn');


exports.firmPage = function (req, res) {
    res.render('recruit/firmManage');
};
exports.positionPage = function (req, res) {
    res.render('recruit/positionManage');
};
exports.reportPage = function (req, res) {
    res.render('recruit/reportManage');
};

