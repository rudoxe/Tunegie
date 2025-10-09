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

switch ($method) {
    case 'GET':
        handleGetStreaks($achievementSystem, $userId);
        break;
    
    case 'POST':
        handlePostStreaks($achievementSystem, $userId);
        break;
    
    default:
        sendError('Method not allowed', 405);
}

/**
 * Handle GET requests for streaks
 */
function handleGetStreaks($achievementSystem, $userId) {
    $action = $_GET['action'] ?? 'info';
    $streakType = $_GET['type'] ?? 'play_game';
    
    switch ($action) {
        case 'info':
            // Get current streak information
            $streakInfo = $achievementSystem->getUserStreakInfo($userId, $streakType);
            
            // Add additional streak statistics
            $streakStats = getStreakStats($userId, $streakType);
            $streakInfo = array_merge($streakInfo, $streakStats);
            
            sendResponse([
                'streak_info' => $streakInfo,
                'streak_type' => $streakType
            ]);
            break;
            
        case 'history':
            // Get streak history
            $history = getStreakHistory($userId, $streakType);
            sendResponse([
                'streak_history' => $history,
                'streak_type' => $streakType
            ]);
            break;
            
        case 'leaderboard':
            // Get streak leaderboard
            $leaderboard = getStreakLeaderboard($streakType);
            sendResponse([
                'streak_leaderboard' => $leaderboard,
                'streak_type' => $streakType
            ]);
            break;
            
        default:
            sendError('Invalid action parameter');
    }
}

/**
 * Handle POST requests for streaks
 */
function handlePostStreaks($achievementSystem, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    $streakType = $input['type'] ?? 'play_game';
    
    switch ($action) {
        case 'update':
            // Update/maintain streak (usually called when user plays a game)
            $streakResult = $achievementSystem->updateDailyStreak($userId, $streakType);
            
            // Check for streak achievements after updating
            if ($streakResult['streak_continued'] || $streakResult['current_streak'] == 1) {
                $gameData = ['current_streak' => $streakResult['current_streak']];
                $newAchievements = $achievementSystem->checkAndAwardAchievements($userId, $gameData);
                $streakResult['new_achievements'] = $newAchievements;
            }
            
            sendResponse([
                'message' => 'Streak updated successfully',
                'streak_result' => $streakResult
            ]);
            break;
            
        case 'check_status':
            // Check if user needs to play today to maintain streak
            $streakInfo = $achievementSystem->getUserStreakInfo($userId, $streakType);
            $needsActivity = !$streakInfo['played_today'];
            
            // Calculate time remaining until streak is lost
            $timeRemaining = getTimeUntilStreakLoss();
            
            sendResponse([
                'needs_activity' => $needsActivity,
                'current_streak' => $streakInfo['current_streak'],
                'played_today' => $streakInfo['played_today'],
                'time_remaining' => $timeRemaining
            ]);
            break;
            
        default:
            sendError('Invalid action parameter');
    }
}

/**
 * Get additional streak statistics
 */
function getStreakStats($userId, $streakType) {
    global $pdo;
    
    try {
        // Get streak consistency data
        $stmt = $pdo->prepare("
            SELECT 
                DATE(updated_at) as activity_date,
                current_streak
            FROM daily_streaks 
            WHERE user_id = ? AND streak_type = ?
            ORDER BY updated_at DESC
            LIMIT 30
        ");
        $stmt->execute([$userId, $streakType]);
        $recentActivity = $stmt->fetchAll();
        
        // Calculate streak statistics
        $totalActiveDays = count($recentActivity);
        $streakBroken = 0;
        $averageStreak = 0;
        
        if (!empty($recentActivity)) {
            // Simple average calculation
            $totalStreakDays = array_sum(array_column($recentActivity, 'current_streak'));
            $averageStreak = $totalActiveDays > 0 ? round($totalStreakDays / $totalActiveDays, 1) : 0;
        }
        
        return [
            'total_active_days_last_30' => $totalActiveDays,
            'average_streak_length' => $averageStreak,
            'activity_consistency' => $totalActiveDays >= 21 ? 'excellent' : 
                                   ($totalActiveDays >= 14 ? 'good' : 
                                   ($totalActiveDays >= 7 ? 'fair' : 'needs_improvement'))
        ];
    } catch (Exception $e) {
        error_log("Streak stats error: " . $e->getMessage());
        return [
            'total_active_days_last_30' => 0,
            'average_streak_length' => 0,
            'activity_consistency' => 'unknown'
        ];
    }
}

/**
 * Get streak history for user
 */
function getStreakHistory($userId, $streakType, $limit = 30) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                DATE(updated_at) as date,
                current_streak,
                longest_streak,
                CASE 
                    WHEN current_streak > LAG(current_streak, 1, 0) OVER (ORDER BY updated_at) 
                    THEN 'continued'
                    WHEN current_streak = 1 
                    THEN 'started'
                    ELSE 'broken'
                END as streak_status
            FROM daily_streaks
            WHERE user_id = ? AND streak_type = ?
            ORDER BY updated_at DESC
            LIMIT ?
        ");
        $stmt->execute([$userId, $streakType, $limit]);
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Streak history error: " . $e->getMessage());
        return [];
    }
}

/**
 * Get streak leaderboard
 */
function getStreakLeaderboard($streakType, $limit = 10) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            SELECT 
                u.username,
                u.id as user_id,
                ds.current_streak,
                ds.longest_streak,
                ds.last_activity_date,
                CASE 
                    WHEN ds.last_activity_date = CURDATE() THEN 'active'
                    WHEN ds.last_activity_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'at_risk'
                    ELSE 'broken'
                END as streak_status
            FROM daily_streaks ds
            JOIN users u ON ds.user_id = u.id
            WHERE ds.streak_type = ?
            ORDER BY ds.current_streak DESC, ds.longest_streak DESC
            LIMIT ?
        ");
        $stmt->execute([$streakType, $limit]);
        return $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Streak leaderboard error: " . $e->getMessage());
        return [];
    }
}

/**
 * Calculate time remaining until streak is lost
 */
function getTimeUntilStreakLoss() {
    $now = new DateTime();
    $endOfDay = new DateTime('tomorrow 00:00:00');
    $diff = $now->diff($endOfDay);
    
    return [
        'hours' => $diff->h,
        'minutes' => $diff->i,
        'seconds' => $diff->s,
        'total_seconds' => ($diff->h * 3600) + ($diff->i * 60) + $diff->s
    ];
}

?>