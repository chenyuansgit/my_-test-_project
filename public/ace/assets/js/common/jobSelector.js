/**
 * Created by zhphu on 16/8/9.
 */
;(function (factory) {
    if (typeof define === 'function' && define.amd) { // AMD
        define(['js/lib/IB_jquery','js/common/IB_fn','js/common/IB_job_type'], factory);
    } else {
        factory(window.jQuery || window.Zepto, fn, job_types);
    }
})(function ($,fn, job_types) {
    var JobSelector = function (user_options) {
        var defaults = {
            jobNameInput :""
        };
        var CONSTANTS = {
            isSelector: 0
        };
        this.init = function (inputTag) {
            defaults = $.extend({}, defaults, user_options);
            //事件绑定
            $(inputTag).attr("data-job_selector_id",defaults.id);
            $(inputTag).on("click", function (e) {
                var event = e || window.event;
                var selector_id = "job_selector_" + defaults.id;
                if (!CONSTANTS.isSelector) {
                    $(document.body).append(util.getSelector(selector_id));
                    CONSTANTS.isSelector += 1;
                    bind.base(inputTag,selector_id);
                }
                $("#"+selector_id).attr("style",util.setPosition(inputTag)).show();
            });
            $(window).resize(function() {
                $("#job_selector_" + defaults.id).attr("style",util.setPosition(inputTag));
            });
            $(document).click(function (e) {
                var event = e || window.event;
                if(!$(inputTag).is(event.target) && $(inputTag).has(event.target).length === 0){
                    var id= $(inputTag).attr("data-job_selector_id");
                    $("#job_selector_"+id).hide();
                }
            });
        };
        var util = {
            getSelector: function (id) {
                var selector = "<div class='selector-jt clearfix' id="+id+">\
                                    <ul class='main-box fl'>";
                for(var i=0,len = job_types.length;i<len;i++){
                    selector+= "<li class='jt-1st "+(i==0?'curr':'')+"' data-class='"+job_types[i].parent_type_id+"'>"+job_types[i].parent_type_name+"</li>";
                }
                selector += "</ul>" + util.getSubBox()+"</div>";
                return selector;
            },
            getSubBox : function(){
                var sub_box = "<div class='fl sub-box'>";
                for (var i = 0, len = job_types.length; i < len; i++) {
                    var sub_list;
                    if (i == 0) {
                        sub_list = "<div class='type-detail curr' data-class='" + job_types[i].parent_type_id + "'>";
                    } else {
                        sub_list = "<div class='type-detail' data-class='" + job_types[i].parent_type_id + "'>";
                    }
                    var sub_types = job_types[i].sub_types;
                    for (var j = 0, sub_len = sub_types.length; j < sub_len; j++) {
                        var group = sub_types[j].group_values;
                        var id = sub_types[j].group_id;
                        var group_list = "<dl class='clearfix'> <dt class='stage2rd-title job-type fl' data-parent-type=" + job_types[i].parent_type_name + " data-parent-type-id=" + job_types[i].parent_type_id + " data-id=" + id + " data-type='" + sub_types[j].group_name + "'>" + sub_types[j].group_name + "</dt><dd class='fl'>";
                        for (var k = 0, group_len = group.length; k < group_len; k++) {
                            group_list += "<a class='job-name' data-name='" + group[k].sub_type_name + "'data-parent-type=" + job_types[i].parent_type_name + " data-parent-type-id=" + job_types[i].parent_type_id + " data-id=" + id + " data-type='" + sub_types[j].group_name + "'>" + group[k].sub_type_name + "</a>";
                        }
                        group_list += "</dd></dl>";
                        sub_list += group_list;
                    }
                    sub_list += "</div>";
                    sub_box += sub_list
                }
                return sub_box+"</div>";
            },
            setPosition: function (inputTag) {
                var top = $(inputTag).offset().top + $(inputTag).outerHeight() + 1 + "px";
                var left = $(inputTag).offset().left + "px";
                return "left:" + left + ";top:" + top + ";";
            }
        };
        var bind = {
            base: function (inputTag,selector_id) {
                $("#"+selector_id+" .jt-1st").click(function (e) {
                    var event = e || window.event;
                    event.stopPropagation();
                    $(".jt-1st").removeClass("curr");
                    $(this).addClass("curr");
                    var jClass = $(this).attr("data-class");
                    $(".type-detail").each(function () {
                        if ($(this).attr("data-class") == jClass) {
                            $(".type-detail.curr").removeClass("curr");
                            $(this).addClass("curr");
                        }
                    });
                });
                $("#"+selector_id+" .job-type").click(function (e) {
                    var event = e || window.event;
                    event.stopPropagation();
                    $(".job-name.selected").removeClass("selected");
                    $(".job-type.selected").removeClass("selected");
                    $(this).addClass("selected");
                    var jt = $(this).attr("data-type");//type
                    var jid = $(this).attr("data-id");//id
                    var jpt = $(this).attr("data-parent-type");//parent_type
                    var jpid = $(this).attr("data-parent-type-id");//parent_type_id
                    $(inputTag).val(jt).attr({"data-id": jid, "data-type": jt, "data-pid": jpid, "data-jpt": jpt});
                    $(defaults.jobNameInput).val("").attr("data-id", jid);
                    $(".selector-jt").hide();
                    /* $(".selector-jt").prev().find(".icon-up-arrow").remove();
                     $(".selector-jt").prev().removeClass("cur").append("<span class='icon-down-arrow'></span>");*/
                });
                $("#"+selector_id+" .job-name").click(function () {
                    $(".job-name.selected").removeClass("selected");
                    $(".job-type.selected").removeClass("selected");
                    $(this).addClass("selected");
                    var jn = $(this).attr("data-name");
                    var jt = $(this).attr("data-type");//type
                    var jid = $(this).attr("data-id");//id
                    var jpt = $(this).attr("data-parent-type");//parent_type
                    var jpid = $(this).attr("data-parent-type-id");//parent_type_id
                    $(inputTag).val(jt).attr({"data-id": jid, "data-type": jt, "data-pid": jpid, "data-pt": jpt});
                    $(defaults.jobNameInput).val(jn).attr("data-id", jid);
                    $(".selector-jt, .job-name-error").hide();
                   /* $(this).parents(".selector-jt").prev().removeClass("cur").append("<span class='icon-down-arrow'></span>");
                    $(this).parents(".selector-jt").prev().find(".icon-up-arrow").remove();*/
                });
            }
        };
    };

    if (!$.fn.hasOwnProperty('jobSelector')) {
        $.fn.jobSelector = function (user_options) {
            user_options = user_options || {};
            var $elements = this;
            $elements.each(function () {
                var $this = this;
                user_options.id = fn.randomKey(10);
                var selector = new JobSelector(user_options);
                selector.init($this);
            });
        };
    }
});
