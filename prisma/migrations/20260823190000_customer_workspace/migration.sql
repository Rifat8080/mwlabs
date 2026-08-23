ALTER TABLE `Lead` DROP FOREIGN KEY `Lead_userId_fkey`;

ALTER TABLE `Lead` DROP INDEX `Lead_userId_key`;

ALTER TABLE `Client` ADD COLUMN `userId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Client_userId_key` ON `Client`(`userId`);

ALTER TABLE `Client` ADD CONSTRAINT `Client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;