<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

$userId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$userId) {
    sendError('User ID is required', 400);
}

try {
    // Get user basic info
    $stmt = $pdo->prepare('
        SELECT id, username, profile_picture, created_at, is_private 
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        sendError('User not found', 404);
    }

    // Check if profile is private
    if ($user['is_private']) {
        sendError('This profile is private', 403);
    }

    // Get user statistics
    $stmt = $pdo->prepare('
        SELECT 
            total_games_played,
            total_rounds_played,
            total_correct_answers,
            best_score,
            best_accuracy,
            total_time_played_seconds,
            favorite_game_mode,
            last_played_at
        FROM user_statistics 
        WHERE user_id = ?
    ');
    $stmt->execute([$userId]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get recent game sessions (last 10)
    $stmt = $pdo->prepare('
        SELECT 
            id,
            session_started_at,
            session_ended_at,
            total_rounds,
            correct_answers,
            score,
            game_mode
        FROM game_sessions 
        WHERE user_id = ? AND status = "completed"
        ORDER BY session_started_at DESC 
        LIMIT 10
    ');
    $stmt->execute([$userId]);
    $recentGames = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get leaderboard position (current ranking)
    $stmt = $pdo->prepare('
        SELECT COUNT(*) + 1 as position
        FROM leaderboards l1
        WHERE l1.score > (
            SELECT MAX(l2.score) 
            FROM leaderboards l2 
            WHERE l2.user_id = ?
        )
    ');
    $stmt->execute([$userId]);
    $leaderboardPosition = $stmt->fetch(PDO::FETCH_ASSOC);

    sendResponse([
        'user' => $user,
        'stats' => $stats,
        'recent_games' => $recentGames,
        'leaderboard_position' => $leaderboardPosition ? $leaderboardPosition['position'] : null
    ]);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>