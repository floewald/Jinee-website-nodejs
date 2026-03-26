<?php
// contact/csrf-validate.php
// Shared CSRF validation helper.
// Usage: require 'csrf-validate.php';
//        validate_csrf_token($_POST['csrf_token'] ?? '');  // throws on failure

/**
 * Validate a CSRF token against the session pool.
 * On success the token is consumed by default (one-time use).
 * Pass $consume = false to verify without consuming (e.g. for validate-only requests).
 * On failure an array ['status' => 'error', 'message' => '...'] is returned.
 * On success returns true.
 */
function validate_csrf_token(string $submitted_token, bool $consume = true): bool|array {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (empty($submitted_token)) {
        return ['status' => 'error', 'message' => 'CSRF token missing'];
    }

    $pool = $_SESSION['csrf_tokens'] ?? [];
    if (!is_array($pool)) {
        $pool = [];
    }

    // Check if the token is in the pool (constant-time comparison)
    $found = false;
    $foundIndex = -1;
    foreach ($pool as $i => $stored) {
        if (hash_equals($stored, $submitted_token)) {
            $found = true;
            $foundIndex = $i;
            break;
        }
    }

    if (!$found) {
        return ['status' => 'error', 'message' => 'CSRF token invalid or expired. Please reload the page and try again.'];
    }

    // Consume the token (one-time use) to prevent replay attacks
    if ($consume) {
        unset($_SESSION['csrf_tokens'][$foundIndex]);
        $_SESSION['csrf_tokens'] = array_values($_SESSION['csrf_tokens']);
    }

    return true;
}
