var resp_status_builder = require('../../common/response_status_builder.js');
var poxy = require('../../proxy');
var logger = require("../../common/log").logger("index");

require('../../common/fn');

var sizeArray = [
    '750*1334',
    '320*480',
    '480*800',
    '720*1280',
    '1080*1920'
];

exports.getDetail = function (req, res) {
    var size = req.query.size;
    if (!size || sizeArray.indexOf(size) === -1) {
        return res.json(resp_status_builder.build(10002));
    }
    var width = size.split('*')[0];

    poxy.open_screen.getLatest(function (err, open_screen) {
        if (err) {
            logger.error(err);
            return res.json(resp_status_builder.build(10005));
        }
        open_screen = open_screen.state == 2 ? {} : open_screen;
        res.json(resp_status_builder.build(10000, (+new Date - req.start_time) + 'ms', {
            img: open_screen['img' + width] || '',
            redirect_url: open_screen.url || ''
        }));
    });
};