/**
 * Created by zhphu on 16/9/1.
 */
;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_jquery', 'js/lib/IB_cropper'], function(){
            factory(1,$,cropper);
        });
    } else if (typeof exports === 'object') { // Node/CommonJS
        module.exports = factory(require('jquery', 'cropper'));
    } else {
        factory(0,window.jQuery);
    }
})(function (require,$,cropper) {
    var CROPPER = {};
    CROPPER.getCropper = function(cropperID,user_options){
        var cropper = new Cropper($("#"+cropperID),user_options);
        cropper.init($("#"+cropperID));
        return cropper;
    };
    var Cropper = function ($cropper,user_options) {
        var defaults = {
            width: 200,
            height: 200,
            ratio : 1,
            btn:{
                zoomIn : "",
                zoomOut : "",
                moveLeft : "",
                moveRight : "",
                moveUp : "",
                moveDown : ""
            }

        };
        this.init = function () {
            defaults = $.extend({}, defaults, user_options);
            //事件绑定
            for(btn in defaults.btn){
                if( defaults.btn[btn]){
                    var $btn = $(defaults.btn[btn]);
                    switch (btn){
                        case "zoomIn" : $btn.click(function () {
                           bind.zoomIn();
                        });break;
                        case "zoomOut" : $btn.click(function () {
                            bind.zoomOut();
                        });break;
                        case "moveLeft" : $btn.click(function () {
                            bind.moveLeft();
                        });break;
                        case "moveRight" : $btn.click(function () {
                            bind.moveRight();
                        });break;
                        case "moveUp" : $btn.click(function () {
                            bind.moveUp();
                        });break;
                        case "moveDown" : $btn.click(function () {
                            bind.moveDown();
                        });break;
                    }
                }
            }

        };
        this.refresh = function(data,callback){
            util.refresh(data);
            if(callback && typeof callback === 'function'){
                callback();
            }
        };
        this.getCroppedData = function (callback) {
          return util.getBase64Data(util.getCroppedCanvas());
        };

        var util = {
            refresh : function(data){
                $cropper.cropper("destroy");
                $cropper.attr("src",data).cropper({
                    aspectRatio: defaults.ratio,
                    getCroppedCanvas:{
                        width: defaults.width,
                        height: defaults.height
                    }
                });
            },
            getCroppedCanvas : function(){
                return $cropper.cropper('getCroppedCanvas');
            },
            getBase64Data : function(canvas){
               return  canvas.toDataURL("image/png");
            }
        };
        var bind = {
            zoomIn : function () {
                $cropper.cropper('zoom',0.1);
            },
            zoomOut : function(){
                $cropper.cropper('zoom',-0.1);
            },
            moveLeft :function(){
                $cropper.cropper('move',-10,0);
            },
            moveRight: function(){
                $cropper.cropper('move',10,0);
            },
            moveUp: function(){
                $cropper.cropper('move',0,10);
            },
            moveDown : function(){
                $cropper.cropper('move',0,-10);
            }
        };
    };

    
    if(require){
        return CROPPER;
    }
    window.CROPPER = CROPPER;
});
