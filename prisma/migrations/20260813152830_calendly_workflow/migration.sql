-- CreateTable
CREATE TABLE `CalendarEvent` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'Manual',
    `externalEventUri` VARCHAR(500) NULL,
    `externalInviteeUri` VARCHAR(500) NULL,
    `eventTypeUri` TEXT NULL,
    `title` VARCHAR(191) NOT NULL,
    `inviteeName` VARCHAR(191) NULL,
    `inviteeEmail` VARCHAR(191) NULL,
    `startAt` DATETIME(3) NOT NULL,
    `endAt` DATETIME(3) NULL,
    `timezone` VARCHAR(191) NULL,
    `location` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Scheduled',
    `cancelUrl` TEXT NULL,
    `rescheduleUrl` TEXT NULL,
    `rescheduled` BOOLEAN NOT NULL DEFAULT false,
    `cancellationReason` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CalendarEvent_externalInviteeUri_key`(`externalInviteeUri`),
    INDEX `CalendarEvent_organizationId_startAt_idx`(`organizationId`, `startAt`),
    INDEX `CalendarEvent_organizationId_status_startAt_idx`(`organizationId`, `status`, `startAt`),
    INDEX `CalendarEvent_leadId_startAt_idx`(`leadId`, `startAt`),
    INDEX `CalendarEvent_externalEventUri_idx`(`externalEventUri`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CalendarEvent` ADD CONSTRAINT `CalendarEvent_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
