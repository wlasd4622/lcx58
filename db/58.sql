drop table if exists users;
-- create table users(
--    `id` INT NOT NULL AUTO_INCREMENT,
--    `username` VARCHAR(100) NOT NULL COMMENT '用户名',
--    `password` VARCHAR(100) NOT NULL COMMENT '密码',
--    `created_date` DATE COMMENT '创建日期',
--    `update` DATE COMMENT '更新日期',
--    `cookie` TEXT COMMENT 'cookie',
--    `area` VARCHAR(100) COMMENT '用户所属区域',
--    `type` int COMMENT '用户类型 1:58账户,2:经纪人账户',
--    `status` int COMMENT '账户正常:0,密码错:4000,未实名认证:4001,认证超时:4002,用户名不存在:4003,账户异常:4004,账户需要设置cookie:4005',
--    PRIMARY KEY ( id )
-- );



drop table if exists house;
-- create table house(
--    `id` INT NOT NULL AUTO_INCREMENT,
--    `user_id` INT COMMENT '对应的user表主键ID',
--    `number` VARCHAR(100) COMMENT '房屋编号',
--    `status` INT COMMENT '免费刷新：直接刷新:0,未实名认证:4001,发布超过30天：发新帖3030,7天内超过4次:重新编辑3070,免费刷新用完：不管 :3100,个人删除 :3404,需返回修改 :3401,订单异常:3500 ,审核不通过 :3501',
--    `created_date` DATE COMMENT '创建日期',
--    `update` DATE COMMENT '更新日期',
--    `ignore` INT COMMENT '是否忽略0,1',
--    `block` INT  COMMENT '锁定，不让其它程序读取1',
--    PRIMARY KEY ( id )
-- );

drop table if exists house_list;
create table house_list(
   `id` INT NOT NULL AUTO_INCREMENT,
   `username` VARCHAR(100) DEFAULT NULL COMMENT '用户名',
   `password` VARCHAR(100) DEFAULT NULL COMMENT '密码',
   `key` varchar(255) DEFAULT NULL,
   `url` varchar(255) DEFAULT NULL,
   `block` INT  COMMENT '锁定，不让其它程序读取1',
   PRIMARY KEY ( id )
);

drop table if exists config;
create table config(
   `id` INT NOT NULL AUTO_INCREMENT,
   `key` VARCHAR(100) DEFAULT NULL COMMENT 'key',
   `value` VARCHAR(10000) DEFAULT NULL COMMENT 'value',
   `updata_date` Time COMMENT '更新时间',
   PRIMARY KEY ( id )
);



drop table if exists `log`;
create table `log`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `house_key` VARCHAR(100) DEFAULT NULL COMMENT '对应house_list表的key',
   `status` INT DEFAULT NULL COMMENT '状态',
   `create_date` DATE COMMENT '创建日期',
   PRIMARY KEY ( id )
);

-- 重新发布的房屋信息表
drop table if exists `house_info`;
create table `house_info`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `house_key` VARCHAR(100) DEFAULT NULL COMMENT '对应house_list表的key',
   `url` varchar(255) DEFAULT NULL,
   `status` INT DEFAULT NULL COMMENT '状态',
   `create_date` DATE COMMENT '创建日期',
   PRIMARY KEY ( id )
);



-- cookie
drop table if exists `cookie`;
create table `cookie`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `username` VARCHAR(100) DEFAULT NULL COMMENT '用户名',
   `value` varchar(9999) DEFAULT NULL COMMENT 'cookie',
   PRIMARY KEY ( id )
);

-- code
drop table if exists `code`;
create table `code`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `key` VARCHAR(100) DEFAULT NULL COMMENT 'key',
   `code` varchar(100) DEFAULT NULL COMMENT 'code',
   PRIMARY KEY ( id )
);

-- test
drop table if exists `test`;
create table `test`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `key` VARCHAR(100) DEFAULT NULL COMMENT 'key',
   `code` timestamp DEFAULT NULL COMMENT 'code',
   PRIMARY KEY ( id )
);
---------------------------------------
-- gj_user

