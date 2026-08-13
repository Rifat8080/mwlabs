-- Replace the external scheduling integration with first-party CRM scheduling.
DROP INDEX `CalendarEvent_externalEventUri_idx` ON `CalendarEvent`;
DROP INDEX `CalendarEvent_externalInviteeUri_key` ON `CalendarEvent`;

ALTER TABLE `CalendarEvent`
    ADD COLUMN `bookingReference` VARCHAR(191) NULL,
    ADD COLUMN `bookingTypeId` VARCHAR(191) NULL,
    ADD COLUMN `inviteeCompany` VARCHAR(191) NULL,
    ADD COLUMN `inviteePhone` VARCHAR(191) NULL,
    ADD COLUMN `slotKey` VARCHAR(191) NULL,
    ADD COLUMN `source` VARCHAR(191) NOT NULL DEFAULT 'Manual';

UPDATE `CalendarEvent`
SET `source` = CASE WHEN `provider` = 'Calendly' THEN 'Imported booking' ELSE `provider` END
WHERE `provider` IS NOT NULL;

ALTER TABLE `CalendarEvent`
    DROP COLUMN `cancelUrl`,
    DROP COLUMN `eventTypeUri`,
    DROP COLUMN `externalEventUri`,
    DROP COLUMN `externalInviteeUri`,
    DROP COLUMN `provider`,
    DROP COLUMN `rescheduleUrl`;

CREATE TABLE `BookingType` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `durationMinutes` INTEGER NOT NULL DEFAULT 30,
    `slotIntervalMinutes` INTEGER NOT NULL DEFAULT 30,
    `bufferBeforeMinutes` INTEGER NOT NULL DEFAULT 15,
    `bufferAfterMinutes` INTEGER NOT NULL DEFAULT 15,
    `minimumNoticeHours` INTEGER NOT NULL DEFAULT 12,
    `maximumAdvanceDays` INTEGER NOT NULL DEFAULT 60,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Asia/Dhaka',
    `location` TEXT NULL,
    `color` VARCHAR(191) NOT NULL DEFAULT '#2563eb',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BookingType_organizationId_active_idx`(`organizationId`, `active`),
    UNIQUE INDEX `BookingType_organizationId_slug_key`(`organizationId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AvailabilityRule` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `weekday` INTEGER NOT NULL,
    `startMinute` INTEGER NOT NULL DEFAULT 540,
    `endMinute` INTEGER NOT NULL DEFAULT 1020,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AvailabilityRule_organizationId_enabled_idx`(`organizationId`, `enabled`),
    UNIQUE INDEX `AvailabilityRule_organizationId_weekday_key`(`organizationId`, `weekday`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `CalendarEvent_bookingReference_key` ON `CalendarEvent`(`bookingReference`);
CREATE UNIQUE INDEX `CalendarEvent_slotKey_key` ON `CalendarEvent`(`slotKey`);
CREATE INDEX `CalendarEvent_bookingTypeId_startAt_idx` ON `CalendarEvent`(`bookingTypeId`, `startAt`);

ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_bookingTypeId_fkey` FOREIGN KEY (`bookingTypeId`) REFERENCES `BookingType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `BookingType` ADD CONSTRAINT `BookingType_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `AvailabilityRule` ADD CONSTRAINT `AvailabilityRule_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
