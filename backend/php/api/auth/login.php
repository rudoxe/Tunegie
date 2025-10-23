<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/AchievementSystem.php';

$pdo = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError('Method not allowed', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? $input['password'] : '';

if (!$email || !$password) {
    sendError('Email and password are required');
}

try {
    $stmt = $pdo->prepare('SELECT id, username, email, password_hash, profile_picture FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendError('Invalid email or password', 401);
    }

    $token = generateJWT($user['id'], $user['email']);
    
    // Initialize achievement system and update login streak
    $achievementSystem = new AchievementSystem($pdo);
    
    // Update login streak (this will create a record if none exists)
    $streakResult = $achievementSystem->updateDailyStreak($user['id'], 'login');
    
    // Also check if user has played any games today, if not, initialize play streak
    $playStreakResult = $achievementSystem->updateDailyStreak($user['id'], 'play_game');

    sendResponse([
        'message' => 'Login successful',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'username' => $user['username'],
            'profile_picture' => $user['profile_picture']
        ],
        'streak_info' => [
            'login_streak' => [
                'current_streak' => $streakResult['current_streak'],
                'longest_streak' => $streakResult['longest_streak']
            ],
            'play_streak' => [
                'current_streak' => $playStreakResult['current_streak'],
                'longest_streak' => $playStreakResult['longest_streak']
            ]
        ]
    ]);
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}

