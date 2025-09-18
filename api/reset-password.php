<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$token = isset($input['token']) ? trim($input['token']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if (!$token || !$password) {
    sendError('Token and password are required');
}

if (strlen($token) !== 64) {
    sendError('Invalid reset token format');
}

if (strlen($password) < 6) {
    sendError('Password must be at least 6 characters long');
}

try {
    // Hash the provided token to match stored version
    $hashedToken = hash('sha256', $token);

    // Find valid reset token
    $stmt = $pdo->prepare('
        SELECT prt.id, prt.user_id, u.email, u.username 
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = FALSE
    ');
    $stmt->execute([$hashedToken]);
    $resetTokenData = $stmt->fetch();

    if (!$resetTokenData) {
        sendError('Invalid or expired reset token', 400);
    }

    // Hash new password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Start transaction
    $pdo->beginTransaction();

    // Update password
    $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$hashedPassword, $resetTokenData['user_id']]);

    // Mark token as used
    $stmt = $pdo->prepare('UPDATE password_reset_tokens SET used = TRUE WHERE id = ?');
    $stmt->execute([$resetTokenData['id']]);

    $pdo->commit();

    sendResponse([
        'message' => 'Password has been reset successfully'
    ]);

} catch (PDOException $e) {
    $pdo->rollback();
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>