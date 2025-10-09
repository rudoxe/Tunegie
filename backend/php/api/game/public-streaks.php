<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 50) : 20;
    $streakType = $_GET['type'] ?? 'play_game';
    
    // Get public streak leaderboard (only for non-private users)
    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.username,
            u.profile_picture,
            ds.current_streak,
            ds.longest_streak,
            ds.last_activity_date,
            CASE 
                WHEN ds.last_activity_date = CURDATE() THEN 'active'
                WHEN ds.last_activity_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'at_risk'
                ELSE 'broken'
            END as streak_status,
            DATEDIFF(CURDATE(), ds.last_activity_date) as days_since_last_activity
        FROM daily_streaks ds
        JOIN users u ON ds.user_id = u.id
        WHERE ds.streak_type = ? 
        AND (u.is_private IS NULL OR u.is_private = FALSE)
        ORDER BY ds.current_streak DESC, ds.longest_streak DESC
        LIMIT ?
    ");
    $stmt->execute([$streakType, $limit]);
    $leaderboard = $stmt->fetchAll();
    
    // Get overall stats
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_players,
            MAX(current_streak) as highest_current_streak,
            MAX(longest_streak) as highest_longest_streak,
            AVG(current_streak) as average_current_streak,
            COUNT(CASE WHEN current_streak > 0 THEN 1 END) as active_streakers
        FROM daily_streaks ds
        JOIN users u ON ds.user_id = u.id
        WHERE ds.streak_type = ? 
        AND (u.is_private IS NULL OR u.is_private = FALSE)
    ");
    $stmt->execute([$streakType]);
    $stats = $stmt->fetch();
    
    // Add rank to each player
    foreach ($leaderboard as $index => &$player) {
        $player['rank'] = $index + 1;
        
        // Add streak status badge
        switch ($player['streak_status']) {
            case 'active':
                $player['status_badge'] = ['text' => 'Active', 'color' => 'green'];
                break;
            case 'at_risk':
                $player['status_badge'] = ['text' => 'At Risk', 'color' => 'orange'];
                break;
            default:
                $player['status_badge'] = ['text' => 'Broken', 'color' => 'red'];
        }
    }
    
    sendResponse([
        'leaderboard' => $leaderboard,
        'stats' => [
            'total_players' => (int)$stats['total_players'],
            'highest_current_streak' => (int)$stats['highest_current_streak'],
            'highest_longest_streak' => (int)$stats['highest_longest_streak'],
            'average_current_streak' => round($stats['average_current_streak'], 1),
            'active_streakers' => (int)$stats['active_streakers']
        ],
        'streak_type' => $streakType
    ]);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>