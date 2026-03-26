<?php
// download.php (moved into /download)
// Accepts POST { project, files[] (optional), password }
// Validates against download_config.php, creates a ZIP from whitelisted files
// and streams it back to the client. Temp zips are created in download/tmp/.

ini_set('display_errors', 0);
set_time_limit(0);

// CORS for local development: allow requests from Live Server (localhost) to reach the PHP backend.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && (strpos($origin, '127.0.0.1') !== false || strpos($origin, 'localhost') !== false)) {
    // Echo the specific origin and allow credentials so client-side sendBeacon/fetch
    // with credentials will be permitted.
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} elseif ($origin === 'https://jineechen.com' || $origin === 'https://www.jineechen.com') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    // No CORS header for unknown origins — browser will block the request
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
// Allow the client request id header and common content types
header('Access-Control-Allow-Headers: Content-Type, X-Client-Request-Id');
// Expose certain headers to the browser so client-side code can inspect them
header('Access-Control-Expose-Headers: Content-Disposition, X-Request-Id');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Load configuration: prefer a config placed outside the webroot at ../download_config.php
// so you can keep secrets outside the public folder. Falls back to local download_config.php.
$cfg = null;
$candidates = [
    __DIR__ . '/../../private/download/download_config.php',   // Private folder on production (/www/download -> /private/download)
    __DIR__ . '/../download_config.php',                       // Parent directory (common for local dev)
    __DIR__ . '/config/download_config.php',                   // Config subfolder
    __DIR__ . '/download_config.php',                          // Same directory (fallback)
];
foreach ($candidates as $p) {
    if (file_exists($p) && is_readable($p)) {
        $cfg = require $p;
        break;
    }
}
if (!is_array($cfg)) {
    respond(500, 'Server misconfigured: download configuration not found');
}

// Generate a server-side request id for correlation and read client-provided id if present
try { $server_request_id = bin2hex(random_bytes(8)); } catch (Exception $e) { $server_request_id = uniqid('srv_', true); }
$client_request_id = null;
if (!empty($_SERVER['HTTP_X_CLIENT_REQUEST_ID'])) { $client_request_id = $_SERVER['HTTP_X_CLIENT_REQUEST_ID']; }
elseif (!empty($_POST['client_request_id'])) { $client_request_id = $_POST['client_request_id']; }
// Expose server request id to clients for correlation
header('X-Request-Id: ' . $server_request_id);

// Simple file-based logging helper
function dl_log($entry) {
    global $server_request_id, $client_request_id, $cfg;
    // Determine logs folder: allow overriding via config['logs_base'] for private logs
    // Default logs folder is repo-root `logs/`. Allow overriding via config['logs_base'].
    // However, when the request originates from a Live Server (commonly port 5500)
    // the IDE's static server watches files and will auto-reload the page on
    // writes. To avoid that, prefer writable system temp folder for such dev
    // origins so logs do not trigger Live Server reloads.
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $isLiveServer = $origin && (strpos($origin, ':5500') !== false);
    if ($isLiveServer) {
        $logDir = __DIR__ . '/tmp';
    } else {
        $logDir = __DIR__ . '/../logs';
        if (!empty($cfg['logs_base']) && is_dir($cfg['logs_base']) && is_writable($cfg['logs_base'])) {
            // Use the configured logs_base directly (do not create subfolders).
            $logDir = rtrim($cfg['logs_base'], "\/\\");
        }
    }
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0755, true);
    }
    $logFile = is_dir($logDir) ? $logDir . '/download_attempts.log' : __DIR__ . '/tmp/download_attempts.log';
    // Augment entry with correlation data
    if (!is_array($entry)) $entry = ['message' => (string)$entry];
    $entry['server_request_id'] = $server_request_id ?? null;
    $entry['client_request_id'] = $client_request_id ?? null;
    $entry['ts'] = time();
    $line = json_encode($entry) . "\n";
    @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

// Simple rate limiter: per-IP, per-action windowed counter saved in dedicated directory
// Uses download/rate-limit/ instead of sys_get_temp_dir() to avoid shared-hosting conflicts
function get_rate_limit_dir() {
    $dir = __DIR__ . '/rate-limit';
    if (!is_dir($dir)) { @mkdir($dir, 0755, true); }
    return $dir;
}

