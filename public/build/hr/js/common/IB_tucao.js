;(function(){
    //吐槽滚动条 Start
    var ScrollViewer = function (i) {
        var BarC = $(".sel-item li").eq(i).find(".sel-bar"),   //滚动按钮
            BarP = $(".sel-item li").eq(i).find(".sel-percent"),  //百分比
            BarI = $(".sel-item li").eq(i).find(".sel-mark"),    //分数
            BarS = $(".sel-item li").eq(i).find(".sel-result"),   //结果
            SelBg = $(".sel-item li").eq(i).find(".sel-progress"),  //滚动条背景
            BarCMove=false,
            BarCX;
        BarC.mousedown(function(e){
            BarCMove=true;
            var BarBX = parseInt(BarC.css("left"));
            BarCX=e.pageX-BarBX;
            e.stopPropagation();
        });
        $(document).mousemove(function(e){
            if(BarCMove){
                var PageX = e.pageX;
                var CX=PageX-BarCX;
                if(CX<=0){
                    CX=0
                }else if(CX>=200){
                    CX = 200
                }else{
                    CX = PageX - BarCX;
                }
                BarC.css({"left":CX-2+"px"});
                BarP.css({"width":CX+"px"});
                BarI.text(Math.ceil(CX/200/2*10));
            }
            e.stopPropagation();
        }).mouseup(function(e){
            if(BarCMove) {
                var uPageX = e.pageX;
                var uCX=uPageX-BarCX;
                if(uCX<=0){
                    uCX=0
                }else if(uCX>=200){
                    uCX = 200
                }else{
                    uCX = uPageX - BarCX;
                }

                var upLocate = Math.ceil(uCX/200/2*10)*40;
                BarC.css({"left":upLocate-2+"px"});
                BarP.css({"width":upLocate+"px"});
                switch (Math.ceil(uCX/200/2*10)) {
                    case 1:
                        BarS.text("失望");
                        break;
                    case 2:
                        BarS.text("不满");
                        break;
                    case 3:
                        BarS.text("一般");
                        break;
                    case 4:
                        BarS.text("满意");
                        break;
                    case 5:
                        BarS.text("惊喜");
                        break;
                    default:
                        BarS.text("");
                        break;
                }
            }
            BarCMove=false;
            if(parseInt($("#visualness").text()) != 0 && parseInt($("#easiness").text()) !=0 && parseInt($("#practicability").text()) !=0 && parseInt($("#service").text()) !=0 )
                $(".tucao-error").hide();
            e.stopPropagation();
        });

        //点击滚动条
        SelBg.mousedown(function (e) {
            var curX = e.offsetX;
            if(curX <= 5 ) {
                BarC.css({"left": "-2px"});
                BarP.css({"width": "0px"});
                BarI.text("0");
                BarS.text("");
            } else {
                var upLocate = Math.ceil(curX / 200 / 2 * 10) * 40;
                BarC.css({"left": upLocate - 2 + "px"});
                BarP.css({"width": upLocate + "px"});
                BarI.text(Math.ceil(curX/200/2*10));
                switch (Math.ceil(curX / 200 / 2 * 10)) {
                    case 1:
                        BarS.text("失望");
                        break;
                    case 2:
                        BarS.text("不满");
                        break;
                    case 3:
                        BarS.text("一般");
                        break;
                    case 4:
                        BarS.text("满意");
                        break;
                    case 5:
                        BarS.text("惊喜");
                        break;
                    default:
                        BarS.text("");
                        break;
                }
            }
            if(parseInt($("#visualness").text()) != 0 && parseInt($("#easiness").text()) !=0 && parseInt($("#practicability").text()) !=0 && parseInt($("#service").text()) !=0 )
                $(".tucao-error").hide();
            e.stopPropagation();
        });
        //吐槽滚动条 End
    };
    if(typeof define == 'function' && define.amd){
        define(["js/lib/IB_jquery"],function(){
            return ScrollViewer;
        });
    }else{
        window.ScrollViewer = ScrollViewer;
    }
})();


















