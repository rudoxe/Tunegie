<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

// Get query parameters
$gameMode = isset($_GET['game_mode']) ? $_GET['game_mode'] : 'standard';
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$type = isset($_GET['type']) ? $_GET['type'] : 'top_scores'; // top_scores, recent, accuracy

// Validate limit
if ($limit > 100) $limit = 100;
if ($limit < 1) $limit = 10;

try {
    $pdo = getDbConnection();
    
    $data = [];
    
    switch ($type) {
        case 'top_scores':
            // Get top scores by score
            $stmt = $pdo->prepare('
                SELECT 
                    l.username,
                    l.score,
                    l.correct_answers,
                    l.total_rounds,
                    l.accuracy_percentage,
                    l.achieved_at,
                    l.game_mode,
                    u.id as user_id
                FROM leaderboards l
                JOIN users u ON l.user_id = u.id
                WHERE l.game_mode = ?
                ORDER BY l.score DESC, l.accuracy_percentage DESC, l.achieved_at ASC
                LIMIT ?
            ');
            $stmt->execute([$gameMode, $limit]);
            $data = $stmt->fetchAll();
            break;
            
        case 'accuracy':
            // Get top scores by accuracy
            $stmt = $pdo->prepare('
                SELECT 
                    l.username,
                    l.score,
                    l.correct_answers,
                    l.total_rounds,
                    l.accuracy_percentage,
                    l.achieved_at,
                    l.game_mode,
                    u.id as user_id
                FROM leaderboards l
                JOIN users u ON l.user_id = u.id
                WHERE l.game_mode = ? AND l.total_rounds >= 5
                ORDER BY l.accuracy_percentage DESC, l.score DESC, l.achieved_at ASC
                LIMIT ?
            ');
            $stmt->execute([$gameMode, $limit]);
            $data = $stmt->fetchAll();
            break;
            
        case 'recent':
            // Get recent games
            $stmt = $pdo->prepare('
                SELECT 
                    l.username,
                    l.score,
                    l.correct_answers,
                    l.total_rounds,
                    l.accuracy_percentage,
                    l.achieved_at,
                    l.game_mode,
                    u.id as user_id
                FROM leaderboards l
                JOIN users u ON l.user_id = u.id
                WHERE l.game_mode = ?
                ORDER BY l.achieved_at DESC
                LIMIT ?
            ');
            $stmt->execute([$gameMode, $limit]);
            $data = $stmt->fetchAll();
            break;
            
        default:
            sendError('Invalid leaderboard type');
    }
    
    // Add rankings
    foreach ($data as $index => &$entry) {
        $entry['rank'] = $index + 1;
        $entry['achieved_at_formatted'] = date('M j, Y g:i A', strtotime($entry['achieved_at']));
        
        // Format accuracy
        $entry['accuracy_formatted'] = number_format($entry['accuracy_percentage'], 1) . '%';
        
        // Add performance indicators
        if ($entry['accuracy_percentage'] >= 90) {
            $entry['performance'] = 'excellent';
        } elseif ($entry['accuracy_percentage'] >= 70) {
            $entry['performance'] = 'good';
        } else {
            $entry['performance'] = 'average';
        }
    }
    
    // Get total number of entries for pagination info
    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM leaderboards WHERE game_mode = ?');
    $countStmt->execute([$gameMode]);
    $totalEntries = $countStmt->fetchColumn();
    
    sendResponse([
        'leaderboard' => $data,
        'type' => $type,
        'game_mode' => $gameMode,
        'total_entries' => (int)$totalEntries,
        'showing' => count($data),
        'limit' => $limit
    ]);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>
