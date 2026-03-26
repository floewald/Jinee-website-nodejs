<?php
// contact/contact.php
// Basic contact form handler with honeypot and optional PHPMailer (composer) support.

// Load config if present (create contact/config.php from .example-config.php)
$config = [];
if (file_exists(__DIR__ . '/config.php')) {
    include __DIR__ . '/config.php';
}

$recipient = $config['recipient'] ?? 'hello@jineechen.com';
$from_email = $config['from_email'] ?? ('no-reply@' . ($_SERVER['SERVER_NAME'] ?? 'example.com'));
$from_name = $config['from_name'] ?? 'Website Contact';

// Logging helper and debug mode
$logFile = __DIR__ . '/logs/send.log';
if (!function_exists('append_log')) {
    function append_log($file, $msg) {
        $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . "\n";
        @file_put_contents($file, $line, FILE_APPEND | LOCK_EX);
    }
}

$debug = (isset($_GET['debug']) || isset($_POST['debug']))
         && in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
if ($debug) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}

// Convert PHP errors to exceptions and catch uncaught exceptions
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});
set_exception_handler(function($e) use ($logFile, $debug) {
    $msg = 'Uncaught exception: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine();
    append_log($logFile, $msg);
    if ($debug) {
        header('Content-Type: text/plain; charset=utf-8');
        echo $msg . "\n\n" . $e->getTraceAsString();
    } else {
        http_response_code(500);
        echo 'Internal Server Error';
    }
    exit;
});

// Allow quick debug/info via GET? Use ?debug=1 in browser to inspect basic handler state
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['debug'])) {
    header('Content-Type: text/plain; charset=utf-8');
    $vendorExists = file_exists(__DIR__ . '/../vendor/autoload.php') ? 'yes' : 'no';
    $cfgRecipient = '(none)';
    if (isset($recipient)) {
        if (is_array($recipient)) {
            $cfgRecipient = implode(',', $recipient);
        } else {
            $cfgRecipient = (string)$recipient;
        }
    }
    echo "Contact handler debug\n";
    echo "PHP version: " . PHP_VERSION . "\n";
    echo "Vendor/autoload present: {$vendorExists}\n";
    echo "Configured recipient: {$cfgRecipient}\n";
    echo "Server name: " . ($_SERVER['SERVER_NAME'] ?? 'n/a') . "\n";
    exit;
}

// Only accept POST for actual submissions
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method Not Allowed';
    exit;
}

// Honeypot check
$hp = trim($_POST['hp_website'] ?? '');
if (!empty($hp)) {
    // Likely bot — silently redirect to avoid feedback
    header('Location: /?contact=ok');
    exit;
}

// CSRF token validation
require_once __DIR__ . '/csrf-validate.php';
$csrf_result = validate_csrf_token($_POST['csrf_token'] ?? '');
if ($csrf_result !== true) {
    $is_ajax_early = isset($_GET['ajax']) || isset($_POST['ajax'])
        || (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);
    if ($is_ajax_early) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(403);
        echo json_encode($csrf_result);
    } else {
        http_response_code(403);
        echo 'CSRF validation failed. Please reload the page and try again.';
    }
    exit;
}

// Basic validation & sanitization
$first = trim(strip_tags($_POST['firstName'] ?? ''));
$last = trim(strip_tags($_POST['lastName'] ?? ''));
$email = trim($_POST['email'] ?? '');
$phone = trim(strip_tags($_POST['phone'] ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));
$consent = $_POST['consent'] ?? '';
$consent_ts = $_POST['consent_ts'] ?? '';

// Prevent header injection and overly long fields
$first = preg_replace('/[\r\n]+/', ' ', $first);
$last = preg_replace('/[\r\n]+/', ' ', $last);
$phone = preg_replace('/[\r\n]+/', ' ', $phone);
$email = preg_replace('/[\r\n]+/', ' ', $email);

// Enforce reasonable maximum lengths to mitigate abuse
$first = mb_substr($first, 0, 100);
$last = mb_substr($last, 0, 100);
$phone = mb_substr($phone, 0, 50);
$email = mb_substr($email, 0, 254);
$message = mb_substr($message, 0, 5000);

