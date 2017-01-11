
$(function () {
    var can_request = true;
    //fn.selectorBind();
    /*fn.popBoxBind();*/

    var forward = encodeURIComponent(window.location.href);
    var ue = ueUtil.getEditorPosition("pos-content", 300, 1000);
    ue.ready(function () {
        $(".pos-content-area").show();
    });
    ue.addListener("focus", function () {
        $(".input-error-content").hide();
    });

    //城市选择
    $(".city-wrap").citySelector({
        isProvince: false
    });
    $(".sel-city .sel-btn").click(function (e) {
        var event = e || window.event;
        event.stopPropagation();
        var $this = $(this);
        if($this.hasClass("cur")) {
            return;
        } else {
            var type=$(this).attr("data-type");
            if(type=="multi"){
                $(".city-wrap").citySelector({
                    isProvince: false,
                    isMultiSelect: true
                });
            }else{
                $(".city-wrap").citySelector({
                    isProvince: false,
                    isMultiSelect: false
                });
            }
            $(".sel-city .sel-btn, .city-wrap").removeClass("cur");
            $this.addClass("cur");
            $(".pos-city").val("").attr("data-cid","");
            $(".selector-city").find(".city").removeClass("selected");
        }
    });

    $(".pos-drop-down").click(function (e) {
        var $this = $(this);
        if(!$this.hasClass("cur")) {
            $this.find(".icon-down-arrow").remove();
            $this.addClass("cur").append("<span class='icon-up-arrow'></span>");
            $this.next().show();
        } else {
            $(this).find(".icon-up-arrow").remove();
            $(this).removeClass("cur").append("<span class='icon-down-arrow'></span>");
            $this.next().hide();
        }
        e.stopPropagation();
    });

    //选项
    $(".selector li").on("click",function(e){
        var event = e || window.event;
        event.stopPropagation();
        var oSelector = $(this).parent();
        var btnSel = $(oSelector).prev(".btn-selector").find("input");
        $(btnSel).css({"color":"#000"});
        var id;
        if($(this).hasClass("ct")){
            id = $(this).attr("data-type-id");
            $(btnSel).attr("data-type-id",id);
        } else {
            id = $(this).attr("data-id");
            $(btnSel).attr("data-id",id);
        }
        $(btnSel).val($(this).text());
        $(oSelector).hide();
    });

    var company_avatar="";    //公司图像
    //公司头像上传
    if(global.ie){
        fileUpload("admin", "avatar-file", function (error, cover_img) {
            if (!error) {
                $(".company-avatar .loading").remove();
                $(".company-avatar").css({"background-image": "url('" + cover_img + "?imageView2/2/w/240/h/240')"}).attr("data-avatar",cover_img);
                company_avatar = cover_img;
                $(".company-avatars").find(".input-error").hide();
            }
        }, function () {
            $(".company-avatar").append("<div class='loading'></div>");
        })
    }else{
        var avatar_cropper = CROPPER.getCropper("cropper-image",{
            width: 200,
            height: 200,
            ratio : 1,
            btn:{
                zoomIn : ".cutter-larger",
                zoomOut : ".cutter-smaller"
            }
        });
        imageCutter.init("avatar-file",function(data){
            avatar_cropper.refresh(data,function(){
                $(".popBox-cutter").show();
                $(".overlay").show();
            });
        });
        $(".popBox-cutter .btn-confirm").click(function(){
            var croppedData = avatar_cropper.getCroppedData();
            imageCutter.upload(croppedData,"admin",function(err,info){
                $(".popBox-cutter .loading").remove();
                if(!err){
                    var imgUrl = "http://image.internbird.com/"+JSON.parse(info).key;
                    $(".company-avatar").css({"background-image": "url('" + imgUrl + "?imageView2/2/w/240/h/240')"}).attr("data-avatar",imgUrl);
                    company_avatar = imgUrl;
                    $(".company-avatars").find(".input-error").hide();
                    $(".overlay,.popBox").hide();
                }else{
                    alert("上传失败!");
                }
            },function(){
                $(".popBox-cutter .loading").remove();
                $(".popBox-cutter").append("<div class='loading'></div>");
            });

        });
        $(".popBox .btn-cancel,.overlay").click(function(){
            $(".overlay,.popBox").hide();
        });
    }
    

    $(document).on("click", ".btn-add-pos", function () {
        var $this = $(this);
        var noError = isInputNull(ue);
        var url = "/company/edit/"+$this.attr("data-cid");
        if (noError) {
            var name = $.trim($(".pos-company").val());
            var full_name = $.trim($(".pos-full-company").val());
            var title = $.trim($(".pos-title").val());
            /*var city = $.trim($(".pos-city").val());//实习城市
            var city_id = $(".pos-city").attr("data-cid");
            var type = $.trim($(".pos-type").val());
            var type_id = $(".pos-type").attr("data-type-id");
            var scale_type = $(".pos-scale").attr("data-id");
            var trade_type = $(".pos-trade").attr("data-id");*/
            var homepage = $.trim($(".pos-homepage").val());
            var introduction = ueUtil.getPlainContent(ue.getContent());//公司介绍
            if(company_avatar=="")
                company_avatar = $(".company-avatar").attr("data-avatar");
            if (can_request) {
                can_request = false;
                var option = {
                    name:name,
                    full_name: full_name,
                    title: title,
                    /*city: city,
                    city_id: city_id,
                    type:type,
                    type_id:type_id,
                    scale_type:scale_type,
                    trade_type:trade_type,*/
                    homepage:homepage,
                    avatar:company_avatar,
                    introduction:introduction
                };
                $this.val("修改中...");
                $.ajax({
                    type: "post",
                    url: url,
                    dataType: "json",
                    data: {
                        option: option
                    },
                    success: function (data) {
                        can_request = true;
                        $this.val("修改");
                        if (data.status == 10000) {
                            alert("修改成功！");
                            location.href = '/company/list?status=1&page=1';
                        } else if (data.status == 10004) {
                            window.location.href = "/login?forward=" + forward;
                        }
                    }
                });
            }
        }
    });
});
//职位发布信息不全
function isInputNull(ue) {
    $(document).on("focus", ".pos-item", function () {
        $(this).parent().nextAll(".input-error").hide();
    });
    var flag = true;
    if (!$.trim(ue.getContentTxt())) {
        flag = false;
        $(".input-error-content").html("<span class='icon-prompt'></span>请输入公司介绍，尽量使用短句并分条列出").show();
    } else {
        if (regex.email.exec($.trim(ue.getContentTxt()), "g") || regex.phone.exec($.trim(ue.getContentTxt()), "g") || regex.phone_2.exec($.trim(ue.getContentTxt()), "g")) {
            flag = false;
            $(".input-error-content").html("<span class='icon-prompt'></span>公司介绍中请勿输入邮箱、电话等联系方式").show();
        } else {
            $(".input-error-content").hide();
        }
    }

    $(".add-area .pos-item").each(function () {
        if ($.trim($(this).val()) == "" && !$(this).hasClass("pos-homepage") && !$(this).hasClass("pos-title")) {
                $(this).parent().nextAll(".input-error").eq(0).show();
                flag = false;
        }
    });
    if($(".company-avatar").attr("data-avatar") == "") {
        $(".company-avatars").find(".input-error").show();
        flag = false;
    }
    return flag;
}