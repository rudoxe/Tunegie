<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/AchievementSystem.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if (!$userId) {
    sendError('User ID is required', 400);
}

try {
    // Check if user exists and profile is public
    $stmt = $pdo->prepare('SELECT id, username, is_private FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        sendError('User not found', 404);
    }
    
    if ($user['is_private']) {
        sendError('This profile is private', 403);
    }
    
    $achievementSystem = new AchievementSystem($pdo);
    
    // Get all achievements with user's progress
    $stmt = $pdo->prepare("
        SELECT 
            a.*,
            ua.unlocked_at,
            CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END as is_earned
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY 
            CASE WHEN ua.id IS NOT NULL THEN 0 ELSE 1 END,
            ua.unlocked_at DESC,
            a.type,
            a.threshold_value ASC
    ");
    $stmt->execute([$userId]);
    $allAchievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Separate earned and available achievements
    $earnedAchievements = array_filter($allAchievements, function($a) { return $a['is_earned']; });
    $availableAchievements = array_filter($allAchievements, function($a) { return !$a['is_earned']; });
    
    // Get user stats for progress calculation
    $stmt = $pdo->prepare("
        SELECT 
            us.*,
            COALESCE(ds.current_streak, 0) as current_play_streak,
            (SELECT COUNT(*) FROM leaderboards WHERE user_id = ?) as total_games_from_leaderboard,
            (SELECT SUM(score) FROM leaderboards WHERE user_id = ?) as total_score_from_leaderboard,
            (SELECT MAX(score) FROM leaderboards WHERE user_id = ?) as best_score_from_leaderboard,
            (SELECT SUM(total_rounds) FROM leaderboards WHERE user_id = ?) as total_rounds_from_leaderboard
        FROM user_statistics us
        LEFT JOIN daily_streaks ds ON us.user_id = ds.user_id AND ds.streak_type = 'play_game'
        WHERE us.user_id = ?
    ");
    $stmt->execute([$userId, $userId, $userId, $userId, $userId]);
    $userStats = $stmt->fetch();
    
    // Calculate progress for available achievements
    foreach ($availableAchievements as &$achievement) {
        $progress = calculateProgress($achievement, $userStats);
        $achievement['progress'] = $progress;
        $achievement['progress_percentage'] = min(100, ($progress / $achievement['condition_value']) * 100);
    }
    
    // Get achievement statistics
    $totalPoints = array_sum(array_column($earnedAchievements, 'points_reward'));
    $totalAvailable = count($allAchievements);
    $totalEarned = count($earnedAchievements);
    $completionPercentage = $totalAvailable > 0 ? round(($totalEarned / $totalAvailable) * 100, 1) : 0;
    
    sendResponse([
        'user' => [
            'id' => $user['id'],
            'username' => $user['username']
        ],
        'achievements' => [
            'earned' => array_values($earnedAchievements),
            'available' => array_values($availableAchievements),
            'stats' => [
                'total_earned' => $totalEarned,
                'total_available' => $totalAvailable,
                'total_points' => $totalPoints,
                'completion_percentage' => $completionPercentage
            ]
        ]
    ]);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}

/**
 * Calculate progress towards an achievement
 */
function calculateProgress($achievement, $userStats) {
    if (!$userStats) return 0;
    
    $conditionType = $achievement['condition_type'];
    
    switch ($conditionType) {
        case 'total_games':
            return $userStats['total_games_from_leaderboard'] ?? 0;
            
        case 'total_score':
            return $userStats['total_score_from_leaderboard'] ?? 0;
            
        case 'best_score':
            return $userStats['best_score_from_leaderboard'] ?? 0;
            
        case 'streak_days':
            return $userStats['current_play_streak'] ?? 0;
            
        case 'total_rounds':
            return $userStats['total_rounds_from_leaderboard'] ?? 0;
            
        case 'accuracy':
            return $userStats['best_accuracy'] ?? 0;
            
        case 'consecutive_wins':
            // This would need additional tracking - for now, return 0
            return 0;
    }
    
    return 0;
}
?>