// Basic consent timestamp validation: accept numeric seconds or ISO8601 strings
if (ctype_digit((string)$consent_ts)) {
    // already seconds
    $consent_ts = (string)substr($consent_ts, 0, 10);
} else {
    // try to parse ISO8601 / other date formats to epoch seconds
    $ts = strtotime($consent_ts);
    if ($ts !== false) {
        $consent_ts = (string)$ts;
    } else {
        $consent_ts = '';
    }
}

$is_ajax = false;
// Detect AJAX request (fetch) via header or explicit param — define early for validation handling
if (isset($_GET['ajax']) || isset($_POST['ajax'])) {
    $is_ajax = true;
} elseif (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) {
    $is_ajax = true;
}

$errors = [];
if (empty($first) || empty($last) || empty($email)) {
    $errors[] = 'Required fields missing';
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email';
}
if (empty($consent) || empty($consent_ts)) {
    $errors[] = 'Consent required';
}

if (!empty($errors)) {
    // Log validation errors
    append_log($logFile, 'Validation failed: ' . implode('; ', $errors));
    // If AJAX request, return structured JSON so front-end can show detailed messages
    if ($is_ajax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => implode('; ', $errors), 'errors' => $errors]);
        exit;
    }
    // Fallback for non-AJAX: show a friendly HTML page with error details and contact info
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Form error</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:720px;margin:3rem auto;padding:1rem;">';
    echo '<h1>There was a problem with your submission</h1>';
    echo '<p>Please correct the following and try again:</p>';
    echo '<ul>';
    foreach ($errors as $err) {
        echo '<li>' . htmlspecialchars($err, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</li>';
    }
    echo '</ul>';
    echo '<p>If the problem persists, please email <a href="mailto:' . htmlspecialchars($from_email) . '">' . htmlspecialchars($from_email) . '</a> and include a short description.</p>';
    echo '<p><button onclick="history.back()" style="padding:8px 12px;border-radius:6px;background:#111;color:#fff;border:0;cursor:pointer">Return to form</button></p>';
    echo '</body></html>';
    exit;
}

// Prevent header injection in email fields
$clean_email = preg_replace('/[\r\n]+/', '', $email);

$subject = "Website enquiry from {$first} {$last}";
$body = "Name: {$first} {$last}\nEmail: {$clean_email}\nPhone: {$phone}\nConsent: {$consent} (ts: {$consent_ts})\n\nMessage:\n{$message}\n\nIP: {$_SERVER['REMOTE_ADDR']}\nUA: {$_SERVER['HTTP_USER_AGENT']}\n";

// Prepare recipients as array (allow comma-separated list in config or array)
$recipients = [];
if (is_array($recipient)) {
    $recipients = array_filter(array_map('trim', $recipient));
} else {
    $recipients = array_filter(array_map('trim', explode(',', (string)$recipient)));
}
if (empty($recipients)) {
    $recipients = ['hello@jineechen.com'];
}

$sent = false;

// Log file path (append_log is defined earlier)
$logFile = __DIR__ . '/logs/send.log';

