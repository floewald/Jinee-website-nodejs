<?php
// backend/contact/config.template.php
// Generated in CI: placeholders are replaced with GitHub Secrets.
// Do not store real credentials in this file.

$config = [
    // Where contact messages are sent
    'recipient' => ['%%CONTACT_RECIPIENT%%'],

    // From address/name used in outbound mail
    'from_email' => '%%CONTACT_FROM_EMAIL%%',
    'from_name'  => '%%CONTACT_FROM_NAME%%',

    // SMTP settings (recommended for deliverability)
    'smtp_providers' => [
        [
            'smtp_host'   => '%%CONTACT_SMTP_HOST%%',
            'smtp_port'   => '%%CONTACT_SMTP_PORT%%',
            'smtp_user'   => '%%CONTACT_SMTP_USER%%',
            'smtp_pass'   => '%%CONTACT_SMTP_PASS%%',
            'smtp_secure' => '%%CONTACT_SMTP_SECURE%%',
        ],
    ],
];
