-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 08, 2025 at 06:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eventdriven`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2y$10$fNigF/5WK2enkPSOZzt68.bYKqtIMRxYl5i9.R2v3mcS48iPjK/Oi');

-- --------------------------------------------------------

--
-- Table structure for table `archive`
--

CREATE TABLE `archive` (
  `id` int(11) NOT NULL,
  `rooms` varchar(255) NOT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `archive`
--

INSERT INTO `archive` (`id`, `rooms`, `start_time`, `end_time`, `status`) VALUES
(3, 'B201', '11:39:00.000000', '13:39:00.000000', 'Occupied');

-- --------------------------------------------------------

--
-- Table structure for table `friday`
--

CREATE TABLE `friday` (
  `id` int(11) NOT NULL,
  `rooms` varchar(255) NOT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `monday`
--

CREATE TABLE `monday` (
  `id` int(11) NOT NULL,
  `rooms` varchar(255) NOT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monday`
--

INSERT INTO `monday` (`id`, `rooms`, `start_time`, `end_time`, `status`) VALUES
(1, 'B201', '08:00:00.000000', '10:00:00.000000', 'Occupied'),
(2, 'B201', '10:00:00.000000', '12:00:00.000000', 'Vacant'),
(4, '201', '13:00:00.000000', '15:00:00.000000', 'Vacant');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `day` varchar(20) DEFAULT NULL,
  `reservation_time` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservations`
--

INSERT INTO `reservations` (`id`, `user_id`, `user_name`, `room`, `purpose`, `day`, `reservation_time`, `status`) VALUES
(1, 3, 'Paul', 'B201', 'Class Meeting', 'monday', '2025-12-08 10:19:35', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `reservation_requests`
--

CREATE TABLE `reservation_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `purpose` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reservation_requests`
--

INSERT INTO `reservation_requests` (`id`, `user_id`, `room`, `date`, `start_time`, `end_time`, `purpose`, `status`, `created_at`) VALUES
(1, 3, 'B202', '2025-12-01', '00:00:00', '00:00:00', 'world', 'approved', '2025-12-01 01:27:17'),
(2, 3, 'B202', '2025-12-01', '00:00:00', '00:00:00', 'Wat', 'approved', '2025-12-01 01:30:36'),
(3, 3, 'B202', '2025-12-01', '00:00:00', '00:00:00', 'Yes', 'approved', '2025-12-01 01:34:21'),
(4, 3, 'B202', '2025-12-01', '00:00:00', '00:00:00', 'Yes', 'approved', '2025-12-01 01:41:26'),
(5, 3, 'B201', '2025-12-01', '10:00:00', '12:00:00', 'World', 'approved', '2025-12-01 02:19:41'),
(6, 3, 'B201', '2025-12-08', '10:32:00', '11:31:00', 'Class Meeting', 'approved', '2025-12-08 02:31:51'),
(7, 3, 'B201', '2025-12-08', '11:39:00', '13:39:00', 'Class Meeting', 'approved', '2025-12-08 02:38:50'),
(8, 3, 'B201', '2025-12-09', '08:00:00', '10:00:00', 'Class Meeting', 'approved', '2025-12-08 02:47:06');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `rooms` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `rooms`, `type`, `status`) VALUES
(1, 'B201', 'Laboratory', 'Occupied'),
(2, 'B202', 'Laboratory', 'Vacant');

-- --------------------------------------------------------

--
-- Table structure for table `table1`
--

CREATE TABLE `table1` (
  `id` int(11) NOT NULL,
  `fullname` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `confirm_password` varchar(255) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `occupation` varchar(50) NOT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `table1`
--

INSERT INTO `table1` (`id`, `fullname`, `email`, `password`, `confirm_password`, `gender`, `occupation`, `created_at`) VALUES
(1, 'Paul', 'sample@gmail.com', '$2y$10$qsGWw3AG8Kcz91xFBZ4z1.KIIcUSLjaxWlw80iETP6udSTVGp4Vda', '$2y$10$qsGWw3AG8Kcz91xFBZ4z1.KIIcUSLjaxWlw80iETP6udSTVGp4Vda', 'Male', 'Bacolod', '2025-11-19'),
(2, 'PJ', 'hello@gmail.com', '$2y$10$8l8FWO834tljbGbVFMYnBOOn5vDtsYa21QRqVBPcIEDxn.R876mN2', '$2y$10$8l8FWO834tljbGbVFMYnBOOn5vDtsYa21QRqVBPcIEDxn.R876mN2', 'Male', 'Bacolod', '2025-11-19'),
(3, 'Paul', 'pj@gmail.com', '$2y$10$Q3e0toKzBfy2/pcZ4kxgf.cEC8p9DLGgpgnDhzuibQveb9XBFv/06', '$2y$10$Q3e0toKzBfy2/pcZ4kxgf.cEC8p9DLGgpgnDhzuibQveb9XBFv/06', 'Male', 'Bacolod', '2025-12-03'),
(4, 'Hello', 'wat123@gmail.com', '$2y$10$udKVEiCP6kcM4CEsYqScAOlqSomUf3llcW3OvyxhF5DgYG6v8VLYm', '$2y$10$udKVEiCP6kcM4CEsYqScAOlqSomUf3llcW3OvyxhF5DgYG6v8VLYm', '', 'Teacher', '2025-12-01');

-- --------------------------------------------------------

--
-- Table structure for table `temporary_reservations`
--

CREATE TABLE `temporary_reservations` (
  `id` int(11) NOT NULL,
  `room` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `temporary_reservations`
--

INSERT INTO `temporary_reservations` (`id`, `room`, `date`, `start_time`, `end_time`, `created_at`) VALUES
(6, 'B201', '2025-12-08', '10:32:00', '11:31:00', '2025-12-08 02:32:12'),
(7, 'B201', '2025-12-08', '11:39:00', '13:39:00', '2025-12-08 02:41:25'),
(8, 'B201', '2025-12-09', '08:00:00', '10:00:00', '2025-12-08 02:51:55');

-- --------------------------------------------------------

--
-- Table structure for table `thursday`
--

CREATE TABLE `thursday` (
  `id` int(11) NOT NULL,
  `rooms` varchar(255) NOT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thursday`
