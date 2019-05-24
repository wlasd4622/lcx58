 
DROP TABLE IF EXISTS `generalizes`;
CREATE TABLE `generalizes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `platform` varchar(45) DEFAULT NULL,
  `post_type` varchar(45) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `transfer_store_id` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `url2` varchar(255) DEFAULT NULL,
  `generalize_account` varchar(45) DEFAULT NULL,
  `status` varchar(45) DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `generalize_number` varchar(255) DEFAULT NULL COMMENT '推广编号',
  PRIMARY KEY (`id`) USING BTREE
)  