function rate_limited($ip, $action, $max, $window) {
    $safe_ip = preg_replace('/[^a-z0-9_\.\-]/i', '_', $ip);
    $keyFile = get_rate_limit_dir() . '/dlrate_' . $action . '_' . $safe_ip . '.json';
    $now = time();
    $timestamps = [];
    if (file_exists($keyFile)) {
        $data = @file_get_contents($keyFile);
        $timestamps = $data ? json_decode($data, true) : [];
        if (!is_array($timestamps)) $timestamps = [];
    }
    // drop old
    $timestamps = array_filter($timestamps, function($ts) use ($now, $window){ return ($now - $ts) <= $window; });
    if (count($timestamps) >= $max) {
        return true;
    }
    // record this attempt
    $timestamps[] = $now;
    @file_put_contents($keyFile, json_encode($timestamps), LOCK_EX);
    return false;
}

// IP banning: track total failed attempts and ban after threshold
function is_banned($ip) {
    $safe_ip = preg_replace('/[^a-z0-9_\.\-]/i', '_', $ip);
    $banFile = get_rate_limit_dir() . '/dlban_' . $safe_ip . '.json';
    if (file_exists($banFile)) {
        $data = @file_get_contents($banFile);
        $banData = $data ? json_decode($data, true) : null;
        if (is_array($banData) && isset($banData['banned_until'])) {
            // Check if ban is still active (24 hour ban)
            if (time() < $banData['banned_until']) {
                return true;
            }
        }
    }
    return false;
}

function record_failed_attempt($ip) {
    $safe_ip = preg_replace('/[^a-z0-9_\.\-]/i', '_', $ip);
    $attemptFile = get_rate_limit_dir() . '/dlfail_' . $safe_ip . '.json';
    $now = time();
    $attempts = [];
    
    if (file_exists($attemptFile)) {
        $data = @file_get_contents($attemptFile);
        $attempts = $data ? json_decode($data, true) : [];
        if (!is_array($attempts)) $attempts = [];
    }
    
    // Keep only attempts from last 24 hours
    $attempts = array_filter($attempts, function($ts) use ($now){ return ($now - $ts) <= 86400; });
    
    // Add current attempt
    $attempts[] = $now;
    @file_put_contents($attemptFile, json_encode($attempts), LOCK_EX);
    
    // Ban if threshold reached (100 failed attempts in 24 hours)
    if (count($attempts) >= 100) {
        $banFile = get_rate_limit_dir() . '/dlban_' . $safe_ip . '.json';
        $banData = [
            'ip' => $ip,
            'banned_at' => $now,
            'banned_until' => $now + 86400, // 24 hour ban
            'total_attempts' => count($attempts)
        ];
        @file_put_contents($banFile, json_encode($banData), LOCK_EX);
        return true; // IP now banned
    }
    
    return false;
}

function respond($code, $msg, $details = null, $redirect = null, $remainingAttempts = null) {
    http_response_code($code);
    header('Content-Type: application/json');
    $response = ['error' => $msg, 'message' => $msg];
    if ($details) $response['details'] = $details;
    if ($redirect) $response['redirect'] = $redirect;
    if ($remainingAttempts !== null) $response['remainingAttempts'] = $remainingAttempts;
    echo json_encode($response);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, 'Method not allowed — use POST');
}

