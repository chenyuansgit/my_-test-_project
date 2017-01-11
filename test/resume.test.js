var request = require('request');
var should = require('should');

var j = request.jar();

//var url = "http://localhost:8088/talentPool/list?cid=&jt=&mp=0&wk=&dt=&et=&ava=&page=1";
var url = "http://localhost:8088/talentPool/list";
//var url = "http://localhost:8088/quickRecruit";

//var url = "http://localhost:8088/talentPool/list?cid=&jt=905&mp=&wk=&dt=&et=4&ava=&page=1";

/*
var url = "http://hr.internbird.com/talentPool/list?cid=&jt=&mp=0&wk=&dt=&et=&ava=&page=1";*/
var cookie = "IB_SESSION_ID=s%3AtQYqczT9bKhmWwvOT595omXY8R2ennoC.ilYw5owiC6qZlpKKr9sIPEnOlUzDujHL8e1%2Bhy%2FAtUc; intern_list_ts=1483773685854; Hm_lvt_5f6b35b51a25201f1ab8f0a8ce96e6ec=1483500938; Hm_lpvt_5f6b35b51a25201f1ab8f0a8ce96e6ec=1483773685";

var base = 'http://hr.internbird.com';
j.setCookie(cookie, base);


var option = {
    url: url,
    //rejectUnauthorized: false,
    jar: j, // 设置cookie
    headers: {
        referrer: 'http://hr.internbird.com/myCompany',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
    }
};


request.get(option, function (err, httpResponse, body) {
    //console.log(httpResponse);
    //body.should.containEql('LILI');
    console.log(body);
});
