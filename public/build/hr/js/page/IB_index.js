//首页
require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery':{
            exports:'$'
        },
        'js/plugin/jquery.SuperSlide': {
            deps:['js/lib/IB_jquery'],
            exports: 'jQuery'
        }
    }
});
require(['js/lib/IB_jquery', 'js/lib/IB_fastclick', 'js/lib/jquery-ui/widgets/IB_autocomplete','js/common/IB_fn','js/common/IB_tucao','js/common/IB_job_type','js/common/IB_regex','js/plugin/jquery.SuperSlide'], function ($, FastClick, autocomplete, fn, ScrollViewer,job_types,regex,jQuery) {
    $(function(){

        //加载实习类别
        //一级类别
        var job_type = $("#main-nav-content");
        for(var i in job_types) {
            var mainType = "<li>"+job_types[i].parent_type_name+"</li>";
            job_type.find(".main-nav-box").append(mainType);
            job_type.append("<div class='sub-nav-box'><ul></ul></div>");
            //二级类别
            var subTypeList = job_types[i].sub_types;
            for(var j=0; j<subTypeList.length; j++) {
                var subType = "<li><span><a href='/j/search?k="+subTypeList[j].group_name+"&amp;jt="+subTypeList[j].group_id+"'>"+subTypeList[j].group_name+"</a></span></li>";
                job_type.find(".sub-nav-box ul").eq(i).append(subType);
                //三级类别
                var subNextTypeList = subTypeList[j].group_values;
                for(var z =0; z<subNextTypeList.length; z++) {
                    var subNextType = "<a href='/j/search?k="+subNextTypeList[z].sub_type_name+"&amp;jt="+subTypeList[j].group_id+"'>"+subNextTypeList[z].sub_type_name+"</a>";
                    var as = $(".sub-nav-box ul").eq(i).find("li").eq(j);
                    as.append(subNextType);
                }
            }
        }

        $('.adv-small-img').hover(function(){
            $(this).parents(".adv-small").find(".adv-info").css({"top":"0"});
        },function(){
            $(this).parents(".adv-small").find(".adv-info").css({"top":"-112px"});
        });

       /* $(".adv-small-img").hover(function () {
           var $this = $(this);
            if(!$this.hasClass("cur")) {
                $this.addClass("cur");
                $this.parents(".adv-small").find(".adv-info").css({"top":"0"});
            }
            else {
                $this.removeClass("cur");
                $this.parents(".adv-small").find(".adv-info").css({"top":"-112px"});
            }
        });*/

        //鼠标进入
        $(document).on("hover", ".main-nav-box li", function() {
            $(".main-nav-box li").css({"text-decoration":"","color":""});
            $(".triangle-1, .triangle-2").remove();
            $(".sub-nav-box").css("display","none");
            //处理当前对象
            var $this = $(this);
            $this.css({"text-decoration":"underline", "color":"#00d1ce"}).append("<span class='triangle-1'></span><span class='triangle-2'></span>");
            var i = $this.index();
            $(".sub-nav-box").eq(i).css("display","block");

        });

        //鼠标离开事件
        $("#main-nav-content").hover(function(){
            },function(){
                $(".main-nav-box li").css({"text-decoration":"","color":""});
                $(".triangle-1, .triangle-2").remove();
                $(".main-nav-content, .sub-nav-box").css("display","none");
                //$(".index-search-box-sel").removeClass("active");
            });

        //鼠标离开事件
        $(".index-search-box-sel").hover(function(e){
            $(".icon-drop-down").remove();
            $(this).append("<span class='icon-drop-up'></span>");
            $(".main-nav-content").css("display","block");
        },function(e){
            var $this = $(this);
            var l = $this.offset().left;
            var t = $this.offset().top;
            /*console.log(t);
            console.log(e.pageY);*/
            $(".icon-drop-up").remove();
            $(this).append("<span class='icon-drop-down'></span>");
            if(e.pageY < t || e.pageX < l || e.pageX > l+140) {
                $(".main-nav-content").css("display","none");
            }
        });
        /*$(".index-search-box-sel").hover(function(e){
            var $this = $(this);
            var l = $(this).offset().left;
            var t = $(this).offset().top;
            if(e.pageY < t-32 || e.pageX < l || e.pageX > l+140) {
                $(".main-nav-content").css("display","none");
            } else
                $(".main-nav-content").css("display","block");
        });*/

        //搜索
        $(".index-search-box-btn").click(function(){
            var k  = encodeURIComponent($("#searchInput").val().trim());
            if(k){
                var url = "/j/search?k="+k;
                location.href= url;
            }else{
                location.href= "/j/search";
            }
        });
        $("#searchInput").bind('keypress',function(event){
            var k  = encodeURIComponent($("#searchInput").val().trim());
            if(k && event.keyCode == "13"){
                var url = "/j/search?k="+k;
                location.href= url;
            }
        });
        $("#searchInput").autocomplete({
            source:[],
            select:function(event, ui){
                var url = "/j/search?k="+encodeURIComponent(ui.item.label);
                location.href= url;
            }
        });
        var showSearchSuggest = function(){
            var key = encodeURIComponent($("#searchInput").val().trim());
            $.ajax({
                type:"get",
                url:"/j/search/suggest",
                dataType:"json",
                data:{
                    key:key
                },
                success:function(data){
                    if(data.status == 10000){
                        if(data.data.length>0){
                            $( "#searchInput" ).autocomplete({
                                source: data.data
                            });
                        }
                    }
                }
            });
        };
        fn.inputListener($("#searchInput"),showSearchSuggest);

        //最新职位与热门职位切换
        $(document).on("click",".title-option",function(){
            $(".title-option.on").removeClass("on").find(".icon-sel-up").remove();
            if($(this).hasClass("title-option-hot")){
                $(this).addClass("on").append("<span class='icon-sel-up'></span>");
                $(".jobs-area-hot").show();
                $(".jobs-area-new,.jobs-area-youth,.jobs-area-abbr").hide();
            }else if($(this).hasClass("title-option-new")){
                $(this).addClass("on").append("<span class='icon-sel-up'></span>");
                $(".jobs-area-new").show();
                $(".jobs-area-hot,.jobs-area-youth,.jobs-area-abbr").hide();
            }else if($(this).hasClass("title-option-youth")){
                $(this).addClass("on").append("<span class='icon-sel-up'></span>");
                $(".jobs-area-youth").show();
                $(".jobs-area-hot,.jobs-area-new,.jobs-area-abbr").hide();
            } else {
                $(".title-option-abbr").addClass("on").append("<span class='icon-sel-up'></span>");
                $(".jobs-area-abbr").show();
                $(".jobs-area-hot,.jobs-area-new,.jobs-area-youth").hide();
            }

        });

        /*吐槽*/
        $(".tucao-bar").click(function(){
            $(".sel-bar").css("left","0px");
            $(".sel-mark").text("0");
            $(".sel-percent").css("width","0px");
            $(".sel-result").text("");
            $(".popBox-tucao,.overlay").show();
            $('.tucao-contact, .tucao-text').val("");
            $(".tucao-text").parent().css("border","");
            $(".tucao-error, .contact-error").hide();

        });
        $(".popBox-tucao .console,.overlay").click(function(){
            //重置吐槽默认值
            $(".sel-bar").css("left","0px");
            $(".sel-mark").text("0");
            $(".sel-percent").css("width","0px");
            $(".sel-result").text("");
            $(".popBox-tucao,.overlay, .tucao-error, .contact-error, .contact-none").hide();
        });

        $('.tucao-contact').keyup(function(){
            $(".contact-none").hide();
            var tucaoContact = $('.tucao-contact').val().trim();
            /*if(!tucaoContact.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/))*/
           /* if(regex.email.test(tucaoContact) || regex.phone.test(tucaoContact) || regex.qq.test(tucaoContact))
                $(".contact-error").hide();*/
            if(regex.phone.test(tucaoContact) || regex.qq.test(tucaoContact))
                $(".contact-error").hide();
            else
                $(".contact-error").show();
        });

        $('.tucao-text').keydown(function(){
            if($.trim($('.tucao-text').val()).length > 0)
                $(".tucao-text").parent().css("border","1px solid #eee");
        });

        $(".popBox-tucao .confirm").click(function(){//提交反馈信息
            if($.trim($('.tucao-text').val()).length<=0)
                return $(".tucao-text").parent().css("border","1px solid #f00");
            var tucaoContact = $('.tucao-contact').val().trim();
            //验证
            if(tucaoContact == "")
                return $(".contact-none").show();
            /*if(!tucaoContact.match(/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/))
                return $(".contact-error").show();*/
           /* if(regex.email.test(tucaoContact) || regex.phone.test(tucaoContact) || regex.qq.test(tucaoContact))
                $(".contact-error").hide();*/
            if(regex.phone.test(tucaoContact) || regex.qq.test(tucaoContact))
                $(".contact-error").hide();
            else
                return $(".contact-error").show();
            var visualness = parseInt($(".sel-item #visualness").text());
            var easiness = parseInt($(".sel-item #easiness").text());
            var practicability = parseInt($(".sel-item #practicability").text());
            var service = parseInt($(".sel-item #service").text());
            if(visualness == 0 || easiness == 0 || practicability == 0 || service == 0)
                return $(".tucao-error").show();
            //判断邮箱或者手机号
            var option;
           /* if(regex.email.test(tucaoContact)) {
                option = {
                    visualness:visualness,
                    easiness:easiness,
                    practicability:practicability,
                    service:service,
                    content:$.trim($('.tucao-text').val()),
                    email:tucaoContact
                };
            } else */if(regex.phone.test(tucaoContact)) {
                option = {
                    visualness:visualness,
                    easiness:easiness,
                    practicability:practicability,
                    service:service,
                    content:$.trim($('.tucao-text').val()),
                    phone:tucaoContact
                };
            } else if(regex.qq.test(tucaoContact)) {
                option = {
                    visualness:visualness,
                    easiness:easiness,
                    practicability:practicability,
                    service:service,
                    content:$.trim($('.tucao-text').val()),
                    qq:tucaoContact
                };
            }

            $.ajax({
                url:"/api/feedback",
                type:"post",
                data:{
                    option:option
                },
                dataType:"json",
                success:function(data){
                    if(data.status===10000){
                        $(".tucao-success").show();
                        setTimeout("$('.popBox-tucao,.overlay, .tucao-error, .contact-error, .contact-none, .tucao-success').hide()",800);
                    }
                }
            });
        });

        /*实例化吐槽滚动条*/
        new ScrollViewer(0);
        new ScrollViewer(1);
        new ScrollViewer(2);
        new ScrollViewer(3);

        jQuery(".fullSlide").slide({ titCell:".hd ul", mainCell:".bd ul", effect:"leftLoop", vis:"auto", autoPlay:true, autoPage:true, trigger:"click" });

        /*var swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            // 如果需要前进后退按钮
            nextButton: '.next-btn',
            prevButton: '.prev-btn',
            paginationClickable: true,
            speed: 600,
            autoplay: 4000,
            autoplayDisableOnInteraction: false,
            preventClicks:false,
            preventClicksPropagation:true,
            loop: true
        });
        $(".swiper-slide").hover(function(){
            swiper.stopAutoplay();
        });
        $(".swiper-slide").mouseleave(function(){
            // swiper.slideNext();
            swiper.startAutoplay();
        });*/
    });
//分类
    /*function getClassBox(job_types){
        var naves = "<div class='naves'>";
        for(var i=0,len=job_types.length;i<len;i++){
            var navBox = "<div class='nav-box'>";
            var mainBox = "<div class='main-nav-content'><h3>"+job_types[i].parent_type_name+"<span></span></h3>";
            var rand = 5;
            var subBox = "<div class='sub-nav-content'>";
            var groups = job_types[i].sub_types;
            for(var j= 0,sub_len = groups.length;j<sub_len;j++){
                var groupBox = "<dl><dt><a href='/j/search?k="+groups[j].group_name+"&jt="+groups[j].group_id+"'>"+groups[j].group_name+"</a></dt><dd>";
                var values = groups[j].group_values;
                for(var k = 0,group_len = values.length;k<group_len;k++){
                    groupBox +="<a href='/j/search?k="+values[k].sub_type_name+"&jt="+groups[j].group_id+"'>"+values[k].sub_type_name+"</a>";
                    if(rand){
                        mainBox +="<a href='/j/search?k="+values[k].sub_type_name+"&jt="+groups[j].group_id+"'>"+values[k].sub_type_name+"</a>";
                        rand --;
                    }
                }
                groupBox+="</dl>";
                subBox += groupBox;
            }
            mainBox += "</div>";
            subBox += "</div>";
            navBox += mainBox +subBox +"</div>";
            naves +=navBox;
        }
        naves += "</div>";
        return naves;
    }*/
});
