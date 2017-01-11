/**
 * Created by zhphu on 16/5/10.
 */
require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        },
        'js/lib/IB_iscroll': {
            exports: 'IScroll'
        }
    }
});
require(['js/lib/IB_zepto', 'js/lib/IB_fastclick', 'js/lib/IB_fn',"js/lib/IB_jobType",'js/lib/IB_wxAuth', 'js/lib/IB_jweixin',"js/lib/IB_swiper",'js/lib/IB_lazyload',"js/lib/IB_jobTypeSelector"], function ($, FastClick,fn,jobType, wxAuth, wx) {
    var shouldRequest, page = 0, loadListOk;
    var jt="",cid="",wk="",et="";
    var search_storage = {
        uid :"",
        options : {
            page : 1,
            jt : "",
            cid : "",
            wk : "",
            et : ""
        }
    };
    function getPositionType(position_type){
        var type_id = position_type.split(",");
        var type_text = [];
        for(var j=0,len=type_id.length;j<len;j++){
            var pid = parseInt(type_id[j].substr(0,1))-1;
            var sid = parseInt(type_id[j].substr(1)) ;
            if(pid>-1 && sid > -1){
                type_text.push(jobType[pid].sub_types[sid].group_name);
            }
        }
        return type_text.toString();
    }

    function LoadTopicList(scroll) {
        if (!loadListOk) return false;
        loadListOk = false;
        $('#loading').remove();
        if(!scroll){
            $('#list').empty();
        }
        $('#list').after("<div class='w100 loading tac' id='loading'><img src='" + baseUrl + "/img/loading.gif' class='loading_icon'></div>");
        if (scroll) {
            $(window).scrollTop($('#loading').offset().top);
        }
        var url = "/api/talentPool/list?page=" + (scroll ? (page + 1) : 1) +"&jt="+jt+"&cid="+cid+"&wk="+wk+"&et="+et;
        $.ajax({
            url: url,
            type: "get",
            dataType: "json",
            success: function (data) {
                if (data.status == 10000) {
                    $('#loading').remove();
                    page = parseInt(data.data.page);
                    search_storage.options.page = page;
                    setOptionStorage();
                    total = parseInt(data.data.pages);
                    var resumes = data.data.resumes;
                    var resume_num = resumes.length;
                    $(".new").removeClass('new');
                    var list_html = "";
                    for (var i = 0; i < resumes.length; ++i) {
                        var resume = resumes[i];
                        var eduHTML = '';
                        try{
                            var edu = JSON.parse(resume.education_detail);
                            eduHTML = "<div class='info school left ellipsis'>"+edu[0].school+"</div>\
                                       <div class='info right'>\
                                          <span class='major ellipsis'>"+edu[0].major+"</span>\
                                          <span class='ellipsis'>-</span>\
                                          <span class='stage ellipsis'>"+edu[0].stage+"</span>\
                                       </div>";

                        }catch(e){}
                        list_html += "<a href='/talentPool/detail/"+resume.user_id+"' class='talent "+(parseInt(resume.male)?'':'female')+"'>\
                                        <div class='talent-l'>\
                                            <div class='avatar new lazy' data-original='"+resume.avatar+"'></div>\
                                            <div class='name'>"+resume.name+"</div>\
                                        </div>\
                                        <div class='talent-r'>\
                                            <div class='info-line top'>\
                                                "+eduHTML+"\
                                            </div>\
                                            <div class='info-line  bottom'>\
                                                <div class='info left'>\
                                                    <i class='icon icon-city'></i>\
                                                    <span class='hope-city ellipsis'>"+resume.intern_expect_city+"</span>\
                                                </div>\
                                                <div class='info right'>\
                                                    <i class='icon icon-position'></i>\
                                                    <span class='hope-job-type ellipsis'>"+getPositionType(resume.intern_expect_position_type.toString())+"</span>\
                                                </div>\
                                            </div>\
                                         </div>\
                                       </a>";
                    }
                    $("#list").append(list_html);
                    shouldRequest = resume_num >=10?  1 : 0;
                    if(resume_num){
                        widthAdjust();
                    }else if(page<=1){
                        $('#list').after("<div class='w100 loading tac' id='loading'>没有符合条件的简历信息</div>");
                    }
                    $(".new.lazy").lazyload({
                        effect: "fadeIn"
                    });
                } else {
                    if(global.uid && global.uid != 'undefined'){
                        $('#loading').html('加载失败，请重试!');
                    }else{
                        $('#loading').html('登录后可查看更多简历信息');
                    }
                }
                loadListOk = true;
            },
            error: function () {
                if(global.uid && global.uid != 'undefined'){
                    $('#loading').html('加载失败，请重试!');
                }else{
                    $('#loading').html('登录后可查看更多简历信息');
                }
                loadListOk = true;
            }
        });
    }
    function citySelect(){
        $(".option-city").on("click", function () {
            showBlock($(".selector-mainCity"));
            $("input").blur();
        });
        $(".selector-mainCity .city-block").on("click", function () {
            var _cBlock = $(this);
            if (_cBlock.find(".cities").hasClass("curr")) {
                _cBlock.find(".cities").removeClass("curr");
            } else {
                $(".selector-mainCity .cities.curr").removeClass("curr");
                _cBlock.find(".cities").addClass("curr");
            }
        });
        $(".selector-mainCity .btn-close").on("click", function () {
            removeBlock($(".selector-mainCity"));
        });
        $(".selector-mainCity .city").on("click", function (e) {
            e.stopPropagation();
            if ($(this).hasClass('active')) return false;
            $('.selector-mainCity .city.active').removeClass('active');
            $(this).addClass('active');
            var cName = $(this).text().trim();
            cid = $(this).attr("data-cid");
            search_storage.options.cid = cid;
            setOptionStorage();
            LoadTopicList(0);
            if(cid){
                $(".option-city").addClass("on");
            }else{
                $(".option-city").removeClass("on");
            }
            removeBlock($(".selector-mainCity"));
        });
    }
    function selectBind(){
        $(".option").click(function(){
            var desSel = $(this).attr("data-for");
            showBlock($(".selector-"+desSel));
        });
        $(".btn-back").click(function(){
           var $sel = $(this).closest(".selector");
           removeBlock($sel);
        });
        $(".sel-content .sel-tab").on("click", function (e) {
            e.preventDefault();
            var $this = $(this);
            var $selector = $(this).closest(".selector");
            $selector.find(".sel-tab.curr").removeClass("curr");
            $(this).addClass("curr");
            var data = $(this).find("span").text().trim();
            var type = $(this).attr("data-type");
            var desc = $selector.attr("data-for");
            switch (desc){
                case "wk" :
                    wk = type;
                    search_storage.options.wk = wk;
                    if(wk){
                        $(".option-days").addClass("on");
                    }else{
                        $(".option-days").removeClass("on");
                    }
                    setOptionStorage();
                    break;
                case "et" :
                    et = type;
                    search_storage.options.et = et;
                    if(et){
                        $(".option-stage").addClass("on");
                    }else{
                        $(".option-stage").removeClass("on");
                    }
                    setOptionStorage();
                    break;
            }
            LoadTopicList(0);
            removeBlock($selector);
        });
    }
    function setOptionStorage(){
        if(global.uid && global.uid!="undefined"){
            fn.storage("qr_option",JSON.stringify(search_storage));
        }
    }

    function widthAdjust(){
        if(document.getElementsByClassName("left").length>0){
            var leftWidth = document.getElementsByClassName("left")[0].clientWidth;
            var rightWidth = document.getElementsByClassName("right")[0].clientWidth;
            if(leftWidth < rightWidth*0.6){
                leftWidth = rightWidth*0.6;
                $(".left").css("width",leftWidth+"px");
                $(".school").css("max-width",leftWidth);
                $(".info-line").css("padding-left",(leftWidth+5)+"px")
            }
            $(".right .hope-job-type,.right .major").css("max-width",rightWidth*0.6+"px");
        }
    }
    function removePopTips() {
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
    function removeBlock($block){
        $(".mr").css({"opacity":"1"/*,"position":"static"*/});
        $block.removeClass("flipRight").addClass("flipRightOut");
        setTimeout(function () {
            $block.removeClass("flipRightOut").hide();
        }, 600);
    }
    function showBlock($block){
        $block.show().addClass("animation_600 flipRight");
        setTimeout(function () {
            $(".mr").css({"opacity":"0"/*,"position":"absolute"*/});
        }, 600);

    }

    $(function () {
        FastClick.attach(document.body);
        loadListOk = true;
        shouldRequest = 1;
        var swiper = new Swiper('.swiper-container', {
            pagination: '.swiper-pagination',
            paginationClickable: true,
            speed: 600,
            autoplay: 4000,
            autoplayDisableOnInteraction: false,
            // preventClicks:false,
            // preventClicksPropagation:true,
            loop: true
        });


        //selector
        citySelect();
        selectBind();
        $(".option-jt").jobTypeSelector(function(data){
            jt = data.jid;
            search_storage.options.jt = jt;
            setOptionStorage();
            if(jt){
                $(".option-jt").addClass("on");
            }else{
                $(".option-jt").removeClass("on");
            }
            LoadTopicList(0);
            removeBlock($(".selector-jt"));
        });
        var validated = parseInt(global.validated);
        if(global.uid && global.uid!="undefined" && validated){
            var storage = fn.storage("qr_option")?JSON.parse(fn.storage("qr_option")):"";
            if(storage && storage.uid == global.uid){
                search_storage = storage;
                var options = storage.options;
                //page = parseInt(options.page);
                jt = options.jt || 0;
                cid = options.cid;
                wk = parseInt(options.wk) || 0;
                et = parseInt(options.et) || 0;
                $(".selector-stage .sel-tab").eq(et).addClass("curr");
                $(".selector-days .sel-tab").eq(wk).addClass("curr");
                if(wk){
                    $(".option-days").addClass("on");
                }
                if(et){
                    $(".option-stage").addClass("on");
                }
                if(cid){
                    $(".option-city").addClass("on");
                    $(".selector-mainCity .city").each(function(){
                        if(cid == $(this).attr("data-cid")){
                            $(this).addClass("active");
                            $(this).closest(".cities").show();
                            return false;
                        }
                    });
                }
                if(jt){
                    $(".option-jt").addClass("on");
                    var $selJt = $(".selector-jt");
                    var pid = parseInt(jt.charAt(0));
                    $selJt.find(".curr").removeClass("curr");
                    $selJt.find(".main-type").eq(pid-1).addClass("curr");
                    $selJt.find(".sub-list-"+pid).addClass("curr");
                    var jid = parseInt(jt.substr(1));
                    $selJt.find(".sub-list-"+pid+" .sub-type").eq(jid).addClass("on");
                }
                LoadTopicList(0);
                /*iif(parseInt(options.page)){
                     for(var i=0,len=parseInt(options.page);i<len;i++){
                        LoadTopicList(1);
                     }
                 }*/
            }else{
                LoadTopicList(0);
                search_storage.uid = global.uid;
            }
        }else{
            widthAdjust();
        }

        $(window).scroll(function () {
            var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();

            if(scrollBottom <= 4){
                if(global.uid && global.uid != 'undefined' && shouldRequest && parseInt(global.validated)){
                    LoadTopicList(1);
                }
            }
        });

        wxAuth.jsApiAuth({
            url: window.location.href.split('#')[0]
        }, function (err) {
            console.log(err);
            wx.onMenuShareTimeline({
                title: "实习鸟人才库，海量人才免费邀请", // 分享标题
                desc: "",
                imgUrl: "http://image.internbird.com/21232f297a57a5a743894a0e4a801fc3/241450bc57740d0a03aeaf947c611a31.png", // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
            wx.onMenuShareAppMessage({
                title: "实习鸟人才库，海量人才免费邀请", // 分享标题
                desc: "",
                imgUrl: "http://image.internbird.com/21232f297a57a5a743894a0e4a801fc3/241450bc57740d0a03aeaf947c611a31.png", // 分享图标
                success: function () {
                },
                cancel: function () {
                },
                fail: function () {
                }
            });
        });
        if (wxAuth.isWeixin) {
            $('.share-back').on("click", function (e) {
                e.preventDefault();
                $(this).addClass('none');
            });
            $("#share").on("click", function () {
                $('.share-back').removeClass('none');
            });
        }
    });
});