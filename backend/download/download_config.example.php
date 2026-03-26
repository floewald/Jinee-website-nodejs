<?php
// backend/download/download_config.example.php
// Copy to `download_config.php` and adjust for your server layout.
// DO NOT commit download_config.php — it may contain passwords.

return [
    // Path to the publicly served assets (WebP thumbnails + web-optimised images)
    'assets_base'   => __DIR__ . '/../../public/assets',

    // Path to the private originals folder (outside webroot on production)
    // On OVH: '/home/username/private_assets'
    'private_base'  => __DIR__ . '/../../assets-raw',

    // Limits
    'max_files'  => 1000,
    'max_bytes'  => 2 * 1024 * 1024 * 1024, // 2 GB
    'warn_bytes' => 200 * 1024 * 1024,       // 200 MB

    // Projects available for download: slug => [password, visible]
    'projects' => [
        // 'my-project-slug' => ['password' => 'secret', 'visible' => true],
    ],
];
