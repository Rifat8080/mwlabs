ALTER TABLE `BlogPost` ADD INDEX `BlogPost_status_featured_publishedAt_id_idx`(`status`, `featured`, `publishedAt`, `id`);
ALTER TABLE `WorkPost` ADD INDEX `WorkPost_status_featured_publishedAt_id_idx`(`status`, `featured`, `publishedAt`, `id`);
ALTER TABLE `SeoPage` ADD INDEX `SeoPage_status_noIndex_publishedAt_id_idx`(`status`, `noIndex`, `publishedAt`, `id`);
