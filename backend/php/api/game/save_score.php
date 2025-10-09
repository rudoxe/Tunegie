<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../utils/AchievementSystem.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
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

$userId = $userData['user_id'];

$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true);

if (!$input) {
    sendError('Invalid JSON data received. Raw input: ' . substr($inputRaw, 0, 200));
}

$totalRounds = isset($input['total_rounds']) ? (int)$input['total_rounds'] : 0;
$correctAnswers = isset($input['correct_answers']) ? (int)$input['correct_answers'] : 0;
$score = isset($input['score']) ? (int)$input['score'] : 0;
$gameMode = isset($input['game_mode']) ? $input['game_mode'] : 'standard';
$rounds = isset($input['rounds']) ? $input['rounds'] : [];

// Validation with detailed error messages
if ($totalRounds <= 0) {
    sendError('Invalid total_rounds: ' . $totalRounds . '. Must be > 0.');
}

if ($correctAnswers < 0) {
    sendError('Invalid correct_answers: ' . $correctAnswers . '. Must be >= 0.');
}

if ($score < 0) {
    sendError('Invalid score: ' . $score . '. Must be >= 0.');
}

if (empty($gameMode)) {
    sendError('Game mode is required');
}

try {
    $pdo = getDbConnection();
    $achievementSystem = new AchievementSystem($pdo);
    
    // Start transaction
    $pdo->beginTransaction();
    
    // Create game session
    $stmt = $pdo->prepare('
        INSERT INTO game_sessions (user_id, total_rounds, correct_answers, score, game_mode, status, session_ended_at) 
        VALUES (?, ?, ?, ?, ?, "completed", NOW())
    ');
    $stmt->execute([$userId, $totalRounds, $correctAnswers, $score, $gameMode]);
    $sessionId = $pdo->lastInsertId();
    
// Save individual rounds
    if (!empty($rounds)) {
        $roundStmt = $pdo->prepare('
            INSERT INTO game_rounds (session_id, round_number, track_id, track_title, track_artist, album_title, user_guess, is_correct, time_taken_seconds, points_earned) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        
        error_log('Saving rounds data: ' . json_encode($rounds));
        
        foreach ($rounds as $index => $round) {
            error_log('Processing round: ' . json_encode($round));
            $roundStmt->execute([
                $sessionId,
                $index + 1,
                $round['track_id'] ?? '',
                $round['track_title'] ?? '',
                $round['track_artist'] ?? '',
                $round['album_title'] ?? '',
                $round['user_guess'] ?? '',
                isset($round['is_correct']) ? (int)(bool)$round['is_correct'] : 0,
                $round['time_taken'] ?? 0,
                $round['points_earned'] ?? 0
            ]);
        }
    }
    
    // Get username for leaderboard
    $stmt = $pdo->prepare('SELECT username FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $username = $stmt->fetchColumn();
    
    // Calculate accuracy
    $accuracy = $totalRounds > 0 ? ($correctAnswers / $totalRounds) * 100 : 0;
    
    // Add to leaderboard
    $stmt = $pdo->prepare('
        INSERT INTO leaderboards (user_id, session_id, username, score, correct_answers, total_rounds, accuracy_percentage, game_mode) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$userId, $sessionId, $username, $score, $correctAnswers, $totalRounds, $accuracy, $gameMode]);
    
    // Update user statistics
    $stmt = $pdo->prepare('
        INSERT INTO user_statistics (user_id, total_games_played, total_rounds_played, total_correct_answers, best_score, best_accuracy, last_played_at) 
        VALUES (?, 1, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
            total_games_played = total_games_played + 1,
            total_rounds_played = total_rounds_played + ?,
            total_correct_answers = total_correct_answers + ?,
            best_score = GREATEST(best_score, ?),
            best_accuracy = GREATEST(best_accuracy, ?),
            last_played_at = NOW()
    ');
    $stmt->execute([$userId, $totalRounds, $correctAnswers, $score, $accuracy, $totalRounds, $correctAnswers, $score, $accuracy]);
    
    $pdo->commit();
    
    // Update daily streak
    $streakResult = $achievementSystem->updateDailyStreak($userId, 'play_game');
    
    // Prepare game data for achievement checking
    $gameData = [
        'score' => $score,
        'accuracy' => $accuracy,
        'total_rounds' => $totalRounds,
        'correct_answers' => $correctAnswers,
        'current_streak' => $streakResult['current_streak']
    ];
    
    // Check and award achievements
    $newAchievements = $achievementSystem->checkAndAwardAchievements($userId, $gameData);
    
    sendResponse([
        'message' => 'Score saved successfully',
        'session_id' => $sessionId,
        'leaderboard_position' => getLeaderboardPosition($pdo, $userId, $gameMode),
        'personal_best' => isPersonalBest($pdo, $userId, $score),
        'streak_info' => [
            'current_streak' => $streakResult['current_streak'],
            'longest_streak' => $streakResult['longest_streak'],
            'streak_continued' => $streakResult['streak_continued']
        ],
        'new_achievements' => $newAchievements,
        'achievement_count' => count($newAchievements)
    ]);
    
} catch (PDOException $e) {
    $pdo->rollback();
    sendError('Database error: ' . $e->getMessage(), 500);
}

function getLeaderboardPosition($pdo, $userId, $gameMode) {
    $stmt = $pdo->prepare('
        SELECT COUNT(*) + 1 as position 
        FROM leaderboards 
        WHERE game_mode = ? AND score > (
            SELECT MAX(score) FROM leaderboards WHERE user_id = ? AND game_mode = ?
        )
    ');
    $stmt->execute([$gameMode, $userId, $gameMode]);
    return $stmt->fetchColumn();
}

function isPersonalBest($pdo, $userId, $score) {
    $stmt = $pdo->prepare('SELECT MAX(score) FROM leaderboards WHERE user_id = ?');
    $stmt->execute([$userId]);
    $bestScore = $stmt->fetchColumn();
    return $score >= $bestScore;
}
?>
