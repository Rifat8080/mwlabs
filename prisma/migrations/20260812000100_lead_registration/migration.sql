-- Add prospect profile fields to authenticated users.
ALTER TABLE `user`
    ADD COLUMN `accountType` VARCHAR(191) NOT NULL DEFAULT 'prospect',
    ADD COLUMN `company` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `serviceInterest` VARCHAR(191) NULL,
    ADD COLUMN `budgetRange` VARCHAR(191) NULL,
    ADD COLUMN `projectBrief` TEXT NULL;

-- Link one authenticated prospect to one CRM lead while preserving existing leads.
ALTER TABLE `Lead`
    ADD COLUMN `userId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Lead_userId_key` ON `Lead`(`userId`);

ALTER TABLE `Lead`
    ADD CONSTRAINT `Lead_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
