<?php
// backend/download/download_config.template.php
//
// This file is committed to git. %%PLACEHOLDER%% tokens are replaced with
// real passwords by the GitHub Actions `deploy-backend` job at deploy time.
// Passwords are stored as GitHub Secrets — never in this repo.
//
// ── Adding a new downloadable project ────────────────────────────────────────
// 1. Add an entry below with a  %%DL_PASS_<SLUG>%%  token as the password.
//    Convention: slug hyphens → underscores, all uppercase.
//    Example slug `my-project` → token %%DL_PASS_MY_PROJECT%%
// 2. Add the corresponding GitHub Secret  DL_PASS_<SLUG>  in
//    GitHub → Settings → Secrets and variables → Actions.
// 3. Add a replace line inside the `deploy-backend` job in
//    .github/workflows/deploy.yml  (copy an existing block and rename it).
// 4. Set  "enableDownload": true  for the project in
//    src/content/portfolio/photography.json.
// ─────────────────────────────────────────────────────────────────────────────

return [
    // Path to the publicly served WebP assets
    'assets_base'  => __DIR__ . '/../../public/assets',

    // Path to the private originals folder (outside webroot on production)
    // On OVH: '/home/username/private_assets'
    'private_base' => __DIR__ . '/../../assets-raw',

    // Limits
    'max_files'    => 1000,
    'max_bytes'    => 2 * 1024 * 1024 * 1024, // 2 GB
    'warn_bytes'   => 200 * 1024 * 1024,       // 200 MB

    // Base folder for server-side download logs
    'logs_base'    => __DIR__ . '/../../logs',

    // ── Projects available for download ──────────────────────────────────────
    // slug => ['folder' => '<relative path>', 'password' => '<token>', 'visible' => true]
    'projects' => [

        'walking-tour-little-india' => [
            'folder'   => 'photography/walking-tour-little-india',
            'password' => '%%DL_PASS_WALKING_TOUR_LITTLE_INDIA%%',
            'visible'  => true,
        ],

        '20260124-west-side-art-tour' => [
            'folder'   => 'photography/20260124-west-side-art-tour',
            'password' => '%%DL_PASS_20260124_WEST_SIDE_ART_TOUR%%',
            'visible'  => true,
        ],

        '20260201-mediacorp-2026-cny-road-show' => [
            'folder'   => 'photography/20260201-mediacorp-2026-cny-road-show',
            'password' => '%%DL_PASS_20260201_MEDIACORP_2026_CNY_ROAD_SHOW%%',
            'visible'  => true,
        ],

    ],
];
