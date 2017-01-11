var canvas = require('canvas');
var fn = require('./fn');
var fs = require('fs');


var getRandom = function (start, end) {
    return start + Math.random() * (end - start);
};
exports.toBuffer = function (option, callback) {
    var Canvas = new canvas(200, 100), Image = canvas.Image, ctx = Canvas.getContext('2d');
    var img;
    fs.readFile(__dirname + '/img/vcode-bg.png', function (err, squid) {
        if (err) throw err;
        img = new Image;
        img.src = squid;
        ctx.drawImage(img, 0, 0,200,100);
        // ctx.rotate(.1);
        // var code = "1234";
        // ctx.fillText(code, 8, 28);
        // var ctx = canvas.getContext('2d');
        var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = fn.ranStr(4);
        var font = '{FONTSIZE}px Sans-serif Impact';//"Bold Italic {FONTSIZE}px arial,sans-serif";//"13px sans-serif";
        var start = 20;
        var colors = ["rgb(35,209,217)"];
        var trans = {c: [-0.108, 0.108], b: [-0.05, 0.05]};
        var fontsizes = [60, 61, 62, 63, 64,65];
        for (var i = 0, len = code.length; i < len; i++) {
            ctx.font = font.replace('{FONTSIZE}', fontsizes[Math.round(Math.random() * 10) % 6]);
            ctx.fillStyle = colors[0];//"rgba(0, 0, 200, 0.5)";Math.round(Math.random()*10)%4
            ctx.fillText(code[i], start, 80, 100);
            ctx.fillRect();
            //con.translate(start,15);
            //ctx.transform(a,b, c, d, e, f);
            //参考：
            //a:水平缩放，default：1 ,取值：0.89,1.32,-0.56等,
            //b:y轴斜切，default：0 ,取值：-0.89,1.32等,
            //c:x轴斜切，default：0 ,取值：-0.89,1.32等,
            //d:垂直缩放，default：1 ,取值：-0.89，0.88,1.32等,
            //e:平移，default：0 ,取值：-53,52等,
            //f:纵称，default：0 ,取值：-53,52等,
            var c = getRandom(trans['c'][0], trans['c'][1]);
            var b = getRandom(trans['b'][0], trans['b'][1]);
            //alert(c+','+b);
            ctx.transform(1, b, c, 1, 0, 0);
            start += 40;
        }
        // ctx.strokeStyle = 'rgba(0,0,0.5,0.5)';
        // ctx.stroke();
        Canvas.toBuffer(function (err, buf) {
            callback(err, code, buf);
        });

    });
};