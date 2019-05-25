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
---------------------------------------
SELECT * from users WHERE id=1
SELECT * FROM users WHERE type=1 and status=0 LIMIT 1
INSERT INTO users (`username`,`password`,`type`,`status`) VALUES ('13335007725','999oo999',1,0)
INSERT INTO users (`username`,`password`,`type`,`status`) VALUES ('wlasd4622','111qqq',1,0)

INSERT INTO house (`user_id`,`number`,`ignore`) VALUES (1,'38183838320520',1)
SELECT * FROM house WHERE `ignore`=1 and `block` is null
UPDATE house SET `block`=1 WHERE id=

UPDATE house SET `block`=null


SELECT * from `log`
