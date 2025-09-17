<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Get user from JWT token
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    sendError('Authorization header missing or invalid', 401);
}

$token = $matches[1];
$userData = verifyJWT($token);

if (!$userData) {
    sendError('Invalid or expired token', 401);
}

$userId = $userData['user_id'];

if ($method === 'GET') {
    // Fetch user profile
    try {
        $stmt = $pdo->prepare('SELECT id, username, email, profile_picture, created_at FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            sendError('User not found', 404);
        }

        sendResponse([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'profile_picture' => $user['profile_picture'],
                'created_at' => $user['created_at']
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'PUT') {
    // Update user profile
    $input = json_decode(file_get_contents('php://input'), true);
    $username = isset($input['username']) ? trim($input['username']) : '';
    $email = isset($input['email']) ? trim($input['email']) : '';

    if (!$username || !$email) {
        sendError('Username and email are required');
    }

    if (strlen($username) < 8 || strlen($username) > 16) {
        sendError('Invalid username or e-mail');
    }

    // Check if username contains only Latin letters
    if (!preg_match('/^[a-zA-Z]+$/', $username)) {
        sendError('Invalid username or e-mail');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255 || !strpos($email, '@')) {
        sendError('Invalid username or e-mail');
    }

    try {
        // Check if username is taken by another user
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
        $stmt->execute([$username, $userId]);
        if ($stmt->fetch()) {
            sendError('Invalid username or e-mail');
        }

        // Check if email is taken by another user
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
        $stmt->execute([$email, $userId]);
        if ($stmt->fetch()) {
            sendError('Invalid username or e-mail');
        }

        // Update user profile
        $stmt = $pdo->prepare('UPDATE users SET username = ?, email = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$username, $email, $userId]);

        // Return updated user info
        $stmt = $pdo->prepare('SELECT id, username, email, profile_picture, created_at FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        sendResponse([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'profile_picture' => $user['profile_picture'],
                'created_at' => $user['created_at']
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }

} else {
    sendError('Method not allowed', 405);
}