// CSRF token validation — applied to all POST requests (both validate_only and actual download).
// For validate_only requests, check the token without consuming it so it remains valid for the
// subsequent actual download request that uses the same token.
require_once __DIR__ . '/../contact/csrf-validate.php';
$is_validate_only = !empty($_POST['validate_only']);
$csrf_result = validate_csrf_token($_POST['csrf_token'] ?? '', !$is_validate_only);
if ($csrf_result !== true) {
    dl_log(['action' => 'csrf_fail', 'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
    respond(403, $csrf_result['message'] ?? 'CSRF validation failed');
}

// If client only wants validation (no zip generation), perform checks and return JSON.
if (!empty($_POST['validate_only'])) {
    // minimal validation: project exists, password correct (if configured), files exist and limits respected
    $project = isset($_POST['project']) ? trim($_POST['project']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $files = isset($_POST['files']) && is_array($_POST['files']) ? $_POST['files'] : [];
    
    // Get IP for validation checks
    $ip = $_SERVER['REMOTE_ADDR'] ?? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'unknown');
    
    // Check if IP is banned
    if (is_banned($ip)) {
        dl_log(['action'=>'validate','project'=>$project,'outcome'=>'ip_banned','ip'=>$ip]);
        respond(403, 'Access denied — your IP has been temporarily banned due to excessive failed attempts');
    }
    
    if ($project === '') respond(400, 'Missing project');
    if (!isset($cfg['projects'][$project])) { dl_log(['action'=>'validate','project'=>$project,'outcome'=>'unknown_project']); respond(404, 'Unknown project'); }
    $projCfg = $cfg['projects'][$project];
    if (!empty($projCfg['password']) && !hash_equals((string)$projCfg['password'], (string)$password)) {
        dl_log(['action'=>'validate','project'=>$project,'outcome'=>'invalid_password']);
        // Record failed attempt for IP banning
        $banned = record_failed_attempt($ip);
        if ($banned) {
            dl_log(['action'=>'validate','project'=>$project,'outcome'=>'auto_banned','ip'=>$ip]);
            respond(403, 'Access denied — your IP has been temporarily banned due to excessive failed attempts');
        }
        respond(401, 'Password incorrect');
    }
    // determine base path
    $privateBase = rtrim($cfg['private_base'], "\/\\");
    $assetsBase = rtrim($cfg['assets_base'], "\/\\");
    $relFolder = trim($projCfg['folder'], "\/\\");
    $privatePath = $privateBase . DIRECTORY_SEPARATOR . $relFolder;
    $publicPath = $assetsBase . DIRECTORY_SEPARATOR . $relFolder;
    $basePath = null;
    if (is_dir($privatePath)) $basePath = realpath($privatePath);
    elseif (is_dir($publicPath)) $basePath = realpath($publicPath);
    else { dl_log(['action'=>'validate','project'=>$project,'outcome'=>'folder_missing']); respond(500, 'Project folder not found on server'); }
    // collect files list if empty use manifest or glob
    if (empty($files)) {
        $manifestFile = $basePath . DIRECTORY_SEPARATOR . 'images.json';
        if (file_exists($manifestFile)) {
            $j = @file_get_contents($manifestFile);
            $m = $j ? json_decode($j, true) : [];
            if (is_array($m)) {
                $files = array_map(function($e){ if (is_array($e) && isset($e['file'])) return $e['file']; if (is_string($e)) return $e; return null; }, $m);
                $files = array_filter($files);
            }
        }
        if (empty($files)) {
            $patterns = ['*.jpg','*.jpeg','*.png','*.webp','*.mp4','*.mov'];
            $files = [];
            foreach ($patterns as $p) foreach (glob($basePath . DIRECTORY_SEPARATOR . $p) as $f) $files[] = basename($f);
        }
    }
    // sanitize
    $files = array_values(array_unique(array_map('basename', $files)));
    if (count($files) > ($cfg['max_files'] ?? 1000)) { dl_log(['action'=>'validate','project'=>$project,'outcome'=>'too_many_files','count'=>count($files)]); respond(400,'Too many files requested'); }
    $totalBytes = 0; $validFiles = [];
    foreach ($files as $fname) {
        $candidate = $basePath . DIRECTORY_SEPARATOR . $fname;
        $real = realpath($candidate);
        // If exact file not found, try stripping -800 or -1600 size suffix (web thumbnails vs originals)
        if ($real === false) {
            $stripped = preg_replace('/-(800|1600)(\.[^.]+)$/i', '$2', $fname);
            if ($stripped !== $fname) {
                $candidate = $basePath . DIRECTORY_SEPARATOR . $stripped;
                $real = realpath($candidate);
            }
        }
        if ($real === false) continue;
        if (strpos($real, $basePath) !== 0) continue;
        if (!is_file($real) || !is_readable($real)) continue;
        $totalBytes += filesize($real);
        $validFiles[] = basename($real);
    }
    if (empty($validFiles)) { dl_log(['action'=>'validate','project'=>$project,'outcome'=>'no_valid_files']); respond(400,'No valid files found'); }
    if ($totalBytes > ($cfg['max_bytes'] ?? 2*1024*1024*1024)) { dl_log(['action'=>'validate','project'=>$project,'outcome'=>'exceeds_max_bytes','bytes'=>$totalBytes]); respond(400,'Requested files exceed configured maximum size'); }
    // success
    dl_log(['action'=>'validate','project'=>$project,'outcome'=>'ok','file_count'=>count($validFiles),'bytes'=>$totalBytes]);
    header('Content-Type: application/json');
    echo json_encode(['ok'=>true,'file_count'=>count($validFiles),'bytes'=>$totalBytes,'server_request_id'=>$server_request_id]);
    exit;
}

// Debug client-side dump removed — keep only structured download attempts log

$ip = $_SERVER['REMOTE_ADDR'] ?? ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? 'unknown');

// Check if IP is banned (100+ failed attempts in 24h = 24h ban)
if (is_banned($ip)) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => null, 'outcome' => 'ip_banned']);
    respond(403, 'Access denied — your IP has been temporarily banned due to excessive failed attempts');
}

