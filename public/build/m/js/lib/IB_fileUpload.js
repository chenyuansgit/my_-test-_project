;(function(factory){
    if(typeof define === 'function' && define.amd){
        define(['js/lib/IB_fn', 'js/lib/IB_qiniu', 'js/lib/IB_md5'], function(fn,Qiniu,md5){
            return factory(1,fn,Qiniu,md5);
        });
    }else{
        factory(0,fn,Qiniu,md5);
    }
})(function(requirejs,fn,Qiniu,md5){
    var fileUpload = function(string,elementId,callback,before){
        Qiniu.uploader({
            runtimes: 'html5,flash,html4',    //上传模式,依次退化
            browse_button: elementId,       //上传选择的点选按钮，**必需**
            uptoken_url: '/api/upload/upToken?mediaType=image',            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
            // downtoken_url: '/downtoken',
            // Ajax请求downToken的Url，私有空间时使用,JS-SDK将向该地址POST文件的key和domain,服务端返回的JSON必须包含`url`字段，`url`值为该文件的下载地址
            // uptoken : '<Your upload token>', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            unique_names: false, // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
            save_key: false,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
            domain: 'http://qiniu-plupload.qiniudn.com/',
            get_new_uptoken: false,  //设置上传文件的时候是否每次都重新获取新的token
            //  container: 'container',           //上传区域DOM ID，默认是browser_button的父元素，
            max_file_size: '5mb',           //最大文件体积限制
            flash_swf_url: '/public/build/m/flash/Moxie.swf',  //引入flash,相对路径
            max_retries: 3,                   //上传失败最大重试次数
            dragdrop: true,                   //开启可拖曳上传
            drop_element: 'container',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
            chunk_size: '5mb',                //分块上传时，每片的体积
            auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传,
            init: {
                'FilesAdded': function (up, files) {
                    //alert('FilesAdded');
                    plupload.each(files, function (file) {
                        // 文件添加进队列后,处理相关的事情
                    });
                },
                'BeforeUpload': function (up, file) {
                    // 每个文件上传前,处理相关的事情
                    before&&before();
                },
                'UploadProgress': function (up, file) {
                    // 每个文件上传时,处理相关的事情
                },
                'FileUploaded': function (up, file, info) {
                    var avatar = "http://image.internbird.com/" + JSON.parse(info).key;
                    callback(null,avatar);
                },
                'Error': function (up, err, errTip) {
                    alert('error');
                    //上传出错时,处理相关的事情
                    callback(err);
                },
                'UploadComplete': function (data) {
                    //alert('UploadComplete');
                    //队列文件处理完毕后,处理相关的事情
                },
                'Key': function (up, file) {
                    var key = md5(string) + "/" + md5(+new Date) + ".png";
                    return key;
                }
            }
        });
    };
    if(requirejs) return fileUpload;
    window.fileUpload = fileUpload;
});
