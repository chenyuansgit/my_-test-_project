var officegen = require('officegen');
var fs = require('fs');
var path = require('path');
var md5 = require('md5');
var db = require('../../model/index').models;
var logger = require("../../common/log").logger("index");

exports.resume_doc_download = function (req, res) {
    var rid = req.params.rid;
    var doc_rid = md5(rid + "resume");

    db.resume.findOne({
        where: {
            rid: rid
        }
    }).then(function (resume) {
        var docx = officegen('docx');
        docx.on('finalize', function (written) {
            //console.log ( 'Finish to create Word file.\nTotal bytes created: ' + written + '\n' );
            res.redirect('/public/docx/' + doc_rid + '.docx');
        });

        docx.on('error', function (err) {
            res.json({
                desc: "server error" + err,
                status: 10005
            });
        });
        console.log(resume.dataValues);
        function create_p(data) {
            for (var i in data) {
                if (typeof data[i] === 'object') {
                    create_p(data[i])
                } else {
                    var pObj = docx.createP();
                    pObj.addText(i + ":" + data[i], {font_face: 'Arial', font_size: 28});
                    pObj.addLineBreak();
                }
            }
        }

        create_p(resume.dataValues);

        var out = fs.createWriteStream(path.resolve(__dirname, '../public/docx/' + doc_rid + '.docx'));

        out.on('error', function (err) {
            logger.error(err);
            console.log(err);
        });

        docx.generate(out);
    });
};

