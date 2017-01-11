CREATE TABLE `types` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL DEFAULT '',
  `parent_type_name` varchar(20) DEFAULT NULL,
  `level` int(2) NOT NULL DEFAULT '0',
  `parent_type_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`type_id`),
  KEY `types_parent_type_id` (`parent_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
insert into `types` (`type_id`,`name`,`parent_type_name`,`parent_type_id`,`level`) values(1,'软件',null,0,1);
