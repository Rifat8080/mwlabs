-- CreateTable
CREATE TABLE `BlogPost` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImage` TEXT NULL,
    `category` VARCHAR(191) NOT NULL DEFAULT 'Growth Strategy',
    `authorName` VARCHAR(191) NOT NULL DEFAULT 'M&W Labs',
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `canonicalUrl` TEXT NULL,
    `ogImage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    INDEX `BlogPost_organizationId_status_publishedAt_idx`(`organizationId`, `status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorkPost` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `clientName` VARCHAR(191) NULL,
    `industry` VARCHAR(191) NULL,
    `services` TEXT NULL,
    `summary` TEXT NOT NULL,
    `challenge` LONGTEXT NULL,
    `solution` LONGTEXT NOT NULL,
    `results` LONGTEXT NULL,
    `coverImage` TEXT NULL,
    `projectUrl` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `publishedAt` DATETIME(3) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `canonicalUrl` TEXT NULL,
    `ogImage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WorkPost_slug_key`(`slug`),
    INDEX `WorkPost_organizationId_status_publishedAt_idx`(`organizationId`, `status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SeoPage` (
    `id` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `eyebrow` VARCHAR(191) NULL,
    `summary` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `heroImage` TEXT NULL,
    `primaryKeyword` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Draft',
    `noIndex` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `canonicalUrl` TEXT NULL,
    `ogImage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SeoPage_slug_key`(`slug`),
    INDEX `SeoPage_organizationId_status_publishedAt_idx`(`organizationId`, `status`, `publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlogPost` ADD CONSTRAINT `BlogPost_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkPost` ADD CONSTRAINT `WorkPost_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SeoPage` ADD CONSTRAINT `SeoPage_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
