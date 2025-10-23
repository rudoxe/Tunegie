<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/AchievementSystem.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// Get and verify JWT token
$jwt = getJWTFromHeader();
if (!$jwt) {
    sendError('Authorization token required', 401);
}

$userData = verifyJWT($jwt);
if (!$userData) {
    sendError('Invalid or expired token', 401);
}

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

$userId = $userData['user_id'];

try {
    error_log("Fetching achievements for user ID: $userId");
    
    // Get all achievements with user's progress
    $stmt = $pdo->prepare("
        SELECT 
            a.*,
            ua.unlocked_at,
            ua.notified,
            CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END as is_earned,
            COALESCE(a.points, a.points_reward, 100) as points
        FROM achievements a
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY 
            CASE WHEN ua.id IS NOT NULL THEN 0 ELSE 1 END,
            ua.unlocked_at DESC,
            a.category,
            COALESCE(a.points, a.points_reward, 100) DESC,
            a.name ASC
    ");
    $stmt->execute([$userId]);
    $allAchievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("Found " . count($allAchievements) . " achievements");
    
    // Get user stats for progress calculation - handle missing tables gracefully
    $userStats = null;
    try {
        $stmt = $pdo->prepare("
            SELECT 
                COALESCE(us.user_id, ?) as user_id,
                COALESCE(ps.current_streak, 0) as current_play_streak,
                COALESCE(ls.current_streak, 0) as current_login_streak,
                COALESCE((SELECT COUNT(*) FROM leaderboards WHERE user_id = ?), 0) as total_games_from_leaderboard,
                COALESCE((SELECT SUM(score) FROM leaderboards WHERE user_id = ?), 0) as total_score_from_leaderboard,
                COALESCE((SELECT MAX(score) FROM leaderboards WHERE user_id = ?), 0) as best_score_from_leaderboard,
                COALESCE((SELECT SUM(total_rounds) FROM leaderboards WHERE user_id = ?), 0) as total_rounds_from_leaderboard,
                COALESCE((SELECT AVG(accuracy) FROM leaderboards WHERE user_id = ? AND accuracy > 0), 0) as avg_accuracy
            FROM (SELECT ? as user_id) u
            LEFT JOIN user_statistics us ON us.user_id = u.user_id
            LEFT JOIN daily_streaks ps ON u.user_id = ps.user_id AND ps.streak_type = 'play_game'
            LEFT JOIN daily_streaks ls ON u.user_id = ls.user_id AND ls.streak_type = 'login'
        ");
        $stmt->execute([$userId, $userId, $userId, $userId, $userId, $userId, $userId]);
        $userStats = $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("User stats query failed: " . $e->getMessage());
        // Create default stats if query fails
        $userStats = [
            'user_id' => $userId,
            'current_play_streak' => 0,
            'current_login_streak' => 0,
            'total_games_from_leaderboard' => 0,
            'total_score_from_leaderboard' => 0,
            'best_score_from_leaderboard' => 0,
            'total_rounds_from_leaderboard' => 0,
            'avg_accuracy' => 0
        ];
    }
    
    // Process achievements and add progress info
    foreach ($allAchievements as &$achievement) {
        // Format the achievement data
        $achievement['id'] = (int)$achievement['id'];
        $achievement['points'] = (int)($achievement['points'] ?? $achievement['points_reward'] ?? 100);
        $achievement['is_earned'] = (bool)$achievement['is_earned'];
        
        // Use title or name for display
        if (empty($achievement['name']) && !empty($achievement['title'])) {
            $achievement['name'] = $achievement['title'];
        }
        
        // Ensure we have required fields with defaults
        $achievement['icon'] = $achievement['icon'] ?? '🏆';
        $achievement['color'] = $achievement['color'] ?? 'gold';
        $achievement['category'] = $achievement['category'] ?? 'general';
        
        // Add progress for locked achievements
        if (!$achievement['is_earned']) {
            $progress = calculateAchievementProgress($achievement, $userStats);
            $achievement['progress'] = $progress;
            $achievement['target'] = (int)($achievement['condition_value'] ?? 1);
            $conditionValue = $achievement['condition_value'] ?? 1;
            $achievement['progress_percentage'] = $conditionValue > 0 ? 
                min(100, round(($progress / $conditionValue) * 100, 1)) : 0;
        } else {
            $achievement['progress'] = (int)($achievement['condition_value'] ?? 1);
            $achievement['target'] = (int)($achievement['condition_value'] ?? 1);
            $achievement['progress_percentage'] = 100;
        }
        
        // Format dates
        if ($achievement['unlocked_at']) {
            $achievement['unlocked_at'] = date('Y-m-d H:i:s', strtotime($achievement['unlocked_at']));
        }
        
        // Clean up fields
        unset($achievement['condition_type']);
        unset($achievement['condition_value']);
        unset($achievement['notified']);
        unset($achievement['points_reward']);
        unset($achievement['is_hidden']);
        unset($achievement['title']);
    }
    
    sendResponse([
        'achievements' => $allAchievements
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in achievements.php: " . $e->getMessage());
    sendError('Database error occurred', 500);
} catch (Exception $e) {
    error_log("General error in achievements.php: " . $e->getMessage());
    sendError('An error occurred while fetching achievements', 500);
}

/**
 * Calculate progress towards an achievement based on user stats
 */
function calculateAchievementProgress($achievement, $userStats) {
    if (!$userStats) return 0;
    if (!isset($achievement['condition_type'])) return 0;
    
    $conditionType = $achievement['condition_type'];
    
    switch ($conditionType) {
        case 'total_games':
        case 'games_played':
            return (int)($userStats['total_games_from_leaderboard'] ?? 0);
            
        case 'total_score':
        case 'cumulative_score':
            return (int)($userStats['total_score_from_leaderboard'] ?? 0);
            
        case 'best_score':
        case 'high_score':
            return (int)($userStats['best_score_from_leaderboard'] ?? 0);
            
        case 'streak_days':
        case 'play_streak':
            return (int)($userStats['current_play_streak'] ?? 0);
            
        case 'login_streak':
            return (int)($userStats['current_login_streak'] ?? 0);
            
        case 'total_rounds':
            return (int)($userStats['total_rounds_from_leaderboard'] ?? 0);
            
        case 'accuracy':
        case 'average_accuracy':
            return (int)($userStats['avg_accuracy'] ?? 0);
            
        case 'perfect_games':
            // This would need additional tracking - for now, return 0
            return 0;
            
        case 'consecutive_wins':
            // This would need additional tracking - for now, return 0
            return 0;
            
        default:
            return 0;
    }
}
?>
