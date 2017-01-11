require.config({
    baseUrl: baseUrl+'/',
    shim: {
        'js/lib/IB_jquery': {
            exports: '$'
        }
    }
});

require(['js/lib/IB_jquery', 'js/lib/IB_fastclick','js/common/IB_fn','js/page/quickRecruit/IB_common'], function ($, FastClick, fn, quickRecruit) {
    $(function () {
        var can_request = true;
        fn.popBoxBind();

        var selection = {
            index: 0,
            len: 0,
            slideBind: function () {
                selection.len = $(".selection .item").length;
                $(".selection .btn-slide").click(function () {
                    var $this = $(this);
                    if ($this.hasClass("prev") && selection.index) {
                        selection.index--;
                        if (selection.index == 0) {
                            $(".selection .btn-slide.prev").hide();
                        } else {
                            $(".selection .btn-slide.prev").show();
                        }
                        $(".selection .btn-slide.next").show();
                        $(".items").animate({"left": "-" + (288 * selection.index) + "px"}, 300);
                    } else if ($this.hasClass("next")) {
                        selection.index++;
                        if (selection.index == selection.len - 3) {
                            $(".selection .btn-slide.next").hide();
                        } else {
                            $(".selection .btn-slide.next").show();
                        }
                        $(".selection .btn-slide.prev").show();
                        $(".items").animate({"left": "-" + (288 * selection.index) + "px"}, 300);
                    }

                });
            }
        };
        selection.slideBind();

        //invite
        quickRecruit.inviteInit("common");
        $(document).on("click", ".talent-info .btn-invite", function () {
            var $this = $(this);
            $(".talent-info.now").removeClass("now");
            $this.closest(".talent-info").addClass("now");
            var rid = $this.attr("data-rid");
            var version = $this.attr("data-version");
            $(".popBox-quickRecruit .btn-invite").attr({"data-rid": rid, "data-version": version, "data-type": "list"});
            $(".overlay").show();
            $(".popBox-quickRecruit").show();
        });
        $(".popBox .btn-ok").click(function () {
            $(".overlay").hide();
            $(".popBox").hide();
        });

    });
});
