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

-- 테이블 test.groups 구조 내보내기
CREATE TABLE IF NOT EXISTS `groups` (
  `group_uuid` char(36) NOT NULL,
  `name` varchar(64) NOT NULL,
  `pic` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`group_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY `특정 그룹의 그룹 멤버 목록 조회용 인덱스` (`group_uuid`,`deleted_at`,`joined_at`) USING BTREE,
  CONSTRAINT `FK_member_groups` FOREIGN KEY (`group_uuid`) REFERENCES `groups` (`group_uuid`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_member_user` FOREIGN KEY (`user_uuid`) REFERENCES `user` (`user_uuid`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.photo 구조 내보내기
CREATE TABLE IF NOT EXISTS `photo` (
  `photo_uuid` char(36) NOT NULL,
  `post_uuid` char(36) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT '0',
  `world_uuid` char(36) DEFAULT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `size` bigint(20) NOT NULL DEFAULT '0',
  `hash` binary(32) NOT NULL,
  `format` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`photo_uuid`) USING BTREE,
  KEY `중복 탐지용 인덱스` (`hash`),
  KEY `포스트에 포함된 사진 인덱스` (`post_uuid`,`sort_order`) USING BTREE,
  KEY `FK_photo_world` (`world_uuid`),
  CONSTRAINT `FK_photo_post` FOREIGN KEY (`post_uuid`) REFERENCES `post` (`post_uuid`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_photo_world` FOREIGN KEY (`world_uuid`) REFERENCES `world` (`world_uuid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.post 구조 내보내기
CREATE TABLE IF NOT EXISTS `post` (
  `post_uuid` char(36) NOT NULL,
  `group_uuid` char(36) NOT NULL,
  `user_uuid` char(36) NOT NULL,
  `content` mediumtext,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`post_uuid`),
  KEY `그룹별 시간순 포스트 인덱스` (`group_uuid`,`deleted_at`,`created_at`,`post_uuid`) USING BTREE,
  KEY `FK_post_user` (`user_uuid`,`deleted_at`,`created_at`) USING BTREE,
  CONSTRAINT `FK_post_groups` FOREIGN KEY (`group_uuid`) REFERENCES `groups` (`group_uuid`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_post_user` FOREIGN KEY (`user_uuid`) REFERENCES `user` (`user_uuid`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.user 구조 내보내기
CREATE TABLE IF NOT EXISTS `user` (
  `user_uuid` char(36) NOT NULL,
  `google_sub` varchar(64) DEFAULT NULL,
  `nickname` varchar(50) NOT NULL,
  `pic` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_uuid`),
  UNIQUE KEY `google_id_token_UNIQUE` (`google_sub`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 내보낼 데이터가 선택되어 있지 않습니다.

-- 테이블 test.world 구조 내보내기
CREATE TABLE IF NOT EXISTS `world` (
  `world_uuid` char(36) NOT NULL DEFAULT '',
  `name` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`world_uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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

    INSERT INTO `groups` (
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
    FROM `groups`
    WHERE group_uuid = p_group_uuid
      AND deleted_at IS NULL;

END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
