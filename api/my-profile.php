<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/AchievementSystem.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDbConnection();

// Get and verify JWT token
$jwt = getJWTFromHeader();
if (!$jwt) {
    sendError('Authorization token required', 401);
}

$userData = verifyJWT($jwt);
if (!$userData) {
    sendError('Invalid or expired token', 401);
}

$userId = $userData['user_id'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $achievementSystem = new AchievementSystem($pdo);
    
    // Get user basic info
    $stmt = $pdo->prepare('
        SELECT id, username, email, profile_picture, created_at
        FROM users 
        WHERE id = ?
    ');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    // Get both login and play streaks
    $loginStreak = $achievementSystem->getUserStreakInfo($userId, 'login');
    $playStreak = $achievementSystem->getUserStreakInfo($userId, 'play_game');
    
    // Get user statistics
    $stmt = $pdo->prepare('
        SELECT 
            total_games_played,
            total_rounds_played,
            total_correct_answers,
            best_score,
            best_accuracy,
            last_played_at
        FROM user_statistics 
        WHERE user_id = ?
    ');
    $stmt->execute([$userId]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get achievement summary
    $stmt = $pdo->prepare('
        SELECT 
            COUNT(ua.id) as earned_count,
            SUM(a.points) as total_points,
            (SELECT COUNT(*) FROM achievements) as total_available
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
    ');
    $stmt->execute([$userId]);
    $achievementStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get recent achievements (last 3)
    $stmt = $pdo->prepare('
        SELECT 
            a.name,
            a.description,
            a.icon,
            a.color,
            a.points,
            ua.earned_at
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        ORDER BY ua.earned_at DESC
        LIMIT 3
    ');
    $stmt->execute([$userId]);
    $recentAchievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get leaderboard position
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
        'streaks' => [
            'login' => [
                'current_streak' => $loginStreak['current_streak'],
                'longest_streak' => $loginStreak['longest_streak'],
                'last_activity_date' => $loginStreak['last_activity_date'],
                'active_today' => $loginStreak['played_today']
            ],
            'play' => [
                'current_streak' => $playStreak['current_streak'],
                'longest_streak' => $playStreak['longest_streak'],
                'last_activity_date' => $playStreak['last_activity_date'],
                'played_today' => $playStreak['played_today']
            ]
        ],
        'stats' => $stats ?: [
            'total_games_played' => 0,
            'total_rounds_played' => 0,
            'total_correct_answers' => 0,
            'best_score' => 0,
            'best_accuracy' => 0,
            'last_played_at' => null
        ],
        'achievements' => [
            'earned_count' => (int)($achievementStats['earned_count'] ?? 0),
            'total_available' => (int)($achievementStats['total_available'] ?? 0),
            'total_points' => (int)($achievementStats['total_points'] ?? 0),
            'completion_percentage' => $achievementStats['total_available'] > 0 ? 
                round(($achievementStats['earned_count'] / $achievementStats['total_available']) * 100, 1) : 0,
            'recent' => $recentAchievements
        ],
        'leaderboard_position' => $leaderboardPosition ? $leaderboardPosition['position'] : null
    ]);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>