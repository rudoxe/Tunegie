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
        $stmt = $pdo->prepare('SELECT id, username, email, profile_picture, created_at, is_private FROM users WHERE id = ?');
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
                'created_at' => $user['created_at'],
                'is_private' => (bool)$user['is_private']
            ]
        ]);
    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }

} elseif ($method === 'PUT') {
    // Update user profile (username and/or privacy)
    $input = json_decode(file_get_contents('php://input'), true);
    $username = isset($input['username']) ? trim($input['username']) : '';
    $isPrivate = isset($input['is_private']) ? $input['is_private'] : null;
    
    // Validate is_private if provided
    if ($isPrivate !== null && !is_bool($isPrivate)) {
        sendError('Invalid privacy setting value');
    }

    // If only updating privacy
    if ($isPrivate !== null && empty($username)) {
        try {
            // Convert to integer for MySQL boolean field (0 or 1)
            $isPrivateInt = $isPrivate ? 1 : 0;
            $stmt = $pdo->prepare('UPDATE users SET is_private = ? WHERE id = ?');
            $stmt->execute([$isPrivateInt, $userId]);
            
            // Return updated user info
            $stmt = $pdo->prepare('SELECT id, username, email, profile_picture, created_at, is_private FROM users WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            sendResponse([
                'message' => 'Privacy setting updated successfully',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'profile_picture' => $user['profile_picture'],
                    'created_at' => $user['created_at'],
                    'is_private' => (bool)$user['is_private']
                ]
            ]);
        } catch (PDOException $e) {
            sendError('Database error: ' . $e->getMessage(), 500);
        }
        return;
    }

    if (!$username) {
        sendError('Username is required');
    }

    if (strlen($username) < 8 || strlen($username) > 16) {
        sendError('Username must be 8-16 characters long');
    }

    // Check if username contains only Latin letters
    if (!preg_match('/^[a-zA-Z]+$/', $username)) {
        sendError('Username must contain only Latin letters');
    }

    try {
        // Get current username
        $stmt = $pdo->prepare('SELECT username FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $currentUser = $stmt->fetch();
        
        if (!$currentUser) {
            sendError('User not found', 404);
        }
        
        $oldUsername = $currentUser['username'];
        
        // Check if username is taken by another user
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? AND id != ?');
        $stmt->execute([$username, $userId]);
        if ($stmt->fetch()) {
            sendError('Username is already taken');
        }

        // Start transaction
        $pdo->beginTransaction();

        // Update user profile
        $stmt = $pdo->prepare('UPDATE users SET username = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$username, $userId]);

        // Track username change in history (only if username actually changed)
        if ($oldUsername !== $username) {
            $stmt = $pdo->prepare('INSERT INTO username_history (user_id, old_username, new_username) VALUES (?, ?, ?)');
            $stmt->execute([$userId, $oldUsername, $username]);
        }

        $pdo->commit();

        // Return updated user info
        $stmt = $pdo->prepare('SELECT id, username, email, profile_picture, created_at, is_private FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        sendResponse([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'profile_picture' => $user['profile_picture'],
                'created_at' => $user['created_at'],
                'is_private' => (bool)$user['is_private']
            ]
        ]);
    } catch (PDOException $e) {
        $pdo->rollback();
        sendError('Database error: ' . $e->getMessage(), 500);
    }

} else {
    sendError('Method not allowed', 405);
}
