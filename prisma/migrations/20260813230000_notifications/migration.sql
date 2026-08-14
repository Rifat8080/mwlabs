CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'crud',
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NULL,
    `actionUrl` VARCHAR(191) NULL,
    `resource` VARCHAR(191) NULL,
    `resourceId` VARCHAR(191) NULL,
    `inApp` BOOLEAN NOT NULL DEFAULT true,
    `emailRequested` BOOLEAN NOT NULL DEFAULT false,
    `emailStatus` VARCHAR(191) NOT NULL DEFAULT 'Not requested',
    `emailMessageId` VARCHAR(191) NULL,
    `emailError` TEXT NULL,
    `emailedAt` DATETIME(3) NULL,
    `readAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_organizationId_archivedAt_createdAt_idx`(`userId`, `organizationId`, `archivedAt`, `createdAt`),
    INDEX `Notification_userId_organizationId_readAt_createdAt_idx`(`userId`, `organizationId`, `readAt`, `createdAt`),
    INDEX `Notification_organizationId_resource_resourceId_idx`(`organizationId`, `resource`, `resourceId`),
    INDEX `Notification_emailStatus_createdAt_idx`(`emailStatus`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `NotificationPreference` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `inAppEnabled` BOOLEAN NOT NULL DEFAULT true,
    `emailEnabled` BOOLEAN NOT NULL DEFAULT true,
    `emailCrud` BOOLEAN NOT NULL DEFAULT true,
    `emailActivity` BOOLEAN NOT NULL DEFAULT true,
    `emailBookings` BOOLEAN NOT NULL DEFAULT true,
    `notifyOwnActions` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationPreference_organizationId_userId_key`(`organizationId`, `userId`),
    INDEX `NotificationPreference_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Notification` ADD CONSTRAINT `Notification_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `NotificationPreference` ADD CONSTRAINT `NotificationPreference_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `NotificationPreference` ADD CONSTRAINT `NotificationPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
