<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';

$pdo = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';

if (!$email) {
    sendError('Email is required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format');
}

try {
    // Find user by email
    $stmt = $pdo->prepare('SELECT id, username, email FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Don't reveal if email exists or not for security
        sendResponse([
            'message' => 'If an account with that email exists, a password reset link has been sent.'
        ]);
        exit;
    }

    // Generate reset token
    $resetToken = bin2hex(random_bytes(32));
    $hashedToken = hash('sha256', $resetToken);
    $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hour from now

    // Store reset token in database
    $stmt = $pdo->prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
    $stmt->execute([$user['id'], $hashedToken, $expiresAt]);

    // Generate reset URL
    $resetUrl = 'http://localhost:3000/reset-password?token=' . $resetToken;
    
    // Log the reset URL for development purposes
    error_log("Password reset URL for " . $user['email'] . ": " . $resetUrl);
    
    // For development: skip email sending and return the reset URL directly
    sendResponse([
        'success' => true,
        'message' => 'Password reset link has been generated successfully!',
        'reset_url' => $resetUrl,
        'username' => $user['username'],
        'expires_in' => '1 hour',
        'instructions' => 'Click the link below or copy it to your browser to reset your password.'
    ]);

} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
