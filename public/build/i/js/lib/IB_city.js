(function(_this){
    var cities = [{
        "province_id": 1,
        "province_name": "北京",
        "city": [{
            "city_id": 1,
            "city_name": "北京"
        }]
    },
        {
            "province_id": 2,
            "province_name": "天津",
            "city": [{
                "city_id": 2,
                "city_name": "天津"
            }]
        },
        {
            "province_id": 3,
            "province_name": "河北",
            "city": [{
                "city_id": 3,
                "city_name": "石家庄"
            },
                {
                    "city_id": 4,
                    "city_name": "唐山"
                },
                {
                    "city_id": 5,
                    "city_name": "秦皇岛"
                },
                {
                    "city_id": 6,
                    "city_name": "邯郸"
                },
                {
                    "city_id": 7,
                    "city_name": "邢台"
                },
                {
                    "city_id": 8,
                    "city_name": "保定"
                },
                {
                    "city_id": 9,
                    "city_name": "张家口"
                },
                {
                    "city_id": 10,
                    "city_name": "承德"
                },
                {
                    "city_id": 11,
                    "city_name": "沧州"
                },
                {
                    "city_id": 12,
                    "city_name": "廊坊"
                },
                {
                    "city_id": 13,
                    "city_name": "衡水"
                }]
        },
        {
            "province_id": 4,
            "province_name": "山西",
            "city": [{
                "city_id": 14,
                "city_name": "太原"
            },
                {
                    "city_id": 15,
                    "city_name": "大同"
                },
                {
                    "city_id": 16,
                    "city_name": "阳泉"
                },
                {
                    "city_id": 17,
                    "city_name": "长治"
                },
                {
                    "city_id": 18,
                    "city_name": "晋城"
                },
                {
                    "city_id": 19,
                    "city_name": "朔州"
                },
                {
                    "city_id": 20,
                    "city_name": "晋中"
                },
                {
                    "city_id": 21,
                    "city_name": "运城"
                },
                {
                    "city_id": 22,
                    "city_name": "忻州"
                },
                {
                    "city_id": 23,
                    "city_name": "临汾"
                },
                {
                    "city_id": 24,
                    "city_name": "吕梁"
                }]
        },
        {
            "province_id": 5,
            "province_name": "内蒙古 ",
            "city": [{
                "city_id": 25,
                "city_name": "呼和浩特"
            },
                {
                    "city_id": 26,
                    "city_name": "包头"
                },
                {
                    "city_id": 27,
                    "city_name": "乌海"
                },
                {
                    "city_id": 28,
                    "city_name": "赤峰"
                },
                {
                    "city_id": 29,
                    "city_name": "通辽"
                },
                {
                    "city_id": 30,
                    "city_name": "鄂尔多斯"
                },
                {
                    "city_id": 31,
                    "city_name": "呼伦贝尔"
                },
                {
                    "city_id": 32,
                    "city_name": "巴彦淖尔"
                },
                {
                    "city_id": 33,
                    "city_name": "乌兰察布"
                },
                {
                    "city_id": 34,
                    "city_name": "兴安盟"
                },
                {
                    "city_id": 35,
                    "city_name": "锡林郭勒盟"
                },
                {
                    "city_id": 36,
                    "city_name": "阿拉善盟"
                }]
        },
        {
            "province_id": 6,
            "province_name": "辽宁",
            "city": [{
                "city_id": 37,
                "city_name": "沈阳"
            },
                {
                    "city_id": 38,
                    "city_name": "大连"
                },
                {
                    "city_id": 39,
                    "city_name": "鞍山"
                },
                {
                    "city_id": 40,
                    "city_name": "抚顺"
                },
                {
                    "city_id": 41,
                    "city_name": "本溪"
                },
                {
                    "city_id": 42,
                    "city_name": "丹东"
                },
                {
                    "city_id": 43,
                    "city_name": "锦州"
                },
                {
                    "city_id": 44,
                    "city_name": "营口"
                },
                {
                    "city_id": 45,
                    "city_name": "阜新"
                },
                {
                    "city_id": 46,
                    "city_name": "辽阳"
                },
                {
                    "city_id": 47,
                    "city_name": "盘锦"
                },
                {
                    "city_id": 48,
                    "city_name": "铁岭"
                },
                {
                    "city_id": 49,
                    "city_name": "朝阳"
                },
                {
                    "city_id": 50,
                    "city_name": "葫芦岛"
                }]
        },
        {
            "province_id": 7,
            "province_name": "吉林",
            "city": [{
                "city_id": 51,
                "city_name": "长春"
            },
                {
                    "city_id": 52,
                    "city_name": "吉林"
                },
                {
                    "city_id": 53,
                    "city_name": "四平"
                },
                {
                    "city_id": 54,
                    "city_name": "辽源"
                },
                {
                    "city_id": 55,
                    "city_name": "通化"
                },
                {
                    "city_id": 56,
                    "city_name": "白山"
                },
                {
                    "city_id": 57,
                    "city_name": "松原"
                },
                {
                    "city_id": 58,
                    "city_name": "白城"
                },
                {
                    "city_id": 59,
                    "city_name": "延边朝鲜族自治州"
                }]
        },
        {
            "province_id": 8,
            "province_name": "黑龙江",
            "city": [{
                "city_id": 60,
                "city_name": "哈尔滨"
            },
                {
                    "city_id": 61,
                    "city_name": "齐齐哈尔"
                },
                {
                    "city_id": 62,
                    "city_name": "鸡西"
                },
                {
                    "city_id": 63,
                    "city_name": "鹤岗"
                },
                {
                    "city_id": 64,
                    "city_name": "双鸭山"
                },
                {
                    "city_id": 65,
                    "city_name": "大庆"
                },
                {
                    "city_id": 66,
                    "city_name": "伊春"
                },
                {
                    "city_id": 67,
                    "city_name": "佳木斯"
                },
                {
                    "city_id": 68,
                    "city_name": "七台河"
                },
                {
                    "city_id": 69,
                    "city_name": "牡丹江"
                },
                {
                    "city_id": 70,
                    "city_name": "黑河"
                },
                {
                    "city_id": 71,
                    "city_name": "绥化"
                },
                {
                    "city_id": 72,
                    "city_name": "大兴安岭 "
                }]
        },
        {
            "province_id": 9,
            "province_name": "上海",
            "city": [{
                "city_id": 73,
                "city_name": "上海"
            }]
        },
        {
            "province_id": 10,
            "province_name": "江苏",
            "city": [{
                "city_id": 74,
                "city_name": "南京"
            },
                {
                    "city_id": 75,
                    "city_name": "无锡"
                },
                {
                    "city_id": 76,
                    "city_name": "徐州"
                },
                {
                    "city_id": 77,
                    "city_name": "常州"
                },
                {
                    "city_id": 78,
                    "city_name": "苏州"
                },
                {
                    "city_id": 79,
                    "city_name": "南通"
                },
                {
                    "city_id": 80,
                    "city_name": "连云港"
                },
                {
                    "city_id": 81,
                    "city_name": "淮安"
                },
                {
                    "city_id": 82,
                    "city_name": "盐城"
                },
                {
                    "city_id": 83,
                    "city_name": "扬州"
                },
                {
                    "city_id": 84,
                    "city_name": "镇江"
                },
                {
                    "city_id": 85,
                    "city_name": "泰州"
                },
                {
                    "city_id": 86,
                    "city_name": "宿迁"
                }]
        },
        {
            "province_id": 11,
            "province_name": "浙江",
            "city": [{
                "city_id": 87,
                "city_name": "杭州"
            },
                {
                    "city_id": 88,
                    "city_name": "宁波"
                },
                {
                    "city_id": 89,
                    "city_name": "温州"
                },
                {
                    "city_id": 90,
                    "city_name": "嘉兴"
                },
                {
                    "city_id": 91,
                    "city_name": "湖州"
                },
                {
                    "city_id": 92,
                    "city_name": "绍兴"
                },
                {
                    "city_id": 93,
                    "city_name": "金华"
                },
                {
                    "city_id": 94,
                    "city_name": "衢州"
                },
                {
                    "city_id": 95,
                    "city_name": "舟山"
                },
                {
                    "city_id": 96,
                    "city_name": "台州"
                },
                {
                    "city_id": 97,
                    "city_name": "丽水"
                }]
        },
        {
            "province_id": 12,
            "province_name": "安徽",
            "city": [{
                "city_id": 98,
                "city_name": "合肥"
            },
                {
                    "city_id": 99,
                    "city_name": "芜湖"
                },
                {
                    "city_id": 100,
                    "city_name": "蚌埠"
                },
                {
                    "city_id": 101,
                    "city_name": "淮南"
                },
                {
                    "city_id": 102,
                    "city_name": "马鞍山"
                },
                {
                    "city_id": 103,
                    "city_name": "淮北"
                },
                {
                    "city_id": 104,
                    "city_name": "铜陵"
                },
                {
                    "city_id": 105,
                    "city_name": "安庆"
                },
                {
                    "city_id": 106,
                    "city_name": "黄山"
                },
                {
                    "city_id": 107,
                    "city_name": "滁州"
                },
                {
                    "city_id": 108,
                    "city_name": "阜阳"
                },
                {
                    "city_id": 109,
                    "city_name": "宿州 "
                },
                {
                    "city_id": 110,
                    "city_name": "巢湖 "
                },
                {
                    "city_id": 111,
                    "city_name": "六安 "
                },
                {
                    "city_id": 112,
                    "city_name": "亳州 "
                },
                {
                    "city_id": 113,
                    "city_name": "池州 "
                },
                {
                    "city_id": 114,
                    "city_name": "宣城 "
                }]
        },
        {
            "province_id": 13,
            "province_name": "福建",
            "city": [{
                "city_id": 115,
                "city_name": "福州 "
            },
                {
                    "city_id": 116,
                    "city_name": "厦门 "
                },
                {
                    "city_id": 117,
                    "city_name": "莆田 "
                },
                {
                    "city_id": 118,
                    "city_name": "三明 "
                },
                {
                    "city_id": 119,
                    "city_name": "泉州 "
                },
                {
                    "city_id": 120,
                    "city_name": "漳州 "
                },
                {
                    "city_id": 121,
                    "city_name": "南平 "
                },
                {
                    "city_id": 122,
                    "city_name": "龙岩 "
                },
                {
                    "city_id": 123,
                    "city_name": "宁德 "
                }]
        },
        {
            "province_id": 14,
            "province_name": "江西",
            "city": [{
                "city_id": 124,
                "city_name": "南昌 "
            },
                {
                    "city_id": 125,
                    "city_name": "景德镇 "
                },
                {
                    "city_id": 126,
                    "city_name": "萍乡 "
                },
                {
                    "city_id": 127,
                    "city_name": "九江 "
                },
                {
                    "city_id": 128,
                    "city_name": "新余 "
                },
                {
                    "city_id": 129,
                    "city_name": "鹰潭 "
                },
                {
                    "city_id": 130,
                    "city_name": "赣州 "
                },
                {
                    "city_id": 131,
                    "city_name": "吉安 "
                },
                {
                    "city_id": 132,
                    "city_name": "宜春 "
                },
                {
                    "city_id": 133,
                    "city_name": "抚州 "
                },
                {
                    "city_id": 134,
                    "city_name": "上饶 "
                }]
        },
        {
            "province_id": 15,
            "province_name": "山东",
            "city": [{
                "city_id": 135,
                "city_name": "济南 "
            },
                {
                    "city_id": 136,
                    "city_name": "青岛 "
                },
                {
                    "city_id": 137,
                    "city_name": "淄博 "
                },
                {
                    "city_id": 138,
                    "city_name": "枣庄 "
                },
                {
                    "city_id": 139,
                    "city_name": "东营 "
                },
                {
                    "city_id": 140,
                    "city_name": "烟台 "
                },
                {
                    "city_id": 141,
                    "city_name": "潍坊 "
                },
                {
                    "city_id": 142,
                    "city_name": "济宁 "
                },
                {
                    "city_id": 143,
                    "city_name": "泰安 "
                },
                {
                    "city_id": 144,
                    "city_name": "威海 "
                },
                {
                    "city_id": 145,
                    "city_name": "日照 "
                },
                {
                    "city_id": 146,
                    "city_name": "莱芜 "
                },
                {
                    "city_id": 147,
                    "city_name": "临沂 "
                },
                {
                    "city_id": 148,
                    "city_name": "德州 "
                },
                {
                    "city_id": 149,
                    "city_name": "聊城 "
                },
                {
                    "city_id": 150,
                    "city_name": "滨州 "
                },
                {
                    "city_id": 151,
                    "city_name": "荷泽 "
                }]
        },
        {
            "province_id": 16,
            "province_name": "河南",
            "city": [{
                "city_id": 152,
                "city_name": "郑州 "
            },
                {
                    "city_id": 153,
                    "city_name": "开封 "
                },
                {
                    "city_id": 154,
                    "city_name": "洛阳 "
                },
                {
                    "city_id": 155,
                    "city_name": "平顶山 "
                },
                {
                    "city_id": 156,
                    "city_name": "安阳 "
                },
                {
                    "city_id": 157,
                    "city_name": "鹤壁 "
                },
                {
                    "city_id": 158,
                    "city_name": "新乡 "
                },
                {
                    "city_id": 159,
                    "city_name": "焦作 "
                },
                {
                    "city_id": 160,
                    "city_name": "濮阳 "
                },
                {
                    "city_id": 161,
                    "city_name": "许昌 "
                },
                {
                    "city_id": 162,
                    "city_name": "漯河 "
                },
                {
                    "city_id": 163,
                    "city_name": "三门峡 "
                },
                {
                    "city_id": 164,
                    "city_name": "南阳 "
                },
                {
                    "city_id": 165,
                    "city_name": "商丘 "
                },
                {
                    "city_id": 166,
                    "city_name": "信阳 "
                },
                {
                    "city_id": 167,
                    "city_name": "周口 "
                },
                {
                    "city_id": 168,
                    "city_name": "驻马店 "
                }]
        },
        {
            "province_id": 17,
            "province_name": "湖北",
            "city": [{
                "city_id": 169,
                "city_name": "武汉 "
            },
                {
                    "city_id": 170,
                    "city_name": "黄石 "
                },
                {
                    "city_id": 171,
                    "city_name": "十堰 "
                },
                {
                    "city_id": 172,
                    "city_name": "宜昌 "
                },
                {
                    "city_id": 173,
                    "city_name": "襄樊 "
                },
                {
                    "city_id": 174,
                    "city_name": "鄂州 "
                },
                {
                    "city_id": 175,
                    "city_name": "荆门 "
                },
                {
                    "city_id": 176,
                    "city_name": "孝感 "
                },
                {
                    "city_id": 177,
                    "city_name": "荆州 "
                },
                {
                    "city_id": 178,
                    "city_name": "黄冈 "
                },
                {
                    "city_id": 179,
                    "city_name": "咸宁 "
                },
                {
                    "city_id": 180,
                    "city_name": "随州 "
                },
                {
                    "city_id": 181,
                    "city_name": "恩施土家族苗族自治州"
                },
                {
                    "city_id": 182,
                    "city_name": "神农架"
                }]
        },
        {
            "province_id": 18,
            "province_name": "湖南",
            "city": [{
                "city_id": 183,
                "city_name": "长沙 "
            },
                {
                    "city_id": 184,
                    "city_name": "株洲 "
                },
                {
                    "city_id": 185,
                    "city_name": "湘潭 "
                },
                {
                    "city_id": 186,
                    "city_name": "衡阳 "
                },
                {
                    "city_id": 187,
                    "city_name": "邵阳 "
                },
                {
                    "city_id": 188,
                    "city_name": "岳阳 "
                },
                {
                    "city_id": 189,
                    "city_name": "常德 "
                },
                {
                    "city_id": 190,
                    "city_name": "张家界 "
                },
                {
                    "city_id": 191,
                    "city_name": "益阳 "
                },
                {
                    "city_id": 192,
                    "city_name": "郴州 "
                },
                {
                    "city_id": 193,
                    "city_name": "永州 "
                },
                {
                    "city_id": 194,
                    "city_name": "怀化 "
                },
                {
                    "city_id": 195,
                    "city_name": "娄底 "
                },
                {
                    "city_id": 196,
                    "city_name": "湘西土家族苗族自治州"
                }]
        },
        {
            "province_id": 19,
            "province_name": "广东",
            "city": [{
                "city_id": 197,
                "city_name": "广州 "
            },
                {
                    "city_id": 198,
                    "city_name": "韶关 "
                },
                {
                    "city_id": 199,
                    "city_name": "深圳 "
                },
                {
                    "city_id": 200,
                    "city_name": "珠海 "
                },
                {
                    "city_id": 201,
                    "city_name": "汕头 "
                },
                {
                    "city_id": 202,
                    "city_name": "佛山 "
                },
                {
                    "city_id": 203,
                    "city_name": "江门 "
                },
                {
                    "city_id": 204,
                    "city_name": "湛江 "
                },
                {
                    "city_id": 205,
                    "city_name": "茂名 "
                },
                {
                    "city_id": 206,
                    "city_name": "肇庆 "
                },
                {
                    "city_id": 207,
                    "city_name": "惠州 "
                },
                {
                    "city_id": 208,
                    "city_name": "梅州 "
                },
                {
                    "city_id": 209,
                    "city_name": "汕尾 "
                },
                {
                    "city_id": 210,
                    "city_name": "河源 "
                },
                {
                    "city_id": 211,
                    "city_name": "阳江 "
                },
                {
                    "city_id": 212,
                    "city_name": "清远 "
                },
                {
                    "city_id": 213,
                    "city_name": "东莞 "
                },
                {
                    "city_id": 214,
                    "city_name": "中山 "
                },
                {
                    "city_id": 215,
                    "city_name": "潮州 "
                },
                {
                    "city_id": 216,
                    "city_name": "揭阳 "
                },
                {
                    "city_id": 217,
                    "city_name": "云浮 "
                }]
        },
        {
            "province_id": 20,
            "province_name": "广西",
            "city": [{
                "city_id": 218,
                "city_name": "南宁 "
            },
                {
                    "city_id": 219,
                    "city_name": "柳州 "
                },
                {
                    "city_id": 220,
                    "city_name": "桂林 "
                },
                {
                    "city_id": 221,
                    "city_name": "梧州 "
                },
                {
                    "city_id": 222,
                    "city_name": "北海 "
                },
                {
                    "city_id": 223,
                    "city_name": "防城港 "
                },
                {
                    "city_id": 224,
                    "city_name": "钦州 "
                },
                {
                    "city_id": 225,
                    "city_name": "贵港 "
                },
                {
                    "city_id": 226,
                    "city_name": "玉林 "
                },
                {
                    "city_id": 227,
                    "city_name": "百色 "
                },
                {
                    "city_id": 228,
                    "city_name": "贺州 "
                },
                {
                    "city_id": 229,
                    "city_name": "河池 "
                },
                {
                    "city_id": 230,
                    "city_name": "来宾 "
                },
                {
                    "city_id": 231,
                    "city_name": "崇左 "
                }]
        },
        {
            "province_id": 21,
            "province_name": "海南",
            "city": [{
                "city_id": 232,
                "city_name": "海口 "
            },
                {
                    "city_id": 233,
                    "city_name": "三亚 "
                }]
        },
        {
            "province_id": 22,
            "province_name": "重庆 ",
            "city": [{
                "city_id": 234,
                "city_name": "重庆 "
            }]
        },
        {
            "province_id": 23,
            "province_name": "四川",
            "city": [{
                "city_id": 235,
                "city_name": "成都 "
            },
                {
                    "city_id": 236,
                    "city_name": "自贡 "
                },
                {
                    "city_id": 237,
                    "city_name": "攀枝花 "
                },
                {
                    "city_id": 238,
                    "city_name": "泸州 "
                },
                {
                    "city_id": 239,
                    "city_name": "德阳 "
                },
                {
                    "city_id": 240,
                    "city_name": "绵阳 "
                },
                {
                    "city_id": 241,
                    "city_name": "广元 "
                },
                {
                    "city_id": 242,
                    "city_name": "遂宁 "
                },
                {
                    "city_id": 243,
                    "city_name": "内江 "
                },
                {
                    "city_id": 244,
                    "city_name": "乐山 "
                },
                {
                    "city_id": 245,
                    "city_name": "南充 "
                },
                {
                    "city_id": 246,
                    "city_name": "眉山 "
                },
                {
                    "city_id": 247,
                    "city_name": "宜宾 "
                },
                {
                    "city_id": 248,
                    "city_name": "广安 "
                },
                {
                    "city_id": 249,
                    "city_name": "达州 "
                },
                {
                    "city_id": 250,
                    "city_name": "雅安 "
                },
                {
                    "city_id": 251,
                    "city_name": "巴中 "
                },
                {
                    "city_id": 252,
                    "city_name": "资阳 "
                },
                {
                    "city_id": 253,
                    "city_name": "阿坝藏族羌族自治州"
                },
                {
                    "city_id": 254,
                    "city_name": "甘孜藏族自治州"
                },
                {
                    "city_id": 255,
                    "city_name": "凉山彝族自治州"
                }]
        },
        {
            "province_id": 24,
            "province_name": "贵州",
            "city": [{
                "city_id": 256,
                "city_name": "贵阳 "
            },
                {
                    "city_id": 257,
                    "city_name": "六盘水 "
                },
                {
                    "city_id": 258,
                    "city_name": "遵义 "
                },
                {
                    "city_id": 259,
                    "city_name": "安顺 "
                },
                {
                    "city_id": 260,
                    "city_name": "铜仁 "
                },
                {
                    "city_id": 261,
                    "city_name": "黔西南布依族苗族自治州"
                },
                {
                    "city_id": 262,
                    "city_name": "毕节 "
                },
                {
                    "city_id": 263,
                    "city_name": "黔东南苗族侗族自治州"
                },
                {
                    "city_id": 264,
                    "city_name": "黔南布依族苗族自治州"
                }]
        },
        {
            "province_id": 25,
            "province_name": "云南",
            "city": [{
                "city_id": 265,
                "city_name": "昆明 "
            },
                {
                    "city_id": 266,
                    "city_name": "曲靖 "
                },
                {
                    "city_id": 267,
                    "city_name": "玉溪 "
                },
                {
                    "city_id": 268,
                    "city_name": "保山 "
                },
                {
                    "city_id": 269,
                    "city_name": "昭通 "
                },
                {
                    "city_id": 270,
                    "city_name": "丽江 "
                },
                {
                    "city_id": 271,
                    "city_name": "思茅 "
                },
                {
                    "city_id": 272,
                    "city_name": "临沧 "
                },
                {
                    "city_id": 273,
                    "city_name": "楚雄彝族自治州"
                },
                {
                    "city_id": 274,
                    "city_name": "红河哈尼族彝族自治州"
                },
                {
                    "city_id": 275,
                    "city_name": "文山壮族苗族自治州"
                },
                {
                    "city_id": 276,
                    "city_name": "西双版纳傣族自治州"
                },
                {
                    "city_id": 277,
                    "city_name": "大理白族自治州"
                },
                {
                    "city_id": 278,
                    "city_name": "德宏傣族景颇族自治州"
                },
                {
                    "city_id": 279,
                    "city_name": "怒江傈僳族自治州"
                },
                {
                    "city_id": 280,
                    "city_name": "迪庆藏族自治州"
                }]
        },
        {
            "province_id": 26,
            "province_name": "西藏 ",
            "city": [{
                "city_id": 281,
                "city_name": "拉萨 "
            },
                {
                    "city_id": 282,
                    "city_name": "昌都 "
                },
                {
                    "city_id": 283,
                    "city_name": "山南 "
                },
                {
                    "city_id": 284,
                    "city_name": "日喀则 "
                },
                {
                    "city_id": 285,
                    "city_name": "那曲 "
                },
                {
                    "city_id": 286,
                    "city_name": "阿里 "
                },
                {
                    "city_id": 287,
                    "city_name": "林芝 "
                }]
        },
        {
            "province_id": 27,
            "province_name": "陕西",
            "city": [{
                "city_id": 288,
                "city_name": "西安 "
            },
                {
                    "city_id": 289,
                    "city_name": "铜川 "
                },
                {
                    "city_id": 290,
                    "city_name": "宝鸡 "
                },
                {
                    "city_id": 291,
                    "city_name": "咸阳 "
                },
                {
                    "city_id": 292,
                    "city_name": "渭南 "
                },
                {
                    "city_id": 293,
                    "city_name": "延安 "
                },
                {
                    "city_id": 294,
                    "city_name": "汉中 "
                },
                {
                    "city_id": 295,
                    "city_name": "榆林 "
                },
                {
                    "city_id": 296,
                    "city_name": "安康 "
                },
                {
                    "city_id": 297,
                    "city_name": "商洛 "
                }]
        },
        {
            "province_id": 28,
            "province_name": "甘肃",
            "city": [{
                "city_id": 298,
                "city_name": "兰州 "
            },
                {
                    "city_id": 299,
                    "city_name": "嘉峪关 "
                },
                {
                    "city_id": 300,
                    "city_name": "金昌 "
                },
                {
                    "city_id": 301,
                    "city_name": "白银 "
                },
                {
                    "city_id": 302,
                    "city_name": "天水 "
                },
                {
                    "city_id": 303,
                    "city_name": "武威 "
                },
                {
                    "city_id": 304,
                    "city_name": "张掖 "
                },
                {
                    "city_id": 305,
                    "city_name": "平凉 "
                },
                {
                    "city_id": 306,
                    "city_name": "酒泉 "
                },
                {
                    "city_id": 307,
                    "city_name": "庆阳 "
                },
                {
                    "city_id": 308,
                    "city_name": "定西 "
                },
                {
                    "city_id": 309,
                    "city_name": "陇南 "
                },
                {
                    "city_id": 310,
                    "city_name": "临夏回族自治州"
                },
                {
                    "city_id": 311,
                    "city_name": "甘南藏族自治州"
                }]
        },
        {
            "province_id": 29,
            "province_name": "青海",
            "city": [{
                "city_id": 312,
                "city_name": "西宁 "
            },
                {
                    "city_id": 313,
                    "city_name": "海东"
                },
                {
                    "city_id": 314,
                    "city_name": "海北藏族自治州"
                },
                {
                    "city_id": 315,
                    "city_name": "黄南藏族自治州"
                },
                {
                    "city_id": 316,
                    "city_name": "海南藏族自治州"
                },
                {
                    "city_id": 317,
                    "city_name": "果洛藏族自治州"
                },
                {
                    "city_id": 318,
                    "city_name": "玉树藏族自治州"
                },
                {
                    "city_id": 319,
                    "city_name": "海西蒙古族藏族自治州"
                }]
        },
        {
            "province_id": 30,
            "province_name": "宁夏",
            "city": [{
                "city_id": 320,
                "city_name": "银川 "
            },
                {
                    "city_id": 321,
                    "city_name": "石嘴山 "
                },
                {
                    "city_id": 322,
                    "city_name": "吴忠 "
                },
                {
                    "city_id": 323,
                    "city_name": "固原 "
                },
                {
                    "city_id": 324,
                    "city_name": "中卫 "
                }]
        },
        {
            "province_id": 31,
            "province_name": "新疆",
            "city": [{
                "city_id": 325,
                "city_name": "乌鲁木齐 "
            },
                {
                    "city_id": 326,
                    "city_name": "克拉玛依 "
                },
                {
                    "city_id": 327,
                    "city_name": "吐鲁番 "
                },
                {
                    "city_id": 328,
                    "city_name": "哈密"
                },
                {
                    "city_id": 329,
                    "city_name": "昌吉回族自治州"
                },
                {
                    "city_id": 330,
                    "city_name": "博尔塔拉蒙古自治州"
                },
                {
                    "city_id": 331,
                    "city_name": "巴音郭楞蒙古自治州"
                },
                {
                    "city_id": 332,
                    "city_name": "阿克苏 "
                },
                {
                    "city_id": 333,
                    "city_name": "克孜勒苏柯尔克孜自治州"
                },
                {
                    "city_id": 334,
                    "city_name": "喀什 "
                },
                {
                    "city_id": 335,
                    "city_name": "和田"
                },
                {
                    "city_id": 336,
                    "city_name": "伊犁哈萨克自治州"
                },
                {
                    "city_id": 337,
                    "city_name": "塔城 "
                },
                {
                    "city_id": 338,
                    "city_name": "阿勒泰"
                },
                {
                    "city_id": 339,
                    "city_name": "石河子 "
                },
                {
                    "city_id": 340,
                    "city_name": "阿拉尔 "
                },
                {
                    "city_id": 341,
                    "city_name": "图木舒克 "
                },
                {
                    "city_id": 342,
                    "city_name": "五家渠 "
                }]
        },
        {
            "province_id": 32,
            "province_name": "香港",
            "city": [{
                "city_id": 343,
                "city_name": "香港"
            }]
        },
        {
            "province_id": 33,
            "province_name": "澳门",
            "city": [{
                "city_id": 344,
                "city_name": "澳门"
            }]
        },
        {
            "province_id": 34,
            "province_name": "台湾",
            "city": [{
                "city_id": 345,
                "city_name": "台湾"
            }]
        }];
    if(typeof define === 'function' && define.amd){
        define(function(){
            return cities;
        });
    }else{
        _this.cities = cities;
    }
})(this);
