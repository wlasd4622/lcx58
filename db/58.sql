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