// simple rate limit: max 5 downloads per 5 minutes per IP
if (rate_limited($ip, 'download', 5, 300)) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => null, 'outcome' => 'rate_limited']);
    respond(429, 'Too many requests — try again later');
}

$project = isset($_POST['project']) ? trim($_POST['project']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';
$files = isset($_POST['files']) && is_array($_POST['files']) ? $_POST['files'] : [];

if ($project === '') respond(400, 'Missing project');
if (!isset($cfg['projects'][$project])) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'unknown_project']);
    respond(404, 'Unknown project');
}

$projCfg = $cfg['projects'][$project];
// If a password is configured for this project, require it regardless of the
// `visible` flag. This avoids accidentally allowing downloads when a password
// has been set but `visible` was left true.
if (!empty($projCfg['password'])) {
    // Validate password. Record failed attempts and enforce rate limits.
    if (!hash_equals((string)$projCfg['password'], (string)$password)) {
        // Record failed password attempt
        $safe_ip = preg_replace('/[^a-z0-9_\.-]/i', '_', $ip);
        $keyFile = get_rate_limit_dir() . '/dlrate_password_fail_' . $project . '_' . $safe_ip . '.json';
        $now = time();
        $timestamps = [];
        if (file_exists($keyFile)) {
            $data = @file_get_contents($keyFile);
            $timestamps = $data ? json_decode($data, true) : [];
            if (!is_array($timestamps)) $timestamps = [];
        }
        $timestamps = array_filter($timestamps, function($ts) use ($now){ return ($now - $ts) <= 600; });
        $timestamps[] = $now;
        @file_put_contents($keyFile, json_encode($timestamps), LOCK_EX);

        $remainingAttempts = 4 - count($timestamps);

        dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'invalid_password', 'attempts' => count($timestamps)]);

        // Record global failed attempt for IP banning (100 attempts = ban)
        $banned = record_failed_attempt($ip);
        if ($banned) {
            dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'auto_banned']);
            respond(403, 'Access denied — your IP has been temporarily banned due to excessive failed attempts');
        }

        if ($remainingAttempts <= 0) {
            // Now exceeded allowed failed attempts
            dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'password_rate_limited']);
            respond(429, 'Too many failed password attempts. Redirecting to homepage.', 'Rate limit: 4 attempts per 10 minutes', '/', 0);
        }

        respond(401, 'Password incorrect. Please try again.', 'Password validation failed', null, max(0, $remainingAttempts));
    }
}

// Decide base path: prefer private_base if that folder exists and contains the project,
// otherwise fall back to assets_base.
$privateBase = rtrim($cfg['private_base'], "\/\\");
$assetsBase = rtrim($cfg['assets_base'], "\/\\");

$relFolder = trim($projCfg['folder'], "\/\\");
$privatePath = $privateBase . DIRECTORY_SEPARATOR . $relFolder;
$publicPath = $assetsBase . DIRECTORY_SEPARATOR . $relFolder;

$basePath = null;
if (is_dir($privatePath)) {
    $basePath = realpath($privatePath);
} elseif (is_dir($publicPath)) {
    $basePath = realpath($publicPath);
} else {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'folder_missing']);
    respond(500, 'Project folder not found on server');
}

// Load manifest if available
$manifestFile = $basePath . DIRECTORY_SEPARATOR . 'images.json';
$manifest = [];
if (file_exists($manifestFile)) {
    $json = @file_get_contents($manifestFile);
    $manifest = $json ? json_decode($json, true) : [];
    if (!is_array($manifest)) $manifest = [];
}

// Build manifest lookup: basename (lowercase) => filename
$manifestMap = [];
if (!empty($manifest) && is_array($manifest)) {
    foreach ($manifest as $entry) {
        $fname = null;
        if (is_array($entry) && isset($entry['file'])) $fname = $entry['file'];
        elseif (is_string($entry)) $fname = $entry;
        if (!$fname) continue;
        $key = strtolower(pathinfo($fname, PATHINFO_FILENAME));
        if (!isset($manifestMap[$key])) $manifestMap[$key] = $fname;
    }
}

