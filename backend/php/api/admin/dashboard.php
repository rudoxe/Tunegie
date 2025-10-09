<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/AchievementSystem.php';

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
$achievementSystem = new AchievementSystem($pdo);

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    // Get user basic info
    $userInfo = getUserInfo($pdo, $userId);
    
    // Get achievement summary
    $achievementStats = getAchievementStats($achievementSystem, $userId);
    $recentAchievements = getRecentAchievements($pdo, $userId, 5);
    
    // Get streak information
    $streakInfo = $achievementSystem->getUserStreakInfo($userId, 'play_game');
    $streakStats = getStreakStats($pdo, $userId);
    
    // Get game statistics
    $gameStats = getGameStats($pdo, $userId);
    
    // Get leaderboard position
    $leaderboardPosition = getLeaderboardPosition($pdo, $userId);
    
    // Get recent achievements instead of notifications
    $notifications = [];
    
    // Combine all dashboard data
    $dashboardData = [
        'user' => $userInfo,
        'achievements' => [
            'stats' => $achievementStats,
            'recent' => $recentAchievements,
            'next_milestone' => getNextAchievementMilestone($achievementSystem, $userId)
        ],
        'streaks' => [
            'current' => $streakInfo,
            'stats' => $streakStats,
            'reminder' => getStreakReminder($streakInfo)
        ],
        'game_stats' => $gameStats,
        'leaderboard' => $leaderboardPosition,
        'notifications' => $notifications,
        'daily_summary' => getDailySummary($pdo, $userId)
    ];
    
    sendResponse($dashboardData);
    
} catch (Exception $e) {
    error_log("Dashboard error: " . $e->getMessage());
    sendError('Failed to load dashboard data', 500);
}

/**
 * Get user basic information
 */
function getUserInfo($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                id, username, email, profile_picture, created_at,
                DATEDIFF(CURDATE(), DATE(created_at)) as days_since_joined
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$userId]);
        return $stmt->fetch();
    } catch (Exception $e) {
        error_log("Get user info error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get achievement statistics
 */
function getAchievementStats($achievementSystem, $userId) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(ua.id) as total_unlocked,
                SUM(a.points) as total_points,
                (SELECT COUNT(*) FROM achievements) as total_available,
                COUNT(CASE WHEN ua.earned_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as unlocked_this_week
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
        ");
        $stmt->execute([$userId]);
        $stats = $stmt->fetch();
        
        return [
            'total_unlocked' => (int)$stats['total_unlocked'],
            'total_available' => (int)$stats['total_available'],
            'total_points' => (int)$stats['total_points'],
            'unlocked_this_week' => (int)$stats['unlocked_this_week'],
            'completion_percentage' => $stats['total_available'] > 0 ? 
                round(($stats['total_unlocked'] / $stats['total_available']) * 100, 1) : 0
        ];
    } catch (Exception $e) {
        error_log("Achievement stats error: " . $e->getMessage());
        return [
            'total_unlocked' => 0,
            'total_available' => 0,
            'total_points' => 0,
            'unlocked_this_week' => 0,
            'completion_percentage' => 0
        ];
    }
}

/**
 * Get recent achievements
 */
function getRecentAchievements($pdo, $userId, $limit = 5) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                a.name as title, a.description, a.type as category, a.points,
                ua.earned_at
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.earned_at DESC
            LIMIT ?
        ");
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Recent achievements error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get streak statistics
 */
function getStreakStats($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                current_streak,
                longest_streak,
                last_activity_date,
                CASE 
                    WHEN last_activity_date = CURDATE() THEN TRUE 
                    ELSE FALSE 
                END as played_today,
                CASE 
                    WHEN last_activity_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'at_risk'
                    WHEN last_activity_date = CURDATE() THEN 'active'
                    ELSE 'broken'
                END as streak_status
            FROM daily_streaks 
            WHERE user_id = ? AND streak_type = 'play_game'
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        if (!$result) {
            return [
                'current_streak' => 0,
                'longest_streak' => 0,
                'played_today' => false,
                'streak_status' => 'none'
            ];
        }
        
        return $result;
    } catch (Exception $e) {
        error_log("Streak stats error: " . $e->getMessage());
        return [
            'current_streak' => 0,
            'longest_streak' => 0,
            'played_today' => false,
            'streak_status' => 'error'
        ];
    }
}

/**
 * Get game statistics
 */
