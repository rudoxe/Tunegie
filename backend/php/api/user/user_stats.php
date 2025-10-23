<?php
// Suppress any HTML error output
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

// Get and verify JWT token
$jwt = getJWTFromHeader();
if (!$jwt) {
    sendError('Authorization token required', 401);
}

$userData = verifyJWT($jwt);
if (!$userData) {
    sendError('Invalid or expired token', 401);
}

if (!isset($userData['user_id'])) {
    sendError('Invalid token payload', 401);
}

$userId = $userData['user_id'];

try {
    $pdo = getDbConnection();
    
    // Get user statistics
    $stmt = $pdo->prepare('
        SELECT * FROM user_statistics WHERE user_id = ?
    ');
    $stmt->execute([$userId]);
    $stats = $stmt->fetch();
    
    // Get recent games
    $stmt = $pdo->prepare('
        SELECT 
            l.score,
            l.correct_answers,
            l.total_rounds,
            l.accuracy_percentage,
            l.achieved_at,
            l.game_mode,
            l.session_id
        FROM leaderboards l
        WHERE l.user_id = ?
        ORDER BY l.achieved_at DESC
        LIMIT 10
    ');
    $stmt->execute([$userId]);
    $recentGames = $stmt->fetchAll();
    
    // Get personal best scores per game mode
    $stmt = $pdo->prepare('
        SELECT 
            game_mode,
            MAX(score) as best_score,
            MAX(accuracy_percentage) as best_accuracy
        FROM leaderboards
        WHERE user_id = ?
        GROUP BY game_mode
    ');
    $stmt->execute([$userId]);
    $personalBests = $stmt->fetchAll();
    
    // Get leaderboard position
    $stmt = $pdo->prepare('
        SELECT COUNT(*) + 1 as position
        FROM leaderboards
        WHERE score > (SELECT MAX(score) FROM leaderboards WHERE user_id = ?)
    ');
    $stmt->execute([$userId]);
    $globalRank = $stmt->fetchColumn();
    
    // Calculate improvement over time (last 5 games vs previous 5)
    $stmt = $pdo->prepare('
        SELECT AVG(score) as avg_score, AVG(accuracy_percentage) as avg_accuracy
        FROM (
            SELECT score, accuracy_percentage
            FROM leaderboards
            WHERE user_id = ?
            ORDER BY achieved_at DESC
            LIMIT 5
        ) recent
    ');
    $stmt->execute([$userId]);
    $recentPerformance = $stmt->fetch();
    
    $stmt = $pdo->prepare('
        SELECT AVG(score) as avg_score, AVG(accuracy_percentage) as avg_accuracy
        FROM (
            SELECT score, accuracy_percentage
            FROM leaderboards
            WHERE user_id = ?
            ORDER BY achieved_at DESC
            LIMIT 5 OFFSET 5
        ) previous
    ');
    $stmt->execute([$userId]);
    $previousPerformance = $stmt->fetch();
    
    // Format recent games
    foreach ($recentGames as &$game) {
        $game['achieved_at_formatted'] = date('M j, Y g:i A', strtotime($game['achieved_at']));
        $game['accuracy_formatted'] = number_format($game['accuracy_percentage'], 1) . '%';
    }
    
    // Calculate trends
    $scoreImprovement = 0;
    $accuracyImprovement = 0;
    
    if ($recentPerformance && $previousPerformance && 
        $previousPerformance['avg_score'] > 0) {
        $scoreImprovement = (($recentPerformance['avg_score'] - $previousPerformance['avg_score']) 
                           / $previousPerformance['avg_score']) * 100;
        $accuracyImprovement = $recentPerformance['avg_accuracy'] - $previousPerformance['avg_accuracy'];
    }
    
    // Prepare response
    $response = [
        'user_id' => $userId,
        'statistics' => $stats ? [
            'total_games_played' => (int)$stats['total_games_played'],
            'total_rounds_played' => (int)$stats['total_rounds_played'],
            'total_correct_answers' => (int)$stats['total_correct_answers'],
            'best_score' => (int)$stats['best_score'],
            'best_accuracy' => number_format($stats['best_accuracy'], 1),
            'average_accuracy' => $stats['total_rounds_played'] > 0 ? 
                number_format(($stats['total_correct_answers'] / $stats['total_rounds_played']) * 100, 1) : '0.0',
            'last_played_at' => $stats['last_played_at'] ? 
                date('M j, Y g:i A', strtotime($stats['last_played_at'])) : null,
            'favorite_game_mode' => $stats['favorite_game_mode']
        ] : null,
        'recent_games' => $recentGames,
        'personal_bests' => $personalBests,
        'global_rank' => (int)$globalRank,
        'performance_trend' => [
            'score_improvement_percentage' => round($scoreImprovement, 1),
            'accuracy_improvement' => round($accuracyImprovement, 1),
            'recent_avg_score' => $recentPerformance ? round($recentPerformance['avg_score']) : 0,
            'recent_avg_accuracy' => $recentPerformance ? round($recentPerformance['avg_accuracy'], 1) : 0
        ]
    ];
    
    sendResponse($response);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>