// If no files specified, default to all files from manifest or all files in folder
if (empty($files)) {
    if (!empty($manifest)) {
        // manifest is assumed to be an array of filenames or objects with 'file'
        $files = array_map(function($e){
            if (is_array($e) && isset($e['file'])) return $e['file'];
            if (is_string($e)) return $e;
            return null;
        }, $manifest);
        $files = array_filter($files);
    } else {
        // fallback: glob common image/video extensions
        $patterns = ['*.jpg','*.jpeg','*.png','*.webp','*.mp4','*.mov'];
        $files = [];
        foreach ($patterns as $p) {
            foreach (glob($basePath . DIRECTORY_SEPARATOR . $p) as $f) {
                $files[] = basename($f);
            }
        }
    }
}

// If the request did not specify individual files, prefer a prebuilt ZIP
// located inside the project folder (e.g. all-files.zip or <project>.zip).
// This allows deploy to place a ready-made archive next to the images.
$isAllFilesRequest = empty($_POST['files']);
if ($isAllFilesRequest) {
    $prebuiltCandidates = [
        $basePath . DIRECTORY_SEPARATOR . 'all-files.zip',
        $basePath . DIRECTORY_SEPARATOR . $project . '.zip',
    ];
    foreach ($prebuiltCandidates as $pre) {
        if (file_exists($pre) && is_readable($pre) && is_file($pre)) {
            dl_log(['ts'=>time(), 'ip'=>$ip, 'action'=>'download', 'project'=>$project, 'outcome'=>'serve_prebuilt', 'path'=>$pre]);

            // Prepare and log the outgoing headers (including the filename) so we can inspect what the client receives
            $outName = sprintf('%s-%s.zip', preg_replace('/[^a-z0-9_\\-]/i', '_', $project), date('Ymd-His'));
            $cdHeader = 'attachment; filename="' . $outName . '"';
            dl_log(['ts'=>time(), 'ip'=>$ip, 'action'=>'download', 'project'=>$project, 'outgoing_headers'=>['Content-Type'=>'application/zip','Content-Length'=>filesize($pre),'Content-Disposition'=>$cdHeader,'Cache-Control'=>'private']]);

            header('Content-Type: application/zip');
            header('Content-Length: ' . filesize($pre));
            header('Content-Disposition: ' . $cdHeader);
            header('Cache-Control: private');

            $fp = fopen($pre, 'rb');
            if ($fp) {
                while (!feof($fp)) {
                    echo fread($fp, 8192);
                    @flush();
                }
                fclose($fp);
            }
            exit;
        }
    }
}

// Sanitize & dedupe
$files = array_values(array_unique(array_map('basename', $files)));

// Enforce limits
if (count($files) > ($cfg['max_files'] ?? 1000)) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'too_many_files', 'count' => count($files)]);
    respond(400, 'Too many files requested');
}

$totalBytes = 0;
$validFiles = [];
// Validate each requested filename: canonicalize and ensure it resides inside $basePath
foreach ($files as $fname) {
    // Safety: strip directory segments
    $fname = basename($fname);

    // Candidate path as provided (start by assuming not found)
    $candidate = $basePath . DIRECTORY_SEPARATOR . $fname;
    $real = false;

    // Strip -800 or -1600 size suffix from filename (web thumbnails vs originals)
    $fname = preg_replace('/-(800|1600)(\.[^.]+)$/i', '$2', $fname);

    // Compute base name + extension if present
    $dotPos = strrpos($fname, '.');
    $base = $dotPos !== false ? substr($fname, 0, $dotPos) : $fname;
    $sentExt = $dotPos !== false ? strtolower(substr($fname, $dotPos)) : '';

    // If manifest map contains this basename, prefer the mapped filename
    if (!empty($manifestMap)) {
        $mKey = strtolower($base);
        if (isset($manifestMap[$mKey])) {
            $mapped = $manifestMap[$mKey];
            $mappedPath = $basePath . DIRECTORY_SEPARATOR . $mapped;
            if (file_exists($mappedPath) && is_file($mappedPath) && is_readable($mappedPath)) {
                $real = realpath($mappedPath);
                dl_log(['action' => 'manifest_map', 'requested' => $fname, 'mapped' => basename($real), 'project' => $project]);
            }
        }
    }

    // Preferred original extensions (do not include webp here)
    $altExts = ['.jpg', '.jpeg', '.png'];

    if ($sentExt === '.webp') {
        // If client requested a webp, prefer original image files first to avoid including webp in archive
        foreach ($altExts as $ext) {
            $altPath = $basePath . DIRECTORY_SEPARATOR . $base . $ext;
            if (file_exists($altPath) && is_file($altPath) && is_readable($altPath)) {
                $real = realpath($altPath);
                dl_log(['action' => 'prefer_original_ext', 'requested' => $fname, 'matched' => basename($real), 'project' => $project]);
                break;
            }
        }
        // If no original found, accept webp if present
        if ($real === false && file_exists($candidate) && is_file($candidate) && is_readable($candidate)) {
            $real = realpath($candidate);
        }
    } else {
        // Non-webp: accept exact filename first, then try alternatives
        $real = realpath($candidate);
        if ($real === false) {
            foreach ($altExts as $ext) {
                $altPath = $basePath . DIRECTORY_SEPARATOR . $base . $ext;
                if (file_exists($altPath) && is_file($altPath) && is_readable($altPath)) {
                    $real = realpath($altPath);
                    dl_log(['action' => 'fallback_ext', 'requested' => $fname, 'matched' => basename($real), 'project' => $project]);
                    break;
                }
            }
        }
    }

    if ($real === false) continue;
    // Ensure the resolved path is inside the base path
    if (strpos($real, $basePath) !== 0) continue;
    if (!is_file($real) || !is_readable($real)) continue;
    $totalBytes += filesize($real);
    // Use the basename for the archive entry name
    $validFiles[basename($real)] = $real;
}

