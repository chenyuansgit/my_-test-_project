var solr = require('solr-client');

var host = 'localhost';
var port = 8983;
var core = 'test';

var options = {
    host: 'localhost',
    port: 8983,
    core: 'test'
};

//var client = solr.createClient(host, port, core);
var client = solr.createClient(options);
client.autoCommit = true; // 自动提交


// 添加文档
client.add({
     //id: 1, // 添加的时候可以输入id也可以不输入
     name: '黄金时代',
     number: '88888'
 }, {
     boost: '1.0',
     commitWithin: '1000',
     overwrite: true,
     //wt: 'json'
 }, function(err, obj){
     if(err) {
        console.log('add err:', err);
     } else {
        console.log('add obj:', obj);
     }
 });

// 更新文档
client.add({
    id: 6, // id存在时，更新
    name: '黄金时代updateupdate',
    number: '88888' // number必须为数字
},{
    boost: '1.0',
    commitWithin: '100',
    overwrite: true,
    //wt: 'json'
}, function (err, obj) {
    if (err) {
        console.log('update err:', err);
    } else {
        console.log('update obj:', obj);
    }
});


// 删除文档
client.deleteByID('1', {
    boost: '1.0',
    commitWithin: '1000',
    overwrite: true,
},function (err, obj) {
    if (err) {
        console.log('delete err:', err);
    } else {
        console.log('delete obj:', obj);
    }
});

// 创建查询条件

var q = client.createQuery()
    .q('*')
    .start(0)
    .rows(100000);

q.matchFilter('name', '裤子');
q.matchFilter('number', '[0 TO 300]'); // 表示数字的范围

// 查询文档
client.search(q, function (err, obj) {
    if (err) {
        console.log('search err:', err);
    } else {
        var docs = obj.response.docs;
        for (var i = 0; i < docs.length; i++) {
            console.log(docs[i].name, docs[i].id);
        }
        //console.log('search obj:', obj);
    }
});


/*
// 查询文档2（无效）
var query = client.createQuery();
query.q({'*':'*'}).rangeFilter([{ field : 'name', start : '水', end : '*'}]);

client.search(query, function (err, obj) {
    if (err) {
        console.log('search err:', err);
    } else {
        var docs = obj.response.docs;
        for (var i = 0; i < docs.length; i++) {
            console.log(docs[i].name, docs[i].id);
        }
        //console.log('search obj:', obj);
    }
});*/

/*
// 查询文档3(无效)
client.search({
    name: '水果'
}, function (err, obj) {
    if (err) {
        console.log('search err:', err);
    } else {
        var docs = obj.response.docs;
        for (var i = 0; i < docs.length; i++) {
            console.log(docs[i].name, docs[i].id);
        }
        console.log('search obj:', obj);
    }
});*/
