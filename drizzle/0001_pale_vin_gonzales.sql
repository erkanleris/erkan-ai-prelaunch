CREATE TABLE `registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fullName` varchar(60) NOT NULL,
	`email` varchar(320) NOT NULL,
	`age` int NOT NULL,
	`profession` varchar(60) NOT NULL,
	`username` varchar(10) NOT NULL,
	`registrationId` varchar(16) NOT NULL,
	`status` enum('active','cancelled') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `registrations_email_unique` UNIQUE(`email`),
	CONSTRAINT `registrations_username_unique` UNIQUE(`username`),
	CONSTRAINT `registrations_registrationId_unique` UNIQUE(`registrationId`)
);
