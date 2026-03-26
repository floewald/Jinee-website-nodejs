<?php
// backend/contact/config.example.php
// Copy to `config.php` and fill in your actual credentials.
// DO NOT commit config.php — it is in .gitignore.

$config = [
    // Where the contact message will be sent
    'recipient' => ['hello@example.com'],

    // From address used in outbound mail (should be your domain)
    'from_email' => 'hello@example.com',
    'from_name'  => 'Your Name',

    // SMTP settings (recommended for deliverability)
    'smtp_providers' => [
        [
            'smtp_host'   => 'ssl0.example.net',
            'smtp_port'   => 465,
            'smtp_user'   => 'hello@example.com',
            'smtp_pass'   => 'YOUR_SMTP_PASSWORD',
            'smtp_secure' => 'ssl',
        ],
    ],
];
