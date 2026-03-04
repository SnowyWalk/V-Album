-- --------------------------------------------------------
-- 호스트:                          127.0.0.1
-- 서버 버전:                        10.1.23-MariaDB - mariadb.org binary distribution
-- 서버 OS:                        Win64
-- HeidiSQL 버전:                  12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- test 데이터베이스 구조 내보내기
CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `test`;

-- 테이블 test.group 구조 내보내기
CREATE TABLE IF NOT EXISTS `group` (
  `group_uuid` char(36) NOT NULL,
  `name` varchar(64) NOT NULL,
  `pic` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`group_uuid`),
  UNIQUE KEY `group_uuid` (`group_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.member 구조 내보내기
CREATE TABLE IF NOT EXISTS `member` (
  `user_uuid` char(36) NOT NULL,
  `group_uuid` char(36) NOT NULL,
  `role` enum('Owner','Admin','Member') NOT NULL DEFAULT 'Member',
  `alias` varchar(64) DEFAULT NULL,
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_uuid`,`group_uuid`) USING BTREE,
  KEY `유저가 가입한 그룹 조회용 인덱스` (`user_uuid`,`deleted_at`) USING BTREE,
  KEY `특정 그룹의 그룹 멤버 목록 조회용 인덱스` (`group_uuid`,`deleted_at`,`joined_at`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.user 구조 내보내기
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_uuid` char(36) NOT NULL DEFAULT '',
  `google_sub` varchar(64) DEFAULT NULL,
  `nickname` varchar(50) NOT NULL,
  `pic` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `user_uuid_UNIQUE` (`user_uuid`),
  UNIQUE KEY `google_id_token_UNIQUE` (`google_sub`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 프로시저 test.sp_create_group 구조 내보내기
DELIMITER //
CREATE PROCEDURE `sp_create_group`(
	IN `p_group_uuid` CHAR(36),
	IN `p_group_name` VARCHAR(64),
	IN `p_user_uuid` CHAR(36)
)
BEGIN

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

    INSERT INTO `group` (
        group_uuid,
        name
    )
    VALUES (
        p_group_uuid,
        p_group_name
    );

    INSERT INTO `member` (
        user_uuid,
        group_uuid,
        role
    )
    VALUES (
        p_user_uuid,
        p_group_uuid,
        'Owner'
    );

    COMMIT;

    SELECT *
    FROM `group`
    WHERE group_uuid = p_group_uuid
      AND deleted_at IS NULL;

END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
