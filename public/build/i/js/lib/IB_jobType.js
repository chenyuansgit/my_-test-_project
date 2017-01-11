(function (_this) {
    var jobType = [
        {
            "parent_type_id": 1,
            "parent_type_name": "互联网",
            "sub_types": [
                {
                    "group_id": 100,
                    "group_name": "软件",
                    "group_values": [
                        {
                            "sub_type_id": 10000,
                            "sub_type_name": "IOS"
                        },
                        {
                            "sub_type_id": 10001,
                            "sub_type_name": "Android"
                        },
                        {
                            "sub_type_id": 10002,
                            "sub_type_name": "前端"
                        },
                        {
                            "sub_type_id": 10003,
                            "sub_type_name": "IT运维"
                        },
                        {
                            "sub_type_id": 10004,
                            "sub_type_name": "算法"
                        },
                        {
                            "sub_type_id": 10005,
                            "sub_type_name": "测试"
                        },
                        {
                            "sub_type_id": 10006,
                            "sub_type_name": "数据挖掘"
                        },
                        {
                            "sub_type_id": 10007,
                            "sub_type_name": "JAVA"
                        },
                        {
                            "sub_type_id": 10008,
                            "sub_type_name": "C/C++"
                        },
                        {
                            "sub_type_id": 10009,
                            "sub_type_name": "C#/.Net"
                        },
                        {
                            "sub_type_id": 10010,
                            "sub_type_name": "Hadoop"
                        },
                        {
                            "sub_type_id": 10011,
                            "sub_type_name": "python"
                        },
                        {
                            "sub_type_id": 10012,
                            "sub_type_name": "云计算/大数据"
                        },
                        {
                            "sub_type_id": 10013,
                            "sub_type_name": "Node.js"
                        },
                        {
                            "sub_type_id": 10014,
                            "sub_type_name": "PHP"
                        },
                        {
                            "sub_type_id": 10015,
                            "sub_type_name": "Ruby/Perl"
                        }
                    ]
                },
                {
                    "group_id": 101,
                    "group_name": "运营",
                    "group_values": [
                        {
                            "sub_type_id": 10100,
                            "sub_type_name": "产品运营"
                        },
                        {
                            "sub_type_id": 10101,
                            "sub_type_name": "用户运营"
                        },
                        {
                            "sub_type_id": 10102,
                            "sub_type_name": "SEO"
                        },
                        {
                            "sub_type_id": 10103,
                            "sub_type_name": "内容运营"
                        },
                        {
                            "sub_type_id": 10104,
                            "sub_type_name": "新媒体"
                        },
                        {
                            "sub_type_id": 10105,
                            "sub_type_name": "策划"
                        }
                    ]
                },
                {
                    "group_id": 102,
                    "group_name": "产品",
                    "group_values": [
                        {
                            "sub_type_id": 10200,
                            "sub_type_name": "用户研究"
                        },
                        {
                            "sub_type_id": 10201,
                            "sub_type_name": "需求分析助理"
                        },
                        {
                            "sub_type_id": 10202,
                            "sub_type_name": "产品助理"
                        }
                    ]
                },
                {
                    "group_id": 103,
                    "group_name": "设计",
                    "group_values": [
                        {
                            "sub_type_id": 10300,
                            "sub_type_name": "UI/UE"
                        },
                        {
                            "sub_type_id": 10301,
                            "sub_type_name": "Flash"
                        },
                        {
                            "sub_type_id": 10302,
                            "sub_type_name": "网页/美工"
                        },
                        {
                            "sub_type_id": 10303,
                            "sub_type_name": "2D/3D"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 2,
            "parent_type_name": "市场/商务",
            "sub_types": [
                {
                    "group_id": 200,
                    "group_name": "商务",
                    "group_values": [
                        {
                            "sub_type_id": 20000,
                            "sub_type_name": "商务"
                        },
                        {
                            "sub_type_id": 20001,
                            "sub_type_name": "招投标"
                        }
                    ]
                },
                {
                    "group_id": 201,
                    "group_name": "公关",
                    "group_values": [
                        {
                            "sub_type_id": 20100,
                            "sub_type_name": "媒介"
                        },
                        {
                            "sub_type_id": 20101,
                            "sub_type_name": "公关"
                        }
                    ]
                },
                {
                    "group_id": 2002,
                    "group_name": "销售",
                    "group_values": [
                        {
                            "sub_type_id": 20200,
                            "sub_type_name": "推广"
                        },
                        {
                            "sub_type_id": 20201,
                            "sub_type_name": "销售"
                        }
                    ]
                },
                {
                    "group_id": 203,
                    "group_name": "客服",
                    "group_values": [
                        {
                            "sub_type_id": 20300,
                            "sub_type_name": "客服服务"
                        },
                        {
                            "sub_type_id": 20301,
                            "sub_type_name": "销售支持"
                        }
                    ]
                },
                {
                    "group_id": 204,
                    "group_name": "市场",
                    "group_values": [
                        {
                            "sub_type_id": 20400,
                            "sub_type_name": "渠道/分析调研"
                        },
                        {
                            "sub_type_id": 20401,
                            "sub_type_name": "策划"
                        },
                        {
                            "sub_type_id": 20402,
                            "sub_type_name": "品牌"
                        },
                        {
                            "sub_type_id": 20403,
                            "sub_type_name": "市场"
                        }
                    ]
                },
                {
                    "group_id": 205,
                    "group_name": "外贸",
                    "group_values": [
                        {
                            "sub_type_id": 20500,
                            "sub_type_name": "报关员"
                        },
                        {
                            "sub_type_id": 20501,
                            "sub_type_name": "外贸专员"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 3,
            "parent_type_name": "通信/电气",
            "sub_types": [
                {
                    "group_id": 300,
                    "group_name": "通信",
                    "group_values": [
                        {
                            "sub_type_id": 30000,
                            "sub_type_name": "物联网"
                        },
                        {
                            "sub_type_id": 30001,
                            "sub_type_name": "射频"
                        },
                        {
                            "sub_type_id": 30002,
                            "sub_type_name": "通信"
                        }
                    ]
                },
                {
                    "group_id": 301,
                    "group_name": "硬件",
                    "group_values": [
                        {
                            "sub_type_id": 30100,
                            "sub_type_name": "嵌入式"
                        },
                        {
                            "sub_type_id": 30101,
                            "sub_type_name": "集成电路"
                        }
                    ]
                },
                {
                    "group_id": 302,
                    "group_name": "电子",
                    "group_values": [
                        {
                            "sub_type_id": 30200,
                            "sub_type_name": "光电"
                        },
                        {
                            "sub_type_id": 30201,
                            "sub_type_name": "电子工程"
                        },
                        {
                            "sub_type_id": 30202,
                            "sub_type_name": "半导体/芯片"
                        }
                    ]
                },
                {
                    "group_id": 303,
                    "group_name": "电气",
                    "group_values": [
                        {
                            "sub_type_id": 30300,
                            "sub_type_name": "电气设计"
                        },
                        {
                            "sub_type_id": 30301,
                            "sub_type_name": "电气工程"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 4,
            "parent_type_name": "人事/行政",
            "sub_types": [
                {
                    "group_id": 400,
                    "group_name": "人力资源",
                    "group_values": [
                        {
                            "sub_type_id": 40000,
                            "sub_type_name": "人事/HR"
                        },
                        {
                            "sub_type_id": 40001,
                            "sub_type_name": "招聘"
                        },
                        {
                            "sub_type_id": 40002,
                            "sub_type_name": "培训"
                        },
                        {
                            "sub_type_id": 40003,
                            "sub_type_name": "人力资源"
                        }
                    ]
                },
                {
                    "group_id": 401,
                    "group_name": "行政",
                    "group_values": [
                        {
                            "sub_type_id": 40100,
                            "sub_type_name": "助理"
                        },
                        {
                            "sub_type_id": 40101,
                            "sub_type_name": "前台"
                        },
                        {
                            "sub_type_id": 40102,
                            "sub_type_name": "行政"
                        },
                        {
                            "sub_type_id": 40103,
                            "sub_type_name": "文秘"
                        },
                        {
                            "sub_type_id": 40104,
                            "sub_type_name": "总裁助理"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 5,
            "parent_type_name": "财经/法律",
            "sub_types": [
                {
                    "group_id": 500,
                    "group_name": "金融",
                    "group_values": [
                        {
                            "sub_type_id": 50000,
                            "sub_type_name": "基金"
                        },
                        {
                            "sub_type_id": 50001,
                            "sub_type_name": "证券"
                        },
                        {
                            "sub_type_id": 50002,
                            "sub_type_name": "金融"
                        },
                        {
                            "sub_type_id": 50003,
                            "sub_type_name": "风控"
                        }
                    ]
                },
                {
                    "group_id": 501,
                    "group_name": "投资",
                    "group_values": [
                        {
                            "sub_type_id": 50100,
                            "sub_type_name": "分析师"
                        },
                        {
                            "sub_type_id": 50101,
                            "sub_type_name": "投资"
                        }
                    ]
                },
                {
                    "group_id": 502,
                    "group_name": "法律",
                    "group_values": [
                        {
                            "sub_type_id": 50200,
                            "sub_type_name": "合规"
                        },
                        {
                            "sub_type_id": 50201,
                            "sub_type_name": "律师"
                        },
                        {
                            "sub_type_id": 50202,
                            "sub_type_name": "法务"
                        }
                    ]
                },
                {
                    "group_id": 503,
                    "group_name": "银行",
                    "group_values": [
                        {
                            "sub_type_id": 50300,
                            "sub_type_name": "客户经理"
                        },
                        {
                            "sub_type_id": 50301,
                            "sub_type_name": "部门经理"
                        },
                        {
                            "sub_type_id": 50302,
                            "sub_type_name": "贷款"
                        },
                        {
                            "sub_type_id": 50303,
                            "sub_type_name": "大堂经理"
                        }
                    ]
                },
                {
                    "group_id": 504,
                    "group_name": "保险",
                    "group_values": [
                        {
                            "sub_type_id": 50400,
                            "sub_type_name": "业务"
                        },
                        {
                            "sub_type_id": 50401,
                            "sub_type_name": "保单"
                        }
                    ]
                },
                {
                    "group_id": 505,
                    "group_name": "财务会计",
                    "group_values": [
                        {
                            "sub_type_id": 50500,
                            "sub_type_name": "审计"
                        },
                        {
                            "sub_type_id": 50501,
                            "sub_type_name": "税务"
                        },
                        {
                            "sub_type_id": 50502,
                            "sub_type_name": "财务"
                        },
                        {
                            "sub_type_id": 50503,
                            "sub_type_name": "会计"
                        },
                        {
                            "sub_type_id": 50504,
                            "sub_type_name": "出纳"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 6,
            "parent_type_name": "媒体/艺术",
            "sub_types": [
                {
                    "group_id": 600,
                    "group_name": "广告",
                    "group_values": [
                        {
                            "sub_type_id": 60000,
                            "sub_type_name": "创意"
                        },
                        {
                            "sub_type_id": 60001,
                            "sub_type_name": "规划"
                        },
                        {
                            "sub_type_id": 60002,
                            "sub_type_name": "AE"
                        }
                    ]
                },
                {
                    "group_id": 601,
                    "group_name": "编辑",
                    "group_values": [
                        {
                            "sub_type_id": 60100,
                            "sub_type_name": "编辑"
                        },
                        {
                            "sub_type_id": 60101,
                            "sub_type_name": "采编"
                        },
                        {
                            "sub_type_id": 60102,
                            "sub_type_name": "校对"
                        },
                        {
                            "sub_type_id": 60103,
                            "sub_type_name": "排版"
                        }
                    ]
                },
                {
                    "group_id": 602,
                    "group_name": "媒体",
                    "group_values": [
                        {
                            "sub_type_id": 60200,
                            "sub_type_name": "记者"
                        },
                        {
                            "sub_type_id": 60201,
                            "sub_type_name": "主持"
                        },
                        {
                            "sub_type_id": 60202,
                            "sub_type_name": "播音"
                        },
                        {
                            "sub_type_id": 60203,
                            "sub_type_name": "编导"
                        }
                    ]
                },
                {
                    "group_id": 603,
                    "group_name": "艺术",
                    "group_values": [
                        {
                            "sub_type_id": 60300,
                            "sub_type_name": "演艺"
                        },
                        {
                            "sub_type_id": 60301,
                            "sub_type_name": "摄影"
                        }
                    ]
                },
                {
                    "group_id": 604,
                    "group_name": "设计",
                    "group_values": [
                        {
                            "sub_type_id": 60400,
                            "sub_type_name": "工业设计"
                        },
                        {
                            "sub_type_id": 60401,
                            "sub_type_name": "平面设计"
                        },
                        {
                            "sub_type_id": 60402,
                            "sub_type_name": "视觉设计"
                        },
                        {
                            "sub_type_id": 60403,
                            "sub_type_name": "美术设计"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 7,
            "parent_type_name": "咨询/教育",
            "sub_types": [
                {
                    "group_id": 700,
                    "group_name": "外语",
                    "group_values": [
                        {
                            "sub_type_id": 70000,
                            "sub_type_name": "翻译"
                        },
                        {
                            "sub_type_id": 70001,
                            "sub_type_name": "英语"
                        },
                        {
                            "sub_type_id": 70002,
                            "sub_type_name": "日语"
                        }
                    ]
                },
                {
                    "group_id": 701,
                    "group_name": "教育",
                    "group_values": [
                        {
                            "sub_type_id": 70100,
                            "sub_type_name": "幼教"
                        },
                        {
                            "sub_type_id": 70101,
                            "sub_type_name": "培训"
                        },
                        {
                            "sub_type_id": 70102,
                            "sub_type_name": "课程"
                        }
                    ]
                },
                {
                    "group_id": 702,
                    "group_name": "咨询",
                    "group_values": [
                        {
                            "sub_type_id": 70200,
                            "sub_type_name": "咨询"
                        },
                        {
                            "sub_type_id": 70201,
                            "sub_type_name": "顾问"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 8,
            "parent_type_name": "机械/建筑",
            "sub_types": [
                {
                    "group_id": 800,
                    "group_name": "机械制造",
                    "group_values": [
                        {
                            "sub_type_id": 80000,
                            "sub_type_name": "质量"
                        },
                        {
                            "sub_type_id": 80001,
                            "sub_type_name": "机械设计"
                        },
                        {
                            "sub_type_id": 80002,
                            "sub_type_name": "生产"
                        },
                        {
                            "sub_type_id": 80003,
                            "sub_type_name": "安全"
                        },
                        {
                            "sub_type_id": 80004,
                            "sub_type_name": "设备"
                        },
                        {
                            "sub_type_id": 80005,
                            "sub_type_name": "自动化"
                        }
                    ]
                },
                {
                    "group_id": 801,
                    "group_name": "建筑房产",
                    "group_values": [
                        {
                            "sub_type_id": 80100,
                            "sub_type_name": "城市规划"
                        },
                        {
                            "sub_type_id": 80101,
                            "sub_type_name": "市政工程"
                        },
                        {
                            "sub_type_id": 80102,
                            "sub_type_name": "工程造价"
                        },
                        {
                            "sub_type_id": 80103,
                            "sub_type_name": "土木"
                        },
                        {
                            "sub_type_id": 80104,
                            "sub_type_name": "建筑"
                        },
                        {
                            "sub_type_id": 80105,
                            "sub_type_name": "园林"
                        },
                        {
                            "sub_type_id": 80106,
                            "sub_type_name": "地产开发"
                        },
                        {
                            "sub_type_id": 80107,
                            "sub_type_name": "地产策划"
                        },
                        {
                            "sub_type_id": 80108,
                            "sub_type_name": "房产销售"
                        },
                        {
                            "sub_type_id": 80109,
                            "sub_type_name": "给排水"
                        },
                        {
                            "sub_type_id": 80110,
                            "sub_type_name": "物业管理"
                        }
                    ]
                }
            ]
        },
        {
            "parent_type_id": 9,
            "parent_type_name": "其他类型",
            "sub_types": [
                {
                    "group_id": 900,
                    "group_name": "物流采购",
                    "group_values": [
                        {
                            "sub_type_id": 90000,
                            "sub_type_name": "采购"
                        },
                        {
                            "sub_type_id": 90001,
                            "sub_type_name": "供应链"
                        },
                        {
                            "sub_type_id": 90002,
                            "sub_type_name": "物流"
                        }
                    ]
                },
                {
                    "group_id": 901,
                    "group_name": "食品快消",
                    "group_values": [
                        {
                            "sub_type_id": 90100,
                            "sub_type_name": "快消"
                        },
                        {
                            "sub_type_id": 90101,
                            "sub_type_name": "食品"
                        }
                    ]
                },
                {
                    "group_id": 902,
                    "group_name": "生物医疗",
                    "group_values": [
                        {
                            "sub_type_id": 90200,
                            "sub_type_name": "护理"
                        },
                        {
                            "sub_type_id": 90201,
                            "sub_type_name": "生物"
                        },
                        {
                            "sub_type_id": 90202,
                            "sub_type_name": "医药"
                        },
                        {
                            "sub_type_id": 90203,
                            "sub_type_name": "医生"
                        }
                    ]
                },
                {
                    "group_id": 903,
                    "group_name": "能源保护",
                    "group_values": [
                        {
                            "sub_type_id": 90300,
                            "sub_type_name": "矿产"
                        },
                        {
                            "sub_type_id": 90301,
                            "sub_type_name": "能源"
                        },
                        {
                            "sub_type_id": 90302,
                            "sub_type_name": "环保"
                        }
                    ]
                },
                {
                    "group_id": 904,
                    "group_name": "材料化工",
                    "group_values": [
                        {
                            "sub_type_id": 90400,
                            "sub_type_name": "材料"
                        },
                        {
                            "sub_type_id": 90401,
                            "sub_type_name": "化工"
                        }
                    ]
                },
                {
                    "group_id": 905,
                    "group_name": "NGO公益",
                    "group_values": [
                        {
                            "sub_type_id": 90500,
                            "sub_type_name": "志愿者"
                        }
                    ]
                },
                {
                    "group_id": 906,
                    "group_name": "其他",
                    "group_values": []
                }
            ]
        }
    ];
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return jobType;
        });
    } else {
        _this.jobType = jobType;
    }
})(this);