require.config({
    baseUrl: baseUrl+'/',
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
require(['js/lib/IB_zepto','js/lib/IB_fastclick','js/lib/IB_city','js/lib/IB_jobType','js/lib/IB_iscroll','js/lib/IB_citySelector'],function($,FastClick,cities,jobType,IScroll,citySelector){
   $(function(){
       FastClick.attach(document.body);
       var flipAnimationOk = true;
       var account_host;
       try{
           account_host = global.account_host;
       }catch(e){}
       /*city*/
       $("#city").citySelector({
           isProvince :0,
           noWrapper : 1,
           noLimit: 1
       });
       /*city end*/

       /*selector start*/
       $('.selector-tab').on('click',function(){
          if(!flipAnimationOk||$(this).hasClass('flipping')) return false;
           flipAnimationOk = false;
           $(this).addClass('flipping');
           var id = $(this).attr('id');
           $('#'+id+'-selector').show().addClass("animation_600 flipRight");
       });
       $(".selector .btn-console").on("click",function(e){
           e.preventDefault();
           var selector = $(this).closest(".selector");
           selector.removeClass("flipRight").addClass("flipRightOut");
           setTimeout(function () {
               selector.removeClass("flipRightOut").css({"opacity": 1}).hide();
               flipAnimationOk = true;
               $('.selector-tab.flipping').removeClass('flipping');
           }, 600);
       });
       $(".sel-content .sel-tab").on("click", function (e) {
           e.preventDefault();
           var $this = $(this);
           $this.closest(".sel-content").find(".sel-tab.curr").removeClass("curr");
           $this.addClass("curr");
           var text = $(this).find("span").text().trim();
           var data = $(this).attr("data-tag");
           $('.selector-tab.flipping').attr('data-tag',data).text(text);
           setTimeout(function () {
               $this.closest(".selector").removeClass("flipRight").addClass("flipRightOut");
               setTimeout(function () {
                   $this.closest(".selector").removeClass("flipRightOut").css({"opacity": 1}).hide();
                   flipAnimationOk = true;
                   $('.selector-tab.flipping').removeClass('flipping');
               }, 600);
           }, 500);
       });
       /*selector end*/
       function sub(option, callback) {
           $.ajax({
               type: 'post',
               url: '/api/sub/setting',
               data: {
                   option: option
               },
               dataType: 'json',
               success: function (data) {
                   if (data.status == 10000) return callback(null);
                   callback(data.desc, data.status);
               },
               error: function (err) {
                   callback(err);
               }
           });
       }
       $('#complete').on('click',function(){
           if($(this).hasClass('ing')) return false;
           if(!isLogin){
                window.location.href = account_host+"/login?forward=" + encodeURIComponent(location.href);
                return;
           }
           $(this).addClass('ing').text('订阅中...');
           sub({
               key: $.trim($('#key input').val())||'',
               city_id: $('#city').attr('data-city-id')||0,
               city: $.trim($('#city').text()),
               education:$('#education').attr('data-tag')||0,
               min_payment:$('#payment').attr('data-tag')||0,
               workdays:$('#workdays').attr('data-tag')||0
           }, function (err, code) {
               $('#complete').removeClass('ing').text('完成订阅');
               if (err) {
                   if(code == 10004){
                        window.location.href = account_host+"/login?forward=" + encodeURIComponent(location.href);
                        return;
                   }
                   alert('系统错误,请稍后再试!');
                   return;
               }
               window.location.href = "/sub/list?forward=" + encodeURIComponent(location.href);
           });
       });
   });
});