drop table if exists `gj_user`;
create table `gj_user`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `username` VARCHAR(100) DEFAULT NULL COMMENT '用户名',
   `password` VARCHAR(100) DEFAULT NULL COMMENT '密码',
   `area` VARCHAR(100) DEFAULT NULL COMMENT '区域',
   `session` VARCHAR(4000) DEFAULT NULL COMMENT 'session',
   `account` VARCHAR(100) DEFAULT NULL COMMENT '推广币',
   `create_time` timestamp COMMENT '创建日期',
   `update_time` timestamp COMMENT '更新日期',
   PRIMARY KEY ( id )
);

insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('1atom1331','hao1917','北京',NOW(),'HUOKE_STATUS=1; aQQ_brokerguid=6A683DB2-0096-5738-9CDA-D98DA6E5C686; wmda_uuid=99721d90b855844a9716fc888d8ba59e; wmda_new_uuid=1; wmda_visited_projects=%3B8920741036080; 58tj_uuid=827f6bf8-ab82-4d37-8de7-f471b518fb24; sessid=CE7FD5AF-DB68-62ED-CAC0-7A417AFB5F3F; ajk_broker_ctid=14; ajk_broker_id=6850935; ajk_broker_uid=44150906; wmda_session_id_8920741036080=1559791109533-3b26d356-1302-06ae; anjukereg=sd3YfffKFkqoakRs; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=4; aaa=111; new_session=0; wmda_session_id_8920741036080=1559791109533-3b26d356-1302-06ae; aQQ_brokerauthinfos=OtDZISc3ZtKA9jE18ioF8DJwYM%2Fu7332238SK4m%2BLlrAztK0XLNBJV10SE23hW0P%2FnK5RxYGuIucx1fCuvGYprYZe5c%2BB8JN27PaTRBg44nrk9rib2zpqJVSQuE1XZfQY9GyrYDrCQP9hY096%2F4xYVRZs7J1F0FX6jtlS7hPGiwCRPzJMaDCks05FZ59HDLk0LA')
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('石家庄998','Wz123456','石家庄',NOW(),'unbind_time_6024663=1; FACEIDENTIFY_STATUS=1; HUOKE_STATUS=1; sessid=2517D68D-78AA-2B2B-4CE2-CD9322676C49; aQQ_brokerguid=8C7A8D2B-2197-74AD-1913-469D102AF52E; 58tj_uuid=1cab906f-0050-4105-8c15-b134b73e720a; new_uv=7; ajk_broker_id=5441090; ajk_broker_ctid=28; ajk_broker_uid=42685296; aQQ_brokerauthinfos=bNPYInJnP4WD%2BjA0%2ByAA8DN2aMPr7Xr73HIUL4u%2BLlrAzd61XbpLIF11Rx2zhWpR%2BXjpQkRVv4jHxgXAuvHMoeZKe5FoW8Z3lN2ldStR24jWkOblbDCizZVtP9A3Y5jVaNGIr4XsOTL8gIA968cMXl0K299JRRoB4j0zR78WFykKQ%2FrMM%2FLAk5o%2FHMwlGGHju%2BcEKdq2qA; als=0; wmda_uuid=1c11f3b8bbbf481c34e78ec380c6cf56; wmda_new_uuid=1; wmda_visited_projects=%3B8920741036080; anjukereg=tt3aevfCQkOsa0Zm; wmda_session_id_8920741036080=1559804452227-330b2bc1-8795-5ca9; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252Flogin%253Fhistory%253DaHR0cDovL3ZpcC41OGdhbmppLmNvbS91c2VyL2Jyb2tlcmhvbWVWMg%253D%253D')
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('武汉1号','Wz123456','武汉',NOW(),'HUOKE_STATUS=1; aQQ_brokerguid=6A683DB2-0096-5738-9CDA-D98DA6E5C686; wmda_uuid=99721d90b855844a9716fc888d8ba59e; wmda_new_uuid=1; wmda_visited_projects=%3B8920741036080; 58tj_uuid=827f6bf8-ab82-4d37-8de7-f471b518fb24; sessid=B7D0D2F5-0A67-8A3C-4AEC-62BDE7195B8A; anjukereg=8ku5mM%2BtK%2BtOIHX1; wmda_session_id_8920741036080=1559813516588-f659a16e-aa26-be3e; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=5; ajk_broker_id=5729370; ajk_broker_ctid=22; ajk_broker_uid=42982955; aQQ_brokerauthinfos=P9LXc3JtbtWD%2BTY8%2BC4A8DN2YMPq7n%2F3138VLYi4LlrAzd2zVblFIF1wEx3g2WUP%2BH%2B%2FFEZQ69ucylXIu%2F%2Bf8uZGe5c%2FUJFJgLPaTRBg4I%2Frk9iXUWz5zZtSRO4%2BbJLsYu%2BDrrzXAQ74jI014MIKXGQz27MmFRUH4z5gRu8fSixZE%2FvOM6SQxc5uE8IgGTOz6eRTRok')
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('zhang65971','hao1917','',NOW(),'HUOKE_STATUS=1; sessid=944C5FF8-BDC8-BB01-2EB2-A4D399B01046; aQQ_brokerguid=90280DA0-F0D9-F332-3E13-D15FC1FC02FE; wmda_uuid=2d4ba9027cd1c963a5ee2dcd0874f245; wmda_new_uuid=1; wmda_session_id_8920741036080=1559818970881-912cd9d9-22ea-2133; wmda_visited_projects=%3B8920741036080; anjukereg=pELrypiqJ75DJHrx; 58tj_uuid=dc801153-5a7b-46f4-a999-5a3131133552; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252Flogin%252F%253Ferrmsg%253D%2525E7%252594%2525A8%2525E6%252588%2525B7%2525E5%252590%25258D%2525E5%2525AF%252586%2525E7%2525A0%252581%2525E9%252594%252599%2525E8%2525AF%2525AF; new_uv=1; ajk_broker_id=6851011; ajk_broker_ctid=14; ajk_broker_uid=44150986; aQQ_brokerauthinfos=adDfcHEzbdOA9jE0%2BygB8DJ1acft63j23X8XIouyLlrAztK0XbpDIV11Qky0i2UOrXjvQ0YGvYiVyFDHvKLK8rccfMFsAMBLvZqddRBY5rTXkpycFTbyqtBsTeoPY5XWWdGKqYDnCAr0hYU12v4xCVUKtOQmQxcHujA2Rr8ZGSwDE6rMMaHEwZ9pQMN2TmeI6A')
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('liu79921','hao1917','',NOW(),'HUOKE_STATUS=1; sessid=45B10D70-3B55-EDC8-6710-58947F4F7B81; aQQ_brokerguid=6EC7C0F3-68F0-5E66-1DC5-14438D628262; anjukereg=9R27n82rfu1KJ3v6; wmda_uuid=1303c9a94ca47a31f19d446e60c4d5e0; wmda_new_uuid=1; wmda_session_id_8920741036080=1559819577142-63dd3fd9-4ccb-5def; wmda_visited_projects=%3B8920741036080; 58tj_uuid=2eb32489-1e7d-4b65-9044-a90930dc3af5; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=1; ajk_broker_id=6851025; ajk_broker_ctid=14; ajk_broker_uid=44151001; aQQ_brokerauthinfos=ON2LfXdgZ4GA9jE0%2BysF8DR6aMPt7Xr%2F1ngVKIm%2FLlrAztK0XbpAJV0mERi3iWkO%2BC%2B8FUoEt43FnQfF7%2FPK97ZPK8NtW5BKvZqddRBY5rTXkpycFTbyqtBsTeoPY5XWWdGKqYDnCAr0gI0w2v4xUAwO5rImE0EHuD8zR70WHiYNQ%2F3JMKPPnsk%2FF5l8GTKI6A');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('QQ63623','hao1917','',NOW(),'HUOKE_STATUS=1; sessid=7B0EA17C-8595-0B2F-696E-CA412405E146; aQQ_brokerguid=26E95402-E7BA-418C-0196-1C97222691E8; anjukereg=9xjvzcmrKblMInX0; wmda_uuid=4827c5cbcafc6940719269ad1c020ff2; wmda_new_uuid=1; wmda_session_id_8920741036080=1559819631168-b3c3429e-825f-811a; wmda_visited_projects=%3B8920741036080; 58tj_uuid=22faee9a-612f-4ab9-9ef5-5b43d446d5ff; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=1; ajk_broker_id=6849420; ajk_broker_ctid=14; ajk_broker_uid=44149337; aQQ_brokerauthinfos=PIfaJ3sxbNaA9jA8%2FysA8DJ1acft63j62ngSLIK%2BLlrAztK1Vb5AIF0iFU3g2DwGpC%2FoFRMGt4qdy1eT7f%2BbprsZLZU4BpMdvZqddRBY5rTX1pifFSvIt9BsTeoPY5XWWdGKqYDnCAr0g4Yz2v4xDF8J4O5yEhUB7DszEb9IFn0LQq2faqDHl8o%2FRMJxTjCI6A');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('maigebaoma2','hao1917','',NOW(),'HUOKE_STATUS=1; sessid=E95013B3-0D44-3209-0F53-82EE420EBDE1; aQQ_brokerguid=1B8A15B4-77DC-EB2B-96C9-0859A44E83DF; anjukereg=q0q9xMWsKOZCI3fw; wmda_uuid=a75df4231902aa01b91f2c70a998bc24; wmda_new_uuid=1; wmda_session_id_8920741036080=1559819865350-2d0647a5-f3ab-7e40; wmda_visited_projects=%3B8920741036080; 58tj_uuid=19cdb7d6-ae9c-4d25-9726-ce6b5da3154d; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=1; ajk_broker_id=6850976; ajk_broker_ctid=14; ajk_broker_uid=44150949; aQQ_brokerauthinfos=aNWIIntlON6A9jE18i4G8DN2bsfv6nj323MVKYOyLl%2FwyNq0XbpLI11xSBuzhGoBlC67FkZT79zGmgfAvqKd%2FLJMKJJoVJMfh4%2BaHXwI4%2BKUl6PzTQauwulrQOg2bZPsYeyyqcXsfw6%2F5vkN5M8LYVoP4d9JFhYB4jEyS7MWHRczKPjPZKXGwZ1uHZ8mTWaw6%2BUBKYuM%2BwsD%2FA7PPE8awQ3wDIs');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('anjuke5','hao1917','',NOW(),'HUOKE_STATUS=1; sessid=C90436D1-7D6E-0171-98E5-711C64C6019D; aQQ_brokerguid=D2E52DE9-072A-A1CA-329B-CBB108DCE785; anjukereg=okrqycz6e7tDJXT6; wmda_uuid=a75df4231902aa01b91f2c70a998bc24; wmda_session_id_8920741036080=1559819934758-6f1c68fa-6989-f146; wmda_visited_projects=%3B8920741036080; 58tj_uuid=19cdb7d6-ae9c-4d25-9726-ce6b5da3154d; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=1; ajk_broker_id=7468181; ajk_broker_ctid=14; ajk_broker_uid=44792540; aQQ_brokerauthinfos=boHXdHNnPNGB%2BjI9%2BiEB8DBwa8Ps6nz%2B2XgXK465LlrAz963VLtKIV0iFBix3zhRrnztFBAAtt6XzVPF4aGa%2FbJNfJI%2FAMYevZqddRBY5rTX1pifFSvIt9BsTeoPY5XWWdGKqYDnCAr0jIE02v4xC10D4u5wEEcDvzFnQ7MXSisDFPuZNqfGnpZoQ5x8H2aI6A');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('think999','hao1917','',NOW(),'HUOKE_STATUS=1; sessid=B4BA8203-4BBE-B77E-1938-E91888BAAF06; aQQ_brokerguid=743CB682-A6F4-04E2-D100-67800E482D71; anjukereg=qxq9y8z%2FfrtCJHL7; wmda_uuid=1f364b3c46bf2559ba1ecb92c2b52482; wmda_new_uuid=1; wmda_session_id_8920741036080=1559819965881-ea357eba-a38a-bdb3; wmda_visited_projects=%3B8920741036080; 58tj_uuid=63ff6879-c40f-4791-96d1-8ef30e0477a1; new_session=1; init_refer=http%253A%252F%252Fvip.58ganji.com%252F; new_uv=1; ajk_broker_id=6851004; ajk_broker_ctid=14; ajk_broker_uid=44150979; aQQ_brokerauthinfos=PYHac3YzO4aA9jE0%2BykE8DN3bsXs7X7%2F1nkRL4%2BzLlrAztK0XbpCJF0jExe1iGUOryjuQkEH69uXmgfA6qXN8rdIL8ZoAape0%2BWlTS1g583Q6Z%2BicxWSzOFofO4zZ6nsYe2OpY3vCQL6hLwN2pIOC1UOtOF2FBNVujxhFrpKGi5bFfjEMKOUns09FMsnIWc');




insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('yaoshayanzheng1','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('hduasdhoad2','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('uhdahdoa2','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('75mwf4','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('thinkid2','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('dell64012','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('7plus3','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('mengmeng5','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('廊坊1号','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('廊坊010号','hao1917','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('重庆老账号','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('重庆店之家','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('石家庄998账号二','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('石家庄998账号三','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('石家庄998账号四','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('石家庄998账号五','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('石家庄998账号六','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('W15810915325','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('ww15810915325','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('www18411009557','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('成都2号','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('成都1号','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('成都3号','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('1539585837_gnj','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('青岛1号','Wz123456','',NOW(),'');
insert into `gj_user`(`username`,`password`,`area`,`create_time`,`session`) values('石家庄店之家','Wz123456','',NOW(),'');


---------------------------------------
drop table if exists `gj_service`;
create table `gj_service`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `user_id` int DEFAULT NULL COMMENT 'user_id',
   `username` VARCHAR(100) DEFAULT NULL COMMENT '用户名',
   `status` VARCHAR(100) DEFAULT NULL COMMENT '状态',
   `start` VARCHAR(100) DEFAULT NULL COMMENT '开始日期',
   `end` VARCHAR(100) DEFAULT NULL COMMENT '结束日期',
   `days` int COMMENT '剩余天数',
   `create_time` timestamp COMMENT '更新时间',
   PRIMARY KEY ( id )
);
---------------------------------------
--推送
drop table if exists `gj_push`;
create table `gj_push`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `user_id` int DEFAULT NULL COMMENT 'user_id',
   `username` VARCHAR(100) DEFAULT NULL COMMENT '用户名',
   `in_progress` VARCHAR(100) DEFAULT NULL COMMENT '推送中',
   `surplus` VARCHAR(100) DEFAULT NULL COMMENT '还可推送',
   `expire` VARCHAR(100) DEFAULT NULL COMMENT '今日推送到期',
   `purchase` VARCHAR(100) DEFAULT NULL COMMENT '在线购买',
   `create_time` timestamp COMMENT '更新时间',
   PRIMARY KEY ( id )
);


insert into `gj_push`(`user_id`,`username`,`in_progress`,`surplus`,`expire`,`purchase`,`create_time`)
values(1,'石家庄998','1','2','3','4',NOW())
---------------------------------------
---------------------------------------
--推广
drop table if exists `gj_extension`;
create table `gj_extension`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `user_id` int DEFAULT NULL COMMENT 'user_id',
   `username` VARCHAR(100) DEFAULT NULL COMMENT '用户名',
   `account` VARCHAR(100) DEFAULT NULL COMMENT '推广币',
   `expire` VARCHAR(100) DEFAULT NULL COMMENT '到期时间',
   `quantity` VARCHAR(100) DEFAULT NULL COMMENT '可用数量',
   `create_time` timestamp COMMENT '更新时间',
   PRIMARY KEY ( id )
);

--gj_refresh_house_log
drop table if exists `gj_refresh_house_log`;
create table `gj_refresh_house_log`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `user_id` int DEFAULT NULL COMMENT 'user_id',
   `user_name` VARCHAR(100) DEFAULT NULL COMMENT 'user_name',
   `house_id` VARCHAR(100) DEFAULT NULL COMMENT 'house_id',
   `status` VARCHAR(100) DEFAULT NULL COMMENT 'status',
   `message` VARCHAR(100) DEFAULT NULL COMMENT 'message',
   `create_time` timestamp COMMENT '创建时间',
   PRIMARY KEY ( id )
);

--gj_house_id
drop table if exists `gj_house_id`;
create table `gj_house_id`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `user_id` int DEFAULT NULL COMMENT 'user_id',
   `user_name` VARCHAR(100) DEFAULT NULL COMMENT 'user_name',
   `house_id` VARCHAR(100) DEFAULT NULL COMMENT 'house_id',
   `gj_id` VARCHAR(100) DEFAULT NULL COMMENT 'gj_id',
   `create_time` timestamp COMMENT '创建时间',
   PRIMARY KEY ( id )
);

--ip_white_list
drop table if exists `ip_white_list`;
create table `ip_white_list`(
   `id` INT NOT NULL AUTO_INCREMENT,
   `ip` VARCHAR(100) DEFAULT NULL COMMENT 'ip',
   `remarks` VARCHAR(100) DEFAULT NULL COMMENT '备注',
   `disabled` INT DEFAULT NULL COMMENT '是否禁用:0禁用，1启用',
   PRIMARY KEY ( id )
);
-------------------------------------
insert into `ip_white_list` (`ip`,`remarks`,`disabled`)
values ('112.35.36.4','公司电脑',1);
insert into `ip_white_list` (`ip`,`remarks`,`disabled`)
values ('124.65.158.254','公司电脑',1);

-------------------------------------
insert into `gj_house_id` (`house_id`,`gj_id`,`create_time`)
values (1,1,now())
-------------------------------------
insert into `gj_refresh_house_log`(`user_id`,`user_name`,`house_id`,`status`,`message`,`create_time`)
values(1,'1111','sdfsf','2','3',NOW())
-------------------------------------
insert into `gj_extension`(`user_id`,`username`,`account`,`expire`,`quantity`,`create_time`)
values(1,'石家庄998','1','2','3',NOW())
SELECT * from gj_extension;
---------------------------------------

SELECT * from users WHERE id=1
SELECT * FROM users WHERE type=1 and status=0 LIMIT 1
INSERT INTO users (`username`,`password`,`type`,`status`) VALUES ('13335007725','999oo999',1,0)
INSERT INTO users (`username`,`password`,`type`,`status`) VALUES ('wlasd4622','111qqq',1,0)

INSERT INTO house (`user_id`,`number`,`ignore`) VALUES (1,'38183838320520',1)
SELECT * FROM house WHERE `ignore`=1 and `block` is null
UPDATE house SET `block`=1 WHERE id=

UPDATE house SET `block`=null

update `gj_user` set `session`="",`update_time`=NOW() where id=1


SELECT * from `log`



INSERT INTO test (`username`,`create_date`) VALUES ("ff","2018-11-18");
INSERT INTO test (`username`,`create_date`) VALUES ("ff22","2012-01-27");
INSERT INTO test (`username`,`create_date`) VALUES ("ff","2018-03-11");
INSERT INTO test (`username`,`create_date`) VALUES ("ff22","2018-04-17");
INSERT INTO test (`username`,`create_date`) VALUES ("ff","2018-05-01");
INSERT INTO test (`username`,`create_date`) VALUES ("ff11","2018-04-15");
INSERT INTO test (`username`,`create_date`) VALUES ("ff","2018-03-21");
INSERT INTO test (`username`,`create_date`) VALUES ("ff11","2018-02-11");
INSERT INTO test (`username`,`create_date`) VALUES ("ff","2018-08-22");
INSERT INTO test (`username`,`create_date`) VALUES ("ff1111","2018-08-22");
INSERT INTO test (`username`,`create_date`) VALUES ("ff2222","2018-08-22");
INSERT INTO test (`username`,`create_date`) VALUES ("ffff","2018-05-06");
