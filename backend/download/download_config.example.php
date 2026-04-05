<?php
// backend/download/download_config.example.php
// Copy to `download_config.php` and adjust for your server layout.
// DO NOT commit download_config.php — it may contain passwords.

return [
    // Path to the publicly served assets (WebP thumbnails + web-optimised images).
    // download_config.php is deployed to private/download/ on the server.
    // From there, ../../www/assets resolves to the webroot assets folder.
    'assets_base'   => __DIR__ . '/../../www/assets',

    // Path to the private originals folder (outside webroot on production).
    // If this folder does not exist, download.php falls back to assets_base.
    // On OVH: set to an absolute path or a path relative to this file.
    'private_base'  => __DIR__ . '/../../private_assets',

    // Limits
    'max_files'  => 1000,
    'max_bytes'  => 2 * 1024 * 1024 * 1024, // 2 GB
    'warn_bytes' => 200 * 1024 * 1024,       // 200 MB

    // Log files written here (private/download/ — always writable by the deploy)
    'logs_base' => __DIR__,

    // Projects available for download: slug => [folder, password, visible]
    'projects' => [
        // 'my-project-slug' => ['folder' => 'photography/my-project-slug', 'password' => 'secret', 'visible' => true],
    ],
];
