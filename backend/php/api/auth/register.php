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
$password = isset($input['password']) ? $input['password'] : '';
$username = isset($input['username']) ? trim($input['username']) : '';

if (!$email || !$password || !$username) {
    sendError('Email, username and password are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255 || !strpos($email, '@')) {
    sendError('Invalid username or e-mail');
}

if (strlen($password) < 8 || strlen($password) > 16) {
    sendError('Invalid username or password');
}

// Check password complexity requirements
if (!preg_match('/[A-Z]/', $password)) {
    sendError('Invalid username or password');
}

if (!preg_match('/[0-9]/', $password)) {
    sendError('Invalid username or password');
}

if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
    sendError('Invalid username or password');
}

if (strlen($username) < 8 || strlen($username) > 16) {
    sendError('Invalid username or e-mail');
}

// Check if username contains only Latin letters
if (!preg_match('/^[a-zA-Z]+$/', $username)) {
    sendError('Invalid username or e-mail');
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Invalid username or e-mail');
    }

    // Check if username already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendError('Invalid username or e-mail');
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())');
    $stmt->execute([$username, $email, $hash]);

    $userId = $pdo->lastInsertId();
    $token = generateJWT($userId, $email);

    sendResponse(['message' => 'Registration successful', 'token' => $token, 'user' => ['id' => $userId, 'email' => $email, 'username' => $username, 'profile_picture' => null]]);
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}