if (empty($validFiles)) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'no_valid_files']);
    respond(400, 'No valid files found');
}
if ($totalBytes > ($cfg['max_bytes'] ?? 2*1024*1024*1024)) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'exceeds_max_bytes', 'bytes' => $totalBytes]);
    respond(400, 'Requested files exceed configured maximum size');
}

// warn if large
$warn = false;
if ($totalBytes > ($cfg['warn_bytes'] ?? 200*1024*1024)) {
    $warn = true;
}

if (!extension_loaded('zip') || !class_exists('ZipArchive')) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'zip_missing']);
    respond(503, 'Zip extension not available on server');
}

$dlTmpDir = __DIR__ . '/tmp';
if (!is_dir($dlTmpDir)) { @mkdir($dlTmpDir, 0755, true); }
$tmp = tempnam($dlTmpDir, 'dlzip_');
if ($tmp === false) respond(500, 'Failed to create temp file');
// ensure .zip extension for readability
$zipPath = $tmp . '.zip';
@unlink($tmp);

$zip = new ZipArchive();
if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'zip_create_failed']);
    respond(500, 'Unable to create zip archive');
}

foreach ($validFiles as $name => $path) {
    $localname = $name;
    $zip->addFile($path, $localname);
}

$zip->close();

$basename = preg_replace('/[^a-z0-9_\\-]/i', '_', $project);
$outName = sprintf('%s-%s.zip', $basename, date('Ymd-His'));

// Stream the file
if (!file_exists($zipPath)) {
    dl_log(['ts' => time(), 'ip' => $ip, 'action' => 'download', 'project' => $project, 'outcome' => 'archive_missing']);
    respond(500, 'Archive creation failed');
}

// Log the exact headers we plan to emit (Content-Disposition may contain characters that clients interpret differently)
$cdHeader = 'attachment; filename="' . $outName . '"';
dl_log(['ts'=>time(), 'ip'=>$ip, 'action'=>'download', 'project'=>$project, 'outgoing_headers'=>['Content-Type'=>'application/zip','Content-Length'=>filesize($zipPath),'Content-Disposition'=>$cdHeader,'Cache-Control'=>'private']]);

header('Content-Type: application/zip');
header('Content-Length: ' . filesize($zipPath));
header('Content-Disposition: ' . $cdHeader);
header('Cache-Control: private');

// output the file
$fp = fopen($zipPath, 'rb');
if ($fp) {
    while (!feof($fp)) {
        echo fread($fp, 8192);
        @flush();
    }
    fclose($fp);
}

// Log successful download with filenames and user agent for audit
$ua = $_SERVER['HTTP_USER_AGENT'] ?? null;
$servedFiles = array_values(array_keys($validFiles));
dl_log(['ts' => time(), 'ip' => $ip, 'user_agent' => $ua, 'action' => 'download', 'project' => $project, 'outcome' => 'success', 'file_count' => count($validFiles), 'files' => $servedFiles, 'bytes' => $totalBytes]);

@unlink($zipPath);
exit;
