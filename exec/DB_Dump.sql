-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: adplanet
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `ci_guideline`
--

DROP TABLE IF EXISTS `ci_guideline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ci_guideline` (
  `neutral_color` varchar(7) NOT NULL,
  `primary_color` varchar(7) NOT NULL,
  `secondary_color` varchar(7) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `logo_id` bigint NOT NULL,
  `template_id` bigint NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `neutral_guide` text NOT NULL,
  `primary_guide` text NOT NULL,
  `secondary_guide` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ci_guideline_logo` (`logo_id`),
  KEY `fk_ci_template` (`template_id`),
  CONSTRAINT `fk_ci_logo` FOREIGN KEY (`logo_id`) REFERENCES `logo` (`id`),
  CONSTRAINT `fk_ci_template` FOREIGN KEY (`template_id`) REFERENCES `ci_guideline_template` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ci_guideline`
--

LOCK TABLES `ci_guideline` WRITE;
/*!40000 ALTER TABLE `ci_guideline` DISABLE KEYS */;
/*!40000 ALTER TABLE `ci_guideline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ci_guideline_template`
--

DROP TABLE IF EXISTS `ci_guideline_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ci_guideline_template` (
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `background_rule` text NOT NULL,
  `basic_logo_rule` text NOT NULL,
  `margin_rule` text NOT NULL,
  `min_size_rule` text NOT NULL,
  `prohibition_rule` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ci_guideline_template`
--

LOCK TABLES `ci_guideline_template` WRITE;
/*!40000 ALTER TABLE `ci_guideline_template` DISABLE KEYS */;
/*!40000 ALTER TABLE `ci_guideline_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image_job`
--

DROP TABLE IF EXISTS `image_job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `image_job` (
  `status` tinyint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `group_id` bigint NOT NULL,
  `poster_id` bigint DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `id` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjvaa0ajoy9mdc274y7yqk786t` (`poster_id`),
  KEY `fk_imagejob_poster` (`group_id`),
  CONSTRAINT `fk_imagejob_poster` FOREIGN KEY (`group_id`) REFERENCES `poster_group` (`id`),
  CONSTRAINT `FKsrq0f1hw2rgv17npdjqtul1co` FOREIGN KEY (`poster_id`) REFERENCES `poster` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image_job`
--

LOCK TABLES `image_job` WRITE;
/*!40000 ALTER TABLE `image_job` DISABLE KEYS */;
INSERT INTO `image_job` VALUES (2,'2025-09-29 09:58:49.494408',1,1,'2025-09-29 09:59:05.095487','852bc8a1-3811-4144-814c-ae363581efcc'),(1,'2025-09-29 11:55:32.807882',3,NULL,'2025-09-29 11:55:33.032687','dbb93f78-69de-4c89-b9b8-590def5be1f6'),(3,'2025-09-29 09:59:50.089286',2,NULL,'2025-09-29 10:20:17.988283','f5903aa5-ddb9-4b37-8cff-3c43580077ab');
/*!40000 ALTER TABLE `image_job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logo`
--

DROP TABLE IF EXISTS `logo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logo` (
  `created_at` datetime(6) NOT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` varchar(100) NOT NULL,
  `img_url` varchar(200) DEFAULT NULL,
  `slogan` varchar(200) DEFAULT NULL,
  `prompt` varchar(255) NOT NULL,
  `style` enum('CARTOON','MONO','PUNK','SIMPLE') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK150g3t2bjq4c3hbod92dt2s1s` (`user_id`),
  CONSTRAINT `FK150g3t2bjq4c3hbod92dt2s1s` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logo`
--

LOCK TABLES `logo` WRITE;
/*!40000 ALTER TABLE `logo` DISABLE KEYS */;
INSERT INTO `logo` VALUES ('2025-09-29 10:48:41.300470',1,2,'ㄱㅎㄷ','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_1.png','ㄷㄱㅎ','ㄷㄱㅎ','SIMPLE'),('2025-09-29 10:53:08.576421',2,2,'ㅇㄴㅍ','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_2.png','ㄴㅍㅇ','ㄴㅍㅇ','SIMPLE'),('2025-09-29 10:56:50.611390',3,2,'ㅁㄴㅊ','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_3.png','ㅁㅊㄴ','ㅁㅊㄴ','SIMPLE'),('2025-09-29 10:58:03.817861',4,2,'ㅁㄴㅊ','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_4.png','ㅁㅊㄴ','ㅁㅊㄴ','SIMPLE'),('2025-09-29 11:36:53.283406',5,2,'ㅇㄴ','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_5.png','ㅇㄴㅍ','ㅍㄴㅇ','SIMPLE'),('2025-09-29 11:37:45.243688',6,2,'ㅇㄴ','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_6.png','ㅇㄴㅍ','ㅍㄴㅇ','SIMPLE'),('2025-09-29 11:44:19.634719',7,2,'ㄴㅇㅍ','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_7.png','ㅇㅍㄴ','ㅍㄴㅇ','SIMPLE'),('2025-09-29 11:47:41.724292',8,2,'ewf','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_8.png','efws','wef','SIMPLE'),('2025-09-29 11:53:29.269095',9,1,'AdPlanet','s3://ssafyapp-stg-project-prv-data/9qm4mj/logos/logo_9.png','AdPlanet','네이비색 배경의 행성 로고를 만들어줘\n','SIMPLE');
/*!40000 ALTER TABLE `logo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logo_tag`
--

DROP TABLE IF EXISTS `logo_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logo_tag` (
  `logo_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`logo_id`,`tag_id`),
  KEY `FKt76nhmqfcir4reqma0n9xs6xx` (`tag_id`),
  CONSTRAINT `FKbxl28pr4t7ha3481554hcq3ov` FOREIGN KEY (`logo_id`) REFERENCES `logo` (`id`),
  CONSTRAINT `FKt76nhmqfcir4reqma0n9xs6xx` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logo_tag`
--

LOCK TABLES `logo_tag` WRITE;
/*!40000 ALTER TABLE `logo_tag` DISABLE KEYS */;
INSERT INTO `logo_tag` VALUES (2,2),(3,2),(4,2),(5,2),(6,2),(7,2),(8,2),(9,3);
/*!40000 ALTER TABLE `logo_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poster`
--

DROP TABLE IF EXISTS `poster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poster` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `img_url` varchar(255) NOT NULL,
  `prompt` varchar(255) NOT NULL,
  `group_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9g629j6ueae0659sy9449hhw1` (`group_id`),
  CONSTRAINT `FK9g629j6ueae0659sy9449hhw1` FOREIGN KEY (`group_id`) REFERENCES `poster_group` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poster`
--

LOCK TABLES `poster` WRITE;
/*!40000 ALTER TABLE `poster` DISABLE KEYS */;
INSERT INTO `poster` VALUES (1,'2025-09-29 09:59:04.737120','s3://ssafyapp-stg-project-prv-data/9qm4mj/poster_1.png','스티브잡스가 워치 차고 있는 포스터 만들어줘',1),(2,'2025-09-29 10:00:21.706212','s3://ssafyapp-stg-project-prv-data/9qm4mj/poster_2.png','',1);
/*!40000 ALTER TABLE `poster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poster_group`
--

DROP TABLE IF EXISTS `poster_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poster_group` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `poster_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKp1f5a3i025acx0aaxnbu4f4yf` (`poster_id`),
  KEY `FKg45f722axqs2u5t6wrhdxe3ys` (`user_id`),
  CONSTRAINT `FKg45f722axqs2u5t6wrhdxe3ys` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKtod033a15jq5vdknq3kam68oh` FOREIGN KEY (`poster_id`) REFERENCES `poster` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poster_group`
--

LOCK TABLES `poster_group` WRITE;
/*!40000 ALTER TABLE `poster_group` DISABLE KEYS */;
INSERT INTO `poster_group` VALUES (1,'갤럭시 워치 8','2025-09-29 09:58:49.494408','스티브잡스',2,1),(2,'ㅁㄴㅇㄹ','2025-09-29 09:59:50.089286','ㄴㅁㅇㄹ',NULL,1),(3,'갤럭시 워치8\n','2025-09-29 11:55:32.807882','스티브잡스',NULL,1);
/*!40000 ALTER TABLE `poster_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poster_tag`
--

DROP TABLE IF EXISTS `poster_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poster_tag` (
  `group_id` bigint NOT NULL,
  `tag_id` bigint NOT NULL,
  PRIMARY KEY (`group_id`,`tag_id`),
  KEY `FK4ee1sgeauwkm76bf7ddporbpc` (`tag_id`),
  CONSTRAINT `FK4ee1sgeauwkm76bf7ddporbpc` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`),
  CONSTRAINT `FKt0qyr1jp903m1q2up27xt8aaa` FOREIGN KEY (`group_id`) REFERENCES `poster_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poster_tag`
--

LOCK TABLES `poster_tag` WRITE;
/*!40000 ALTER TABLE `poster_tag` DISABLE KEYS */;
INSERT INTO `poster_tag` VALUES (1,1);
/*!40000 ALTER TABLE `poster_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK1wdpsed5kna2y38hnbgrnhi5b` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'스티브잡스'),(2,'아름다운'),(3,'행성');
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'최진우','cjw1234577@gmail.com'),(2,'최지원','wldnjssem6@naver.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-29 11:56:04
