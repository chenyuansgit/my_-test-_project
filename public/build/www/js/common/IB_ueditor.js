;(function(){
    var ueUtil = {
        /*实例化UEditor*/
        getEditor : function(textID,height,maxWords){
            var ue = UE.getEditor(textID,{
                toolbars: [
                    [
                        'insertorderedlist', //有序列表
                        'insertunorderedlist'//无序列表
                    ]
                ],
                retainOnlyLabelPasted : true,
                pasteplain: true,
                elementPathEnabled : false,
                maximumWords:maxWords,
                insertorderedlist:{
                    'num':'1,2,3...'
                },
                insertunorderedlist:{
                    'disc': ''// '● 小圆点'
                },
                fontfamily:[ {
                    label: '',
                    name: 'yahei',
                    val: '微软雅黑,Microsoft YaHei'
                }],
                initialFrameHeight:height,
                autoHeightEnabled:false
            });
            return ue;
        },
        getEditorPosition : function(textID,height,maxWords){
            var ue = UE.getEditor(textID,{
                toolbars: [
                    [
                        'bold', //加粗
                        'indent', //首行缩进
                        'underline', //下划线
                        'insertorderedlist', //有序列表
                        'insertunorderedlist',//无序列表
                        'undo', //撤销
                        'redo' //重做
                    ]
                ],
                retainOnlyLabelPasted : true,
                pasteplain: true,
                elementPathEnabled : false,
                maximumWords:maxWords,
                insertorderedlist:{
                    'num':'1,2,3...'
                },
                insertunorderedlist:{
                    'disc': ''// '● 小圆点'
                },
                fontfamily:[ {
                    label: '',
                    name: 'yahei',
                    val: '微软雅黑,Microsoft YaHei'
                }],
                initialFrameHeight:height,
                autoHeightEnabled:false
            });
            return ue;
        },
        getPlainContent : function(content){
            var objE = document.createElement("div");
            objE.innerHTML = content;
            var tags = objE.getElementsByTagName('*');
            for(var i=0,len=tags.length;i<len;i++){
                tags[i].removeAttribute('style');
            }
            return objE.innerHTML;
        }
    };
    if(typeof define == 'function' && define.amd){
        define([],function(){
            return ueUtil;
        });
    }else{
        window.ueUtil = ueUtil;
    }
})();


















