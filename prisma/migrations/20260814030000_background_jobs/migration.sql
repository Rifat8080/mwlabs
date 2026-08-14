CREATE TABLE `BackgroundJob` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `priority` INTEGER NOT NULL DEFAULT 0,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 8,
    `runAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lockedAt` DATETIME(3) NULL,
    `lockedBy` VARCHAR(191) NULL,
    `lastError` TEXT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BackgroundJob_idempotencyKey_key`(`idempotencyKey`),
    INDEX `BackgroundJob_status_runAt_priority_idx`(`status`, `runAt`, `priority`),
    INDEX `BackgroundJob_organizationId_createdAt_idx`(`organizationId`, `createdAt`),
    INDEX `BackgroundJob_lockedAt_idx`(`lockedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BackgroundJob`
    ADD CONSTRAINT `BackgroundJob_organizationId_fkey`
    FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
