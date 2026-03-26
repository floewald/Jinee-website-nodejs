<?php
// download/config.php - returns public project visibility and limited metadata as JSON
// Loads local download_config.php and emits a minimal JSON map for client use.
ini_set('display_errors', 0);
$cfg = null;
$candidates = [
    // Prefer a config placed outside the public webroot for production.
    __DIR__ . '/../../private/download/download_config.php',   // production: private/download/ folder
    __DIR__ . '/../download_config.php',                       // parent folder (local dev)
    __DIR__ . '/download_config.php',                          // fallback to local file in repo
];
foreach ($candidates as $p) {
    if (file_exists($p) && is_readable($p)) {
        $cfg = require $p;
        break;
    }
}
if (!is_array($cfg) || !isset($cfg['projects'])) {
    header('Content-Type: application/json');
    echo json_encode(['projects' => []]);
    exit;
}
$out = ['projects' => []];
foreach ($cfg['projects'] as $k => $v) {
    $out['projects'][$k] = [
        'visible' => !empty($v['visible']),
    ];
}
header('Content-Type: application/json');
echo json_encode($out);