--

INSERT INTO `thursday` (`id`, `rooms`, `start_time`, `end_time`, `status`) VALUES
(1, 'B201', '13:00:00.000000', '15:00:00.000000', 'Occupied');

-- --------------------------------------------------------

--
-- Table structure for table `tuesday`
--

CREATE TABLE `tuesday` (
  `id` int(11) NOT NULL,
  `rooms` varchar(255) NOT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tuesday`
--

INSERT INTO `tuesday` (`id`, `rooms`, `start_time`, `end_time`, `status`) VALUES
(1, 'B201', '10:01:00.000000', '12:00:00.000000', 'Vacant');

-- --------------------------------------------------------

--
-- Table structure for table `wednesday`
--

CREATE TABLE `wednesday` (
  `id` int(11) NOT NULL,
  `rooms` varchar(255) NOT NULL,
  `start_time` time(6) NOT NULL,
  `end_time` time(6) NOT NULL,
  `status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wednesday`
--

INSERT INTO `wednesday` (`id`, `rooms`, `start_time`, `end_time`, `status`) VALUES
(1, 'B201', '08:00:00.000000', '10:00:00.000000', 'Occupied');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `archive`
--
ALTER TABLE `archive`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `friday`
--
ALTER TABLE `friday`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `monday`
--
ALTER TABLE `monday`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reservation_requests`
--
ALTER TABLE `reservation_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `table1`
--
ALTER TABLE `table1`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `temporary_reservations`
--
ALTER TABLE `temporary_reservations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `thursday`
--
ALTER TABLE `thursday`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tuesday`
--
ALTER TABLE `tuesday`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wednesday`
--
ALTER TABLE `wednesday`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `archive`
--
ALTER TABLE `archive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `friday`
--
ALTER TABLE `friday`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `monday`
--
ALTER TABLE `monday`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `reservation_requests`
--
ALTER TABLE `reservation_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `table1`
--
ALTER TABLE `table1`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `temporary_reservations`
--
ALTER TABLE `temporary_reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `thursday`
--
ALTER TABLE `thursday`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tuesday`
--
ALTER TABLE `tuesday`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `wednesday`
--
ALTER TABLE `wednesday`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
