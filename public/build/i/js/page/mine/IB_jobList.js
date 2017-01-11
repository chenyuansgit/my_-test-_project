require.config({
    baseUrl: baseUrl + '/',
    shim: {
        'js/lib/IB_zepto': {
            deps: [],
            exports: '$'
        }
    }
});
require(['js/lib/IB_zepto', 'js/lib/IB_fastclick', 'js/lib/IB_fn'], function ($, FastClick, fn) {
    $(function () {
        var account_host;
        try{
            account_host = global.account_host;
        }catch(e){}
        var forward = encodeURIComponent(window.location.href);
        FastClick.attach(document.body);
        //删除职位
        $(document).on("click", ".delete", function () {
            var $this = $(this);
            var text = $this.text();
            var $jobArea = $this.closest('.job');
            var jobID = $jobArea.attr("data-jid");
            if (can_request) {
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type: "POST",
                    url: "/api/jobs/delete/" + jobID,
                    dataType: "json",
                    success: function (data) {
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            $jobArea.remove();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });
        //下线职位
        $(document).on("click", ".offline", function () {
            var $this = $(this);
            var text = $this.text();
            var $jobArea = $this.closest('.job');
            var jobID = $jobArea.attr("data-jid");
            if (can_request) {
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type: "POST",
                    url: "/api/jobs/offline/" + jobID,
                    dataType: "json",
                    success: function (data) {
                        can_request = true;
                        $this.text(text);
                        if (data.status == 10000) {
                            $jobArea.remove();
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });
        //刷新职位
        $(document).on("click", ".refresh.on", function () {
            var $this = $(this);
            var jobArea = $this.closest(".job");
            var jobID = $(jobArea).attr("data-jid");
            if (can_request) {
                can_request = false;
                $this.text("处理中...");
                $.ajax({
                    type: "POST",
                    url: "/api/jobs/refresh/" + jobID,
                    dataType: "json",
                    success: function (data) {
                        can_request = true;
                        if (data.status == 10000) {
                            $this.text('已刷新').removeClass("on").addClass("off");
                        } else if (data.status == 10004) {
                            window.location.href = account_host+"/login?forward=" + forward;
                        }
                    }
                });
            }
        });

    });


    function removePopTips() {
        setTimeout(function () {
            $(".popTips").removeClass("fadeIn").hide();
        }, 1000);
    }
});