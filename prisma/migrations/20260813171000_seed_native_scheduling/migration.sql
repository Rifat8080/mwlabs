-- Give every existing workspace a usable first-party discovery schedule.
INSERT IGNORE INTO `BookingType` (
    `id`, `organizationId`, `title`, `slug`, `description`, `durationMinutes`,
    `slotIntervalMinutes`, `bufferBeforeMinutes`, `bufferAfterMinutes`,
    `minimumNoticeHours`, `maximumAdvanceDays`, `timezone`, `location`,
    `color`, `active`, `createdAt`, `updatedAt`
)
SELECT
    UUID(), `id`, 'Discovery call', 'discovery',
    'A focused 30-minute conversation about goals, constraints, timing, and the best next step.',
    30, 30, 15, 15, 12, 60, 'Asia/Dhaka',
    'Google Meet link shared after confirmation', '#2563eb', true, NOW(3), NOW(3)
FROM `organization`;

INSERT IGNORE INTO `AvailabilityRule` (
    `id`, `organizationId`, `weekday`, `startMinute`, `endMinute`,
    `enabled`, `createdAt`, `updatedAt`
)
SELECT UUID(), organizationId, weekday, 540, 1020, true, NOW(3), NOW(3)
FROM (
    SELECT o.`id` AS organizationId, d.weekday
    FROM `organization` o
    CROSS JOIN (
        SELECT 1 AS weekday UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
    ) d
) defaults;
