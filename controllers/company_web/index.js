exports.home = function (req, res) {
    res.redirect('http://' + res.locals.host.hr + '/myCompany');
};