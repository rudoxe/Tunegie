<?php
require_once __DIR__ . '/../middleware/cors.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/AchievementSystem.php';

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

switch ($method) {
    case 'GET':
        handleGetAchievements($achievementSystem, $userId);
        break;
    
    case 'POST':
        handlePostAchievements($achievementSystem, $userId);
        break;
    
    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests for achievements
 */
function handleGetAchievements($achievementSystem, $userId) {
    $action = $_GET['action'] ?? 'list';
    
    switch ($action) {
        case 'list':
            // Get all user achievements with progress
            $achievements = $achievementSystem->getUserAchievements($userId);
            
            // Separate completed and incomplete achievements
            $completed = array_filter($achievements, function($a) { return $a['is_completed']; });
            $incomplete = array_filter($achievements, function($a) { return !$a['is_completed']; });
            
            sendResponse([
                'achievements' => [
                    'completed' => array_values($completed),
                    'incomplete' => array_values($incomplete),
                    'total' => count($achievements),
                    'completed_count' => count($completed),
                    'completion_percentage' => count($achievements) > 0 ? round((count($completed) / count($achievements)) * 100, 1) : 0
                ]
            ]);
            break;
            
        case 'stats':
            // Get achievement statistics
            $stats = getAchievementStats($achievementSystem, $userId);
            sendResponse(['stats' => $stats]);
            break;
            
        case 'recent':
            // Get recently unlocked achievements
            $recentAchievements = getRecentAchievements($userId);
            sendResponse(['recent_achievements' => $recentAchievements]);
            break;
            
        default:
            sendError('Invalid action parameter');
    }
}

/**
 * Handle POST requests for achievements
 */
function handlePostAchievements($achievementSystem, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'check':
            // Manually check for new achievements (useful for testing)
            $gameData = $input['game_data'] ?? [];
            $newAchievements = $achievementSystem->checkAndAwardAchievements($userId, $gameData);
            
            sendResponse([
                'message' => 'Achievement check completed',
                'new_achievements' => $newAchievements,
                'count' => count($newAchievements)
            ]);
            break;
            
        case 'mark_notified':
            // Mark achievements as notified
            $achievementIds = $input['achievement_ids'] ?? [];
            if (empty($achievementIds)) {
                sendError('Achievement IDs required');
            }
            
            markAchievementsAsNotified($userId, $achievementIds);
            sendResponse(['message' => 'Achievements marked as notified']);
            break;
            
        default:
            sendError('Invalid action parameter');
    }
}

/**
 * Get achievement statistics for user
 */
function getAchievementStats($achievementSystem, $userId) {
    global $pdo;
    
    try {
        // Get total points from achievements
        $stmt = $pdo->prepare("
            SELECT 
                COUNT(ua.id) as total_unlocked,
                SUM(a.points) as total_points,
                (SELECT COUNT(*) FROM achievements) as total_available
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
        ");
        $stmt->execute([$userId]);
        $stats = $stmt->fetch();
        
        // Get category breakdown
        $stmt = $pdo->prepare("
            SELECT 
                a.category,
                COUNT(ua.id) as unlocked_count,
                (SELECT COUNT(*) FROM achievements WHERE category = a.category) as total_count
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ? AND ua.is_completed = TRUE
            GROUP BY a.category
        ");
        $stmt->execute([$userId]);
        $categoryStats = $stmt->fetchAll();
        
        return [
            'total_unlocked' => (int)$stats['total_unlocked'],
            'total_available' => (int)$stats['total_available'],
            'total_points' => (int)$stats['total_points'],
            'completion_percentage' => $stats['total_available'] > 0 ? 
                round(($stats['total_unlocked'] / $stats['total_available']) * 100, 1) : 0,
            'categories' => $categoryStats
        ];
    } catch (Exception $e) {
        error_log("Achievement stats error: " . $e->getMessage());
        return [
            'total_unlocked' => 0,
            'total_available' => 0,
            'total_points' => 0,
            'completion_percentage' => 0,
            'categories' => []
        ];
    }
}

/**
 * Get recently unlocked achievements
 */
function getRecentAchievements($userId, $limit = 5) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                a.*,
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
 * Mark achievements as notified
 */
function markAchievementsAsNotified($userId, $achievementIds) {
    global $pdo;
    
    try {
        $placeholders = str_repeat('?,', count($achievementIds) - 1) . '?';
        $stmt = $pdo->prepare("
            UPDATE user_achievements 
            SET notified = TRUE 
            WHERE user_id = ? AND achievement_id IN ($placeholders)
        ");
        $params = array_merge([$userId], $achievementIds);
        $stmt->execute($params);
    } catch (Exception $e) {
        error_log("Mark notified error: " . $e->getMessage());
        sendError('Failed to mark achievements as notified', 500);
    }
}

?>