// Try PHPMailer via Composer if available
$vendor = __DIR__ . '/../vendor/autoload.php';
if (file_exists($vendor)) {
    require $vendor;
    try {
        $sent = false;
        // Build list of SMTP providers (new `smtp_providers` array preferred)
        $smtp_providers = [];
        if (!empty($config['smtp_providers']) && is_array($config['smtp_providers'])) {
            foreach ($config['smtp_providers'] as $p) {
                if (is_array($p) && !empty($p['smtp_host'])) {
                    $smtp_providers[] = $p;
                }
            }
        } elseif (!empty($config['smtp_host'])) {
            $smtp_providers[] = [
                'smtp_host' => $config['smtp_host'] ?? null,
                'smtp_port' => $config['smtp_port'] ?? null,
                'smtp_user' => $config['smtp_user'] ?? null,
                'smtp_pass' => $config['smtp_pass'] ?? null,
                'smtp_secure' => $config['smtp_secure'] ?? null,
            ];
        }

        if (!empty($smtp_providers)) {
            foreach ($smtp_providers as $provider) {
                try {
                    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
                    // Ensure UTF-8 and robust encoding for non-ASCII (e.g. Chinese characters)
                    $mail->CharSet = 'UTF-8';
                    $mail->Encoding = 'base64';
                    if (!empty($provider['smtp_host']) && !empty($provider['smtp_user']) && !empty($provider['smtp_pass'])) {
                        $mail->isSMTP();
                        $mail->SMTPAuth = true;
                        $mail->Host = $provider['smtp_host'];
                        $mail->Username = $provider['smtp_user'];
                        $mail->Password = $provider['smtp_pass'];
                        $mail->SMTPSecure = $provider['smtp_secure'] ?? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                        $mail->Port = $provider['smtp_port'] ?? 587;
                        $mail->Timeout = 15;
                    } elseif (!empty($provider['smtp_host'])) {
                        if (!empty($provider['smtp_port'])) { $mail->Port = $provider['smtp_port']; }
                        if (!empty($provider['smtp_secure'])) { $mail->SMTPSecure = $provider['smtp_secure']; }
                    }
                    $mail->setFrom($from_email, $from_name);
                    foreach ($recipients as $r) { if (!empty($r)) $mail->addAddress($r); }
                    $mail->addReplyTo($clean_email, "{$first} {$last}");
                    $mail->Subject = $subject;
                    $mail->Body = $body;
                    $mail->send();
                    $sent = true;
                    append_log($logFile, "PHPMailer: sent via " . ($provider['smtp_host'] ?? 'unknown') . " to " . implode(',', $recipients) . " envelope_from={$from_email} reply_to={$clean_email}");
                    break; // stop after successful send
                } catch (\Exception $e) {
                    $err = 'PHPMailer exception (' . ($provider['smtp_host'] ?? 'unknown') . '): ' . $e->getMessage();
                    append_log($logFile, $err);
                    // try next provider
                }
            }
        } else {
            // No SMTP provider configured; try PHPMailer without SMTP (uses mail())
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            $mail->CharSet = 'UTF-8';
            $mail->Encoding = 'base64';
            $mail->setFrom($from_email, $from_name);
            foreach ($recipients as $r) { if (!empty($r)) $mail->addAddress($r); }
            $mail->addReplyTo($clean_email, "{$first} {$last}");
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->send();
            $sent = true;
            append_log($logFile, "PHPMailer: sent without SMTP to " . implode(',', $recipients) . " envelope_from={$from_email} reply_to={$clean_email}");
        }
    } catch (\Exception $e) {
        $err = 'PHPMailer exception: ' . $e->getMessage();
        append_log($logFile, $err);
        error_log($err);
        // fall back to mail()
    }
}

if (!$sent) {
    $headers = "From: {$from_name} <{$from_email}>\r\n";
    $headers .= "Reply-To: {$clean_email}\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=utf-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $to = implode(',', $recipients);
    $sent = @mail($to, $subject, $body, $headers);
    append_log($logFile, ($sent ? 'mail(): sent to ' : 'mail(): failed to send to ') . $to . ' envelope_from=' . $from_email . ' reply_to=' . $clean_email);
}

if ($sent) {
    if ($is_ajax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'ok', 'message' => 'Message sent']);
        exit;
    }
    // Show a simple success page so browser doesn't show a blank response
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Message sent</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:720px;margin:3rem auto;padding:1rem;">';
    echo '<h1>Message sent</h1>';
    echo '<p>Thank you, your message was sent successfully. I will get back to you soon.</p>';
    echo '<p><a href="/">Return to homepage</a></p>';
    echo '</body></html>';
    exit;
} else {
    if ($is_ajax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'error', 'message' => 'Failed to send message']);
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html><head><meta charset="utf-8"><title>Message failed</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:720px;margin:3rem auto;padding:1rem;">';
    echo '<h1>Sending failed</h1>';
    echo '<p>Sorry — we could not send your message. Please try again later or contact directly at <a href="mailto:' . htmlspecialchars($from_email) . '">' . htmlspecialchars($from_email) . '</a>.</p>';
    echo '<p><a href="/">Return to homepage</a></p>';
    echo '</body></html>';
    exit;
}

?>