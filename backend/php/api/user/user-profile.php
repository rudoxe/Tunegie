<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/AchievementSystem.php';

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
    $achievementSystem = new AchievementSystem($pdo);
    
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

    // If stored path points to a non-existent file, null it so frontend shows fallback immediately
    if (!empty($user['profile_picture'])) {
        $fullPath = __DIR__ . '/../' . $user['profile_picture'];
        if (!file_exists($fullPath)) {
            $user['profile_picture'] = null;
        }
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

    // Get comprehensive streak information
    $streakInfo = $achievementSystem->getUserStreakInfo($userId, 'play_game');
    
    // Get user's earned achievements with details
    $stmt = $pdo->prepare('
        SELECT 
            a.id,
            a.name,
            a.title,
            a.description,
            a.icon,
            a.category,
            a.points_reward as points,
            ua.earned_at
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        ORDER BY ua.earned_at DESC
    ');
    $stmt->execute([$userId]);
    $userAchievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Map category to colors for frontend display
    $categoryColors = [
        'gameplay' => 'bronze',
        'scoring' => 'gold', 
        'consistency' => 'silver',
        'streak' => 'blue',
        'special' => 'purple'
    ];
    
    // Add color mapping to achievements
    foreach ($userAchievements as &$achievement) {
        $achievement['color'] = $categoryColors[$achievement['category']] ?? 'bronze';
    }
    
    // Get total achievement stats
    $stmt = $pdo->prepare('
        SELECT 
            COUNT(ua.id) as earned_count,
            SUM(a.points_reward) as total_points,
            (SELECT COUNT(*) FROM achievements) as total_available
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
    ');
    $stmt->execute([$userId]);
    $achievementStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Get recent achievements (last 5)
    $recentAchievements = array_slice($userAchievements, 0, 5);
    
    // Calculate achievement completion percentage
    $completionPercentage = $achievementStats['total_available'] > 0 ? 
        round(($achievementStats['earned_count'] / $achievementStats['total_available']) * 100, 1) : 0;

    sendResponse([
        'user' => $user,
        'stats' => $stats,
        'streak_info' => [
            'current_streak' => $streakInfo['current_streak'],
            'longest_streak' => $streakInfo['longest_streak'],
            'last_activity_date' => $streakInfo['last_activity_date'],
            'played_today' => $streakInfo['played_today'],
            'status' => $streakInfo['current_streak'] > 0 ? 
                ($streakInfo['played_today'] ? 'active' : 'at_risk') : 'inactive'
        ],
        'achievements' => [
            'earned' => $userAchievements,
            'recent' => $recentAchievements,
            'stats' => [
                'earned_count' => (int)$achievementStats['earned_count'],
                'total_available' => (int)$achievementStats['total_available'],
                'total_points' => (int)($achievementStats['total_points'] ?? 0),
                'completion_percentage' => $completionPercentage
            ]
        ],
        'recent_games' => $recentGames,
        'leaderboard_position' => $leaderboardPosition ? $leaderboardPosition['position'] : null
    ]);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>