function getGameStats($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                total_games_played,
                total_rounds_played,
                total_correct_answers,
                best_score,
                best_accuracy,
                last_played_at,
                CASE 
                    WHEN total_rounds_played > 0 
                    THEN ROUND((total_correct_answers / total_rounds_played) * 100, 1)
                    ELSE 0 
                END as overall_accuracy
            FROM user_statistics 
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        if (!$result) {
            return [
                'total_games_played' => 0,
                'total_rounds_played' => 0,
                'total_correct_answers' => 0,
                'best_score' => 0,
                'best_accuracy' => 0,
                'overall_accuracy' => 0,
                'last_played_at' => null
            ];
        }
        
        return $result;
    } catch (Exception $e) {
        error_log("Game stats error: " . $e->getMessage());
        return [
            'total_games_played' => 0,
            'total_rounds_played' => 0,
            'total_correct_answers' => 0,
            'best_score' => 0,
            'best_accuracy' => 0,
            'overall_accuracy' => 0,
            'last_played_at' => null
        ];
    }
}

/**
 * Get leaderboard position
 */
function getLeaderboardPosition($pdo, $userId) {
    try {
        // Get user's best score
        $stmt = $pdo->prepare("
            SELECT MAX(score) as best_score 
            FROM leaderboards 
            WHERE user_id = ?
        ");
        $stmt->execute([$userId]);
        $userBest = $stmt->fetch();
        
        if (!$userBest || !$userBest['best_score']) {
            return [
                'position' => null,
                'best_score' => 0,
                'total_players' => 0
            ];
        }
        
        // Get position based on best score
        $stmt = $pdo->prepare("
            SELECT COUNT(DISTINCT user_id) + 1 as position
            FROM leaderboards 
            WHERE score > ?
        ");
        $stmt->execute([$userBest['best_score']]);
        $position = $stmt->fetchColumn();
        
        // Get total players
        $stmt = $pdo->prepare("SELECT COUNT(DISTINCT user_id) as total FROM leaderboards");
        $stmt->execute();
        $totalPlayers = $stmt->fetchColumn();
        
        return [
            'position' => $position,
            'best_score' => (int)$userBest['best_score'],
            'total_players' => $totalPlayers
        ];
    } catch (Exception $e) {
        error_log("Leaderboard position error: " . $e->getMessage());
        return [
            'position' => null,
            'best_score' => 0,
            'total_players' => 0
        ];
    }
}

/**
 * Get notifications (unnotified achievements)
 */
function getNotifications($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                a.title, a.description, a.points_reward,
                ua.unlocked_at
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ? AND ua.is_completed = TRUE AND ua.notified = FALSE
            ORDER BY ua.unlocked_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Notifications error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get next achievement milestone
 */
function getNextAchievementMilestone($achievementSystem, $userId) {
    try {
        $achievements = $achievementSystem->getUserAchievements($userId);
        $incomplete = array_filter($achievements, function($a) { return !$a['is_completed']; });
        
        if (empty($incomplete)) {
            return null;
        }
        
        // Sort by progress percentage descending to find closest to completion
        usort($incomplete, function($a, $b) {
            return $b['progress_percentage'] <=> $a['progress_percentage'];
        });
        
        $nextAchievement = $incomplete[0];
        return [
            'title' => $nextAchievement['name'],
            'description' => $nextAchievement['description'],
            'progress' => $nextAchievement['progress'],
            'target' => $nextAchievement['threshold_value'],
            'progress_percentage' => $nextAchievement['progress_percentage'],
            'category' => $nextAchievement['type'],
            'points_reward' => $nextAchievement['points']
        ];
    } catch (Exception $e) {
        error_log("Next milestone error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get streak reminder info
 */
function getStreakReminder($streakInfo) {
    if (!$streakInfo['played_today'] && $streakInfo['current_streak'] > 0) {
        $now = new DateTime();
        $endOfDay = new DateTime('tomorrow 00:00:00');
        $diff = $now->diff($endOfDay);
        
        return [
            'needs_activity' => true,
            'message' => "Don't break your {$streakInfo['current_streak']}-day streak!",
            'time_remaining' => [
                'hours' => $diff->h,
                'minutes' => $diff->i
            ]
        ];
    }
    
    return [
        'needs_activity' => false,
        'message' => $streakInfo['played_today'] ? "Great job! Streak maintained today!" : "Start your streak by playing a game!",
        'time_remaining' => null
    ];
}

/**
 * Get daily summary
 */
function getDailySummary($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(*) as games_today,
                SUM(score) as points_today,
                AVG(accuracy_percentage) as avg_accuracy_today,
                MAX(score) as best_score_today
            FROM leaderboards 
            WHERE user_id = ? AND DATE(achieved_at) = CURDATE()
        ");
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        
        return [
            'games_played' => (int)$result['games_today'],
            'points_earned' => (int)($result['points_today'] ?? 0),
            'average_accuracy' => round($result['avg_accuracy_today'] ?? 0, 1),
            'best_score' => (int)($result['best_score_today'] ?? 0)
        ];
    } catch (Exception $e) {
        error_log("Daily summary error: " . $e->getMessage());
        return [
            'games_played' => 0,
            'points_earned' => 0,
            'average_accuracy' => 0,
            'best_score' => 0
        ];
    }
}

?>