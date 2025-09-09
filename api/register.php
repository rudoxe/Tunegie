<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';
$username = isset($input['username']) ? trim($input['username']) : '';

if (!$email || !$password || !$username) {
    sendError('Email, username and password are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Invalid email format');
}

if (strlen($password) < 6) {
    sendError('Password must be at least 6 characters long');
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Email already registered');
    }

    // Check if username already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendError('Username already taken');
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$username, $email, $hash]);

    $userId = $pdo->lastInsertId();
    $token = generateJWT($userId, $email);

    sendResponse(['message' => 'Registration successful', 'token' => $token, 'user' => ['id' => $userId, 'email' => $email, 'username' => $username]]);
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}

