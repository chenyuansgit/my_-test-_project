;(function(){
    var mapUtil = {
        loadMap : function(){
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src = "http://api.map.baidu.com/api?v=2.0&ak=3q9TUK5ahFNyuealiblGt8OV";
            document.body.appendChild(script);
         },
        mapInit : function(ele_id){
            var map = new BMap.Map(ele_id);
            map.enableScrollWheelZoom();
            return map;
        },
        locationAnalyze : function(map,location){
            var point = new BMap.Point(116.331398,39.897445);
            map.centerAndZoom(point,12); // 初始化地图,设置城市和地图级别。
            var myGeo = new BMap.Geocoder();
            myGeo.getPoint(location, function(point){
                if (point) {
                    map.centerAndZoom(point, 16);
                    map.addOverlay(new BMap.Marker(point));
                }
            });
        },
        getCity : function(suggestId){
            var mycity = "";
            // 创建地址解析器实例
            var mapGeo = new BMap.Geocoder();
            mapGeo.getPoint(mapUtil.G(suggestId).value, function(point){
                if(point){
                    mapGeo.getLocation(point,function(rs){
                        var addComp = rs.addressComponents;
                        mycity = addComp.city +" , "+addComp.district;
                    });
                }
            });
        },
        getSuggest : function(suggestId,map){
                        map = map? map:"";
                        var ac = new BMap.Autocomplete( //建立一个自动完成的对象
                            {
                                "input" : suggestId,
                                "location" : map
                            });
                        ac.addEventListener("onhighlight", function(e) { //鼠标放在下拉列表上的事件
                            var str = "";
                            var _value = e.fromitem.value;
                            var value = "";
                            if (e.fromitem.index > -1) {
                                value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
                            }
                            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

                            value = "";
                            if (e.toitem.index > -1) {
                                _value = e.toitem.value;
                                value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
                            }
                            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
                            mapUtil.G(suggestId).setAttribute('data-city', _value.city +" , "+_value.district);

                            mapUtil.G("searchResultPanel").innerHTML = str;
                        });
                        var myValue;
                        ac.addEventListener("onconfirm", function(e) { //鼠标点击下拉列表后的事件
                            var _value = e.item.value;
                            myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
                            mapUtil.G(suggestId).setAttribute('data-city', _value.city +" , "+_value.district);
                            mapUtil.G("searchResultPanel").innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
                            if(!!map){
                                mapUtil.setPlace(map,myValue);
                            }
                        });
                    },
        G : function(id) {
                return document.getElementById(id);
            },
        setPlace : function(map,myValue){
                    map.clearOverlays();//清除地图上所有覆盖物
                    function myFun(){
                        var pp = local.getResults().getPoi(0).point;//获取第一个智能搜索的结果
                        map.centerAndZoom(pp, 18);
                        map.addOverlay(new BMap.Marker(pp));//添加标注
                    }
                    var local = new BMap.LocalSearch(map, { //智能搜索
                        onSearchComplete: myFun
                    });
                    local.search(myValue);
                }
    };
    if(typeof define =='function' && define.amd){
        define(function(){
            return mapUtil;
        });
    }else{
        window.mapUtil =  mapUtil;
    }
})(this);


