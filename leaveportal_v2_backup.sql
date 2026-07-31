CREATE DATABASE  IF NOT EXISTS `leaveportal_v2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `leaveportal_v2`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: leaveportal_v2
-- ------------------------------------------------------
-- Server version	8.0.43

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

--
-- Table structure for table `_employeemanagers`
--

DROP TABLE IF EXISTS `_employeemanagers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_employeemanagers` (
  `A` int NOT NULL,
  `B` int NOT NULL,
  UNIQUE KEY `_employeemanagers_AB_unique` (`A`,`B`),
  KEY `_employeemanagers_B_index` (`B`),
  CONSTRAINT `_employeemanagers_A_fkey` FOREIGN KEY (`A`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_employeemanagers_B_fkey` FOREIGN KEY (`B`) REFERENCES `profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_employeemanagers`
--

LOCK TABLES `_employeemanagers` WRITE;
/*!40000 ALTER TABLE `_employeemanagers` DISABLE KEYS */;
INSERT INTO `_employeemanagers` VALUES (6,1),(2,8),(6,8),(3,10);
/*!40000 ALTER TABLE `_employeemanagers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actor_id` int DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_table` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_id` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compoffgrant`
--

DROP TABLE IF EXISTS `compoffgrant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compoffgrant` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `daysGranted` double NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grantedBy` int DEFAULT NULL,
  `workedDates` json DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'approved',
  `adminNote` text COLLATE utf8mb4_unicode_ci,
  `grantedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `compoffgrant_employeeId_fkey` (`employeeId`),
  KEY `compoffgrant_grantedBy_fkey` (`grantedBy`),
  CONSTRAINT `compoffgrant_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `compoffgrant_grantedBy_fkey` FOREIGN KEY (`grantedBy`) REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compoffgrant`
--

LOCK TABLES `compoffgrant` WRITE;
/*!40000 ALTER TABLE `compoffgrant` DISABLE KEYS */;
INSERT INTO `compoffgrant` VALUES (1,6,1,'please',1,'null','approved','','2026-07-03 06:38:11.669'),(2,6,1,'jiijijiji',1,'null','approved',NULL,'2026-07-03 07:49:55.310'),(3,6,1,'ijijijiji',1,'null','approved',NULL,'2026-07-03 07:53:56.183'),(4,6,1,'kokokokok',1,'null','approved',NULL,'2026-07-13 11:38:05.652'),(5,6,1,'hhhhhhhhhhh',1,'null','approved',NULL,'2026-07-13 11:38:32.956'),(6,6,1,'yyyyyyy',1,'null','approved',NULL,'2026-07-13 11:41:18.022'),(7,6,1,'wwwwww',1,'null','rejected','nnnnnnn','2026-07-13 11:43:14.355'),(8,6,1,'wwwwwww',1,'null','rejected','weqwewq','2026-07-13 12:05:17.013'),(9,9,1,'test',NULL,'[\"2026-06-30\"]','pending',NULL,'2026-07-14 11:31:36.355'),(10,9,1,'Worked on sunday',NULL,'[\"2026-06-30\"]','pending',NULL,'2026-07-14 11:33:56.567'),(11,3,3,'qwqwqw',NULL,'[\"2026-07-02\", \"2026-06-29\", \"2026-07-09\"]','pending',NULL,'2026-07-15 07:41:54.026'),(12,3,1,'zzzzz',9,'[\"2026-07-09\"]','rejected','aise hi ','2026-07-15 07:42:16.164'),(13,3,1,'kkkkkk',NULL,'[\"2026-07-09\"]','pending',NULL,'2026-07-15 07:45:02.421'),(14,3,1,'nnnaa',NULL,'[\"2026-07-16\"]','pending',NULL,'2026-07-22 08:17:23.382'),(15,6,1,'kmmkkmk',9,'[\"2026-07-16\"]','rejected','aaaaaaaaaaaaaa','2026-07-22 08:26:01.482');
/*!40000 ALTER TABLE `compoffgrant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `head_id` int DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `departments_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `holidays`
--

DROP TABLE IF EXISTS `holidays`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `holidays` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime(3) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `holidays_date_key` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `holidays`
--

LOCK TABLES `holidays` WRITE;
/*!40000 ALTER TABLE `holidays` DISABLE KEYS */;
/*!40000 ALTER TABLE `holidays` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `leave_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `end_date` datetime(3) NOT NULL,
  `total_days` double NOT NULL,
  `paid_days` double DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `approved_at` datetime(3) DEFAULT NULL,
  `rejected_at` datetime(3) DEFAULT NULL,
  `withdrawal_requested_at` datetime(3) DEFAULT NULL,
  `withdrawn_at` datetime(3) DEFAULT NULL,
  `withdrawn_dates` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leave_requests_employee_id_fkey` (`employee_id`),
  KEY `leave_requests_approved_by_fkey` (`approved_by`),
  CONSTRAINT `leave_requests_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `profiles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `leave_requests_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
INSERT INTO `leave_requests` VALUES (1,6,'Casual Leave (Unpaid - Probation)','2026-07-09 00:00:00.000','2026-07-10 00:00:00.000',1,NULL,'aise hi ','rejected',NULL,'aise hi ',NULL,'2026-07-01 13:03:09.769',NULL,NULL,'[\"2026-07-10\"]','2026-07-01 11:46:38.245','2026-07-01 13:03:09.772'),(2,6,'Sick Leave (Unpaid - Probation)','2026-07-23 00:00:00.000','2026-07-27 00:00:00.000',5,NULL,'lllllllll','rejected',NULL,'jijiji',NULL,'2026-07-01 12:59:08.970',NULL,NULL,'null','2026-07-01 12:50:09.235','2026-07-01 12:59:09.010'),(3,6,'Sick Leave (Unpaid - Probation)','2026-07-16 00:00:00.000','2026-07-20 00:00:00.000',5,NULL,'huhuhuhu','rejected',NULL,'kokokokoko',NULL,'2026-07-01 13:38:14.026',NULL,NULL,'null','2026-07-01 13:13:40.846','2026-07-01 13:38:14.030'),(4,6,'Sick Leave (Unpaid - Probation)','2026-07-07 00:00:00.000','2026-07-07 00:00:00.000',1,NULL,'qiqiiqi','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-01 13:43:50.408','null','2026-07-01 13:41:50.542','2026-07-01 13:43:50.419'),(5,6,'Casual Leave (Unpaid - Probation)','2026-07-09 00:00:00.000','2026-07-13 00:00:00.000',5,NULL,'jjjjjjjj','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-01 14:02:59.574','null','2026-07-01 13:46:13.159','2026-07-01 14:02:59.579'),(6,6,'Sick Leave (Unpaid - Probation)','2026-07-24 00:00:00.000','2026-07-27 00:00:00.000',4,NULL,'sasaaaaaa','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-01 14:02:38.779','null','2026-07-01 13:57:22.931','2026-07-01 14:02:38.817'),(7,6,'Casual Leave (Unpaid - Probation)','2026-07-10 00:00:00.000','2026-07-13 00:00:00.000',2,NULL,'opopopopo','approved',NULL,NULL,'2026-07-01 14:04:30.797',NULL,NULL,NULL,'null','2026-07-01 14:03:24.621','2026-07-01 14:04:30.803'),(8,6,'Sick Leave (Unpaid - Probation)','2026-07-09 00:00:00.000','2026-07-09 00:00:00.000',1,NULL,'jijijijjiji','rejected',NULL,'Probation Rule Theek Kiya: Ab probation mein hone ke bawajood agar aapke paas leave balance (jaise Comp-Off se) hai, toh system usko ignore nahi karega aur aapko \"Paid\" leave lene dega!',NULL,'2026-07-03 07:46:28.628',NULL,NULL,'null','2026-07-03 07:37:14.738','2026-07-03 07:46:28.644'),(9,6,'Casual Leave (Paid)','2026-07-17 00:00:00.000','2026-07-21 00:00:00.000',3,NULL,'jijijijiji','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-03 08:48:35.081','null','2026-07-03 07:58:16.987','2026-07-03 08:48:35.092'),(10,6,'Sick Leave (Paid)','2026-07-22 00:00:00.000','2026-07-24 00:00:00.000',3,NULL,'kokokokoko','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-03 08:55:33.187','null','2026-07-03 08:49:09.973','2026-07-03 08:55:33.223'),(11,6,'Sick Leave (Paid)','2026-07-21 00:00:00.000','2026-07-21 00:00:00.000',1,NULL,'lllllll','rejected',NULL,'ppppppp',NULL,'2026-07-03 09:08:10.503',NULL,NULL,'null','2026-07-03 08:57:24.297','2026-07-03 09:08:10.507'),(12,6,'Casual Leave (Paid)','2026-07-07 00:00:00.000','2026-07-07 00:00:00.000',1,NULL,'qwqwq22','rejected',NULL,'ooooooo',NULL,'2026-07-03 09:08:01.889',NULL,NULL,'null','2026-07-03 09:02:50.127','2026-07-03 09:08:01.897'),(13,6,'Sick Leave (Paid)','2026-07-06 00:00:00.000','2026-07-06 00:00:00.000',1,NULL,'uuiui','rejected',NULL,'qqqqqqq',NULL,'2026-07-03 09:14:45.929',NULL,NULL,'null','2026-07-03 09:08:26.050','2026-07-03 09:14:45.959'),(14,6,'Sick Leave (Paid)','2026-07-24 00:00:00.000','2026-07-24 00:00:00.000',1,NULL,'pppppp','rejected',NULL,'qqqqqq',NULL,'2026-07-03 09:14:40.826',NULL,NULL,'null','2026-07-03 09:09:11.281','2026-07-03 09:14:40.831'),(15,6,'Sick Leave (Paid)','2026-07-16 00:00:00.000','2026-07-16 00:00:00.000',0.5,NULL,'[Half-Day: Morning] wewws','rejected',NULL,'qqqqqq',NULL,'2026-07-03 09:14:30.600',NULL,NULL,'null','2026-07-03 09:11:39.301','2026-07-03 09:14:30.602'),(16,6,'Casual Leave (0.5 Paid, 0.5 Unpaid - Probation)','2026-07-15 00:00:00.000','2026-07-15 00:00:00.000',1,NULL,'swsww','rejected',NULL,'qqqqq',NULL,'2026-07-03 09:14:24.541',NULL,NULL,'null','2026-07-03 09:12:08.724','2026-07-03 09:14:24.545'),(17,6,'Sick Leave (3 Paid, 5 Unpaid - Probation)','2026-07-07 00:00:00.000','2026-07-16 00:00:00.000',3,NULL,'qwewqw','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-03 09:16:15.254','null','2026-07-03 09:15:13.230','2026-07-03 09:16:15.256'),(18,6,'Sick Leave (Paid)','2026-07-07 00:00:00.000','2026-07-07 00:00:00.000',1,NULL,'kokokoko','rejected',NULL,'hgytt',NULL,'2026-07-03 10:43:44.920',NULL,NULL,'null','2026-07-03 09:16:35.513','2026-07-03 10:43:44.923'),(19,6,'undefined (Paid)','2026-07-08 00:00:00.000','2026-07-08 00:00:00.000',1,NULL,'jijinjnj','approved',NULL,NULL,NULL,NULL,NULL,NULL,'null','2026-07-13 07:30:00.704','2026-07-13 07:30:00.704'),(20,6,'Sick Leave (5 Paid, 1 Unpaid - Probation)','2026-07-21 00:00:00.000','2026-07-28 00:00:00.000',6,NULL,'oooooo','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-13 12:17:17.365','null','2026-07-13 12:15:21.510','2026-07-13 12:17:17.375'),(21,2,'Casual Leave (Unpaid - Probation)','2026-07-14 00:00:00.000','2026-07-24 00:00:00.000',5,NULL,'jjjjjj','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-13 12:38:29.919','null','2026-07-13 12:20:50.470','2026-07-13 12:38:29.923'),(22,2,'Casual Leave (Unpaid - Probation)','2026-07-14 00:00:00.000','2026-07-22 00:00:00.000',2,NULL,',,mmm......--==\n','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-13 12:42:07.181','null','2026-07-13 12:38:53.201','2026-07-13 12:42:07.223'),(23,2,'Sick Leave (Unpaid - Probation)','2026-08-11 00:00:00.000','2026-08-18 00:00:00.000',2,NULL,'wqwqwqwq','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-13 13:48:25.166','null','2026-07-13 13:41:59.292','2026-07-13 13:48:25.187'),(24,2,'Sick Leave (Unpaid - Probation)','2026-07-14 00:00:00.000','2026-07-23 00:00:00.000',4,NULL,'waqwaqw','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-13 14:02:12.419','null','2026-07-13 13:53:42.810','2026-07-13 14:02:12.425'),(25,2,'Sick Leave (Unpaid - Probation)','2026-07-15 00:00:00.000','2026-07-22 00:00:00.000',3,NULL,'lllllll','rejected',NULL,'huhuhu',NULL,'2026-07-15 10:42:48.174',NULL,NULL,'[\"2026-07-16\", \"2026-07-20\", \"2026-07-21\"]','2026-07-13 14:02:43.108','2026-07-15 10:42:48.193'),(26,2,'Sick Leave (Unpaid - Probation)','2026-08-11 00:00:00.000','2026-08-18 00:00:00.000',3,NULL,'oooooo','pending',NULL,NULL,NULL,NULL,NULL,NULL,'[\"2026-08-13\", \"2026-08-17\", \"2026-08-18\"]','2026-07-13 14:03:58.791','2026-07-13 14:04:16.724'),(27,6,'Sick Leave (Paid)','2026-07-15 00:00:00.000','2026-07-15 00:00:00.000',1,NULL,'wwqqqq','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-14 08:32:47.877','null','2026-07-14 08:32:31.861','2026-07-14 08:32:47.885'),(28,6,'Sick Leave (Paid)','2026-07-22 00:00:00.000','2026-07-23 00:00:00.000',2,NULL,'wqwqwqwq','approved',NULL,NULL,'2026-07-14 08:39:48.665',NULL,NULL,NULL,'null','2026-07-14 08:33:21.179','2026-07-14 08:39:48.691'),(29,3,'Casual Leave (Paid)','2026-07-16 00:00:00.000','2026-07-16 00:00:00.000',1,NULL,'lokook','approved',NULL,NULL,'2026-07-15 06:48:31.992',NULL,NULL,NULL,'null','2026-07-15 06:48:09.830','2026-07-15 06:48:31.999'),(30,6,'Sick Leave (1 Paid, 1 Unpaid - Probation)','2026-08-03 00:00:00.000','2026-08-04 00:00:00.000',2,NULL,'nnjnj','rejected',NULL,'fdfdf',NULL,'2026-07-15 09:01:30.687',NULL,NULL,'null','2026-07-15 09:00:36.487','2026-07-15 09:01:30.725'),(31,6,'Sick Leave (Paid)','2026-07-21 00:00:00.000','2026-07-21 00:00:00.000',1,NULL,'vvgvgvg','approved',NULL,NULL,'2026-07-22 06:37:22.826',NULL,NULL,NULL,'null','2026-07-15 14:06:14.628','2026-07-22 06:37:22.835'),(32,6,'Sick Leave (Unpaid - Probation)','2026-07-24 00:00:00.000','2026-07-24 00:00:00.000',1,NULL,'hiiiiiiiiiiiiii','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-22 07:29:53.905','null','2026-07-22 06:35:15.154','2026-07-22 07:29:53.956'),(33,6,'Casual Leave (Unpaid - Probation)','2026-07-27 00:00:00.000','2026-07-27 00:00:00.000',1,NULL,'qqqqqqqqqq','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-22 07:29:57.643','null','2026-07-22 07:08:00.211','2026-07-22 07:29:57.653'),(34,6,'Sick Leave (Unpaid - Probation)','2026-07-30 00:00:00.000','2026-07-30 00:00:00.000',1,NULL,'hello hii','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-22 07:30:01.168','null','2026-07-22 07:16:37.059','2026-07-22 07:30:01.178'),(35,6,'Sick Leave (Unpaid - Probation)','2026-07-31 00:00:00.000','2026-07-31 00:00:00.000',1,NULL,'helllllllllllllooo','cancelled',NULL,NULL,NULL,NULL,NULL,'2026-07-22 07:30:05.437','null','2026-07-22 07:23:12.170','2026-07-22 07:30:05.444'),(36,6,'Casual Leave (Unpaid - Probation)','2026-07-29 00:00:00.000','2026-07-29 00:00:00.000',1,NULL,'qqqqq','rejected',NULL,'noooooooo',NULL,'2026-07-22 07:40:46.324',NULL,NULL,NULL,'2026-07-22 07:34:45.478','2026-07-22 07:40:46.334'),(37,3,'Casual Leave (Unpaid - LOP)','2026-07-23 00:00:00.000','2026-07-23 00:00:00.000',1,NULL,'qwqwqw','pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-22 08:01:51.529','2026-07-22 08:01:51.529'),(38,6,'Sick Leave (Unpaid - Probation)','2026-07-24 00:00:00.000','2026-07-24 00:00:00.000',1,NULL,'njnjnjnjn','approved',NULL,NULL,'2026-07-22 08:45:17.613',NULL,NULL,NULL,NULL,'2026-07-22 08:25:16.695','2026-07-22 08:45:17.670'),(39,6,'Casual Leave (Unpaid - Probation)','2026-07-22 00:00:00.000','2026-07-22 00:00:00.000',1,NULL,'qwqww','approved',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-22 10:24:49.684','2026-07-22 10:24:49.684'),(40,6,'Sick Leave (Unpaid - Probation)','2026-07-31 00:00:00.000','2026-07-31 00:00:00.000',1,NULL,'bbhjbhb','rejected',NULL,'sasasas',NULL,'2026-07-22 11:27:35.401',NULL,NULL,NULL,'2026-07-22 11:06:41.020','2026-07-22 11:27:35.426'),(41,3,'Casual Leave (Unpaid - LOP)','2026-07-10 00:00:00.000','2026-07-10 00:00:00.000',1,NULL,'nhhhh','approved',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-22 13:13:41.789','2026-07-22 13:13:41.789'),(42,3,'Sick Leave (Unpaid - LOP)','2026-07-08 00:00:00.000','2026-07-08 00:00:00.000',1,NULL,'mmmmmmmmmm','approved',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-22 13:14:34.135','2026-07-22 13:14:34.135'),(43,6,'Casual Leave (Unpaid - Probation)','2026-07-30 00:00:00.000','2026-07-30 00:00:00.000',1,NULL,'huhuhu','pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-25 12:48:14.303','2026-07-25 12:48:14.303');
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'employee',
  `department_id` int DEFAULT NULL,
  `designation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_joining` datetime(3) DEFAULT NULL,
  `total_leaves` int NOT NULL DEFAULT '0',
  `available_leaves` double NOT NULL DEFAULT '0',
  `comp_off_leaves` double NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `otp_code` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `otp_expires_at` datetime(3) DEFAULT NULL,
  `reset_token` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_token_expires_at` datetime(3) DEFAULT NULL,
  `verification_status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `profiles_email_key` (`email`),
  UNIQUE KEY `profiles_employee_code_key` (`employee_code`),
  KEY `profiles_department_id_fkey` (`department_id`),
  CONSTRAINT `profiles_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profiles`
--

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES (1,'Prem ','premnankani99@gmail.com','$2b$10$12E0o48syObv3AzeO5mCXOivr5/Po7CKYCm50bmHAiXrnljhLxQ5W',NULL,'admin',NULL,NULL,'EMP-01',NULL,0,0,0,0,0,1,NULL,NULL,NULL,NULL,'approved','2026-06-26 11:15:12.030','2026-07-22 10:10:42.351'),(2,'Sweety Agarwal','sweetyagarwal3113@gmail.com','$2b$10$iE46KCd6Df75UG/k4N0rMelRzAVwE1TPISDKBRbj9o/TCwhBRLHtu','','employee',NULL,'Full Stack Developer','EMP-02','2026-06-26 00:00:00.000',0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-06-26 12:49:14.810','2026-07-22 10:10:42.368'),(3,'Virendra','virendrapratapsingh2408@gmail.com','$2b$10$iE46KCd6Df75UG/k4N0rMelRzAVwE1TPISDKBRbj9o/TCwhBRLHtu','','employee',NULL,'Appian Developer','EMP-03','2025-12-01 00:00:00.000',0,0,1,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-06-26 13:55:37.622','2026-07-22 10:10:42.368'),(4,'Prem ','praffulsharma@gmail.com','$2b$10$iE46KCd6Df75UG/k4N0rMelRzAVwE1TPISDKBRbj9o/TCwhBRLHtu',NULL,'employee',NULL,NULL,'EMP-04',NULL,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'rejected','2026-06-29 13:15:35.173','2026-07-22 10:10:42.368'),(5,'Prem Nankani','2024bcamafsprem17028@poornima.edu.in','$2b$10$iE46KCd6Df75UG/k4N0rMelRzAVwE1TPISDKBRbj9o/TCwhBRLHtu','','employee',NULL,'','EMP-05','2026-06-30 00:00:00.000',0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-06-30 08:05:51.530','2026-07-22 10:10:42.368'),(6,'Prem','premn7111@gmail.com','$2b$10$iE46KCd6Df75UG/k4N0rMelRzAVwE1TPISDKBRbj9o/TCwhBRLHtu','','employee',NULL,'Full Stack Developer','EMP-06','2026-06-30 00:00:00.000',0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-06-30 11:55:06.923','2026-07-22 10:10:42.368'),(7,'Prerna Kanjani','kanjaniprerna1@gmail.com','$2b$10$12E0o48syObv3AzeO5mCXOivr5/Po7CKYCm50bmHAiXrnljhLxQ5W',NULL,'hr',NULL,NULL,'HR-01',NULL,0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-07-06 11:49:12.862','2026-07-22 10:10:42.351'),(8,'Harish Gyanani','gyanani.harish@gmail.com','$2b$10$12E0o48syObv3AzeO5mCXOivr5/Po7CKYCm50bmHAiXrnljhLxQ5W',NULL,'admin',NULL,NULL,'ADM-01',NULL,0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-07-06 11:49:12.952','2026-07-22 10:10:42.351'),(9,'Vijay Kamlani','kamlani.vijay@gmail.com','$2b$10$12E0o48syObv3AzeO5mCXOivr5/Po7CKYCm50bmHAiXrnljhLxQ5W',NULL,'admin',NULL,NULL,'ADM-02',NULL,0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-07-06 11:49:13.021','2026-07-22 10:10:42.351'),(10,'Kapil Sharma','qapil.sharma1702@gmail.com','$2b$10$12E0o48syObv3AzeO5mCXOivr5/Po7CKYCm50bmHAiXrnljhLxQ5W',NULL,'admin',NULL,NULL,'ADM-03',NULL,0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-07-06 11:49:13.087','2026-07-22 10:10:42.351'),(11,'Piyush Vaswani','piyushvaswani13@gmail.com','$2b$10$iE46KCd6Df75UG/k4N0rMelRzAVwE1TPISDKBRbj9o/TCwhBRLHtu',NULL,'employee',NULL,NULL,NULL,NULL,0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-07-22 10:09:01.532','2026-07-22 10:10:42.368'),(12,'Prerna','hr@alviontechnologies.com','$2b$10$12E0o48syObv3AzeO5mCXOivr5/Po7CKYCm50bmHAiXrnljhLxQ5W',NULL,'hr',NULL,NULL,NULL,NULL,0,0,0,1,0,1,NULL,NULL,NULL,NULL,'approved','2026-07-22 10:09:01.556','2026-07-22 10:10:42.351');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-31 16:24:46
