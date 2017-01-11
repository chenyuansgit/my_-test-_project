// Load dependency
var solr = require('solr-client');
var util = require('util');
var fs = require('fs');

/*var jobClient = solr.createClient(
    '123.207.148.191',
    8983,
    'talentPool'//'company' //'internbird' //'talentPool'
);
var filePath = './name.txt';
*/

var jobClient = solr.createClient(
    '123.207.148.191',
    8983,
    'internbird'//'company' //'internbird' //'talentPool'
);
var filePath = './job.txt';

//var query = jobClient.createQuery();
//var q = query.q({ '*' : '*' }).rangeFilter({ field : 'user_id', start :0, end: '*', rows: 100, sort: 'desc' });

var q = jobClient.createQuery()
    .q('*')
    .fl('jid,name')
    .start(0)
    .rows(100000)
    .df("key")
    .qop("AND")
    .sort("refresh_time desc");

var request = jobClient
    .search(q, function(err, obj){
        console.log(err);
        var docs  = obj.response.docs;
        // 将结果写入文件
        for(let i = 0; i< docs.length; i++) {
            var item = util.inspect(docs[i], {showHidden: false, depth: null});
            fs.appendFileSync(filePath,docs[i].jid + ' ' +docs[i].name + '\r\n' , 'utf8');
        }
        var data = util.inspect(obj, {showHidden: false, depth: null});
        console.log('data:', data);
        //fs.writeFileSync('./name.txt', obj, 'utf8');
    });

request.setTimeout(200, function(){
    console.log('search timeout');
});


//console.log(q);
