<?php
// contact/csrf-token.php
// Returns a fresh CSRF token. The token is stored in the PHP session
// and returned as JSON so the client-side JS can attach it to form submissions.
//
// Usage:  GET /contact/csrf-token.php  →  {"token":"abc123..."}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');

// Start (or resume) session for CSRF storage
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Generate a cryptographically secure token
try {
    $token = bin2hex(random_bytes(32));
} catch (Exception $e) {
    $token = bin2hex(openssl_random_pseudo_bytes(32));
}

// Store in session — keep a small pool so concurrent tabs don't invalidate each other
if (!isset($_SESSION['csrf_tokens']) || !is_array($_SESSION['csrf_tokens'])) {
    $_SESSION['csrf_tokens'] = [];
}

// Prune pool to max 5 tokens (FIFO)
$_SESSION['csrf_tokens'][] = $token;
if (count($_SESSION['csrf_tokens']) > 5) {
    $_SESSION['csrf_tokens'] = array_slice($_SESSION['csrf_tokens'], -5);
}

echo json_encode(['token' => $token]);
