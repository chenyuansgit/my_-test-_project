/**
 * Created by chenyuan on 2017/1/10.
 */

'use strict';

// 从数据库表中获取数据批量加入查询引擎当中
var sql = `select rid,version,male,user_id,name,
avatar,work_state,highest_degree_stage,intern_expect_cid,intern_expect_city,
intern_expect_dur_type,intern_expect_position,intern_expect_position_type,intern_expect_days_type,
intern_expect_min_payment,education_detail,self_desc,refresh_time from resume  
where  is_public = 1 and status = 1  order by version desc limit 1`;
