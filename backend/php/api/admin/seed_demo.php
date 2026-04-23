<?php
/**
 * Demo Data Seeder
 * Seeds the database with demo users and game history so the leaderboard
 * and stats pages look populated on a fresh deployment.
 *
 * SECURITY: Protected by a SEED_SECRET environment variable.
 * Call with: GET /api/admin/seed_demo.php?secret=YOUR_SEED_SECRET
 *
 * On Railway, set SEED_SECRET in the environment variables panel.
 * Locally, set it in backend/php/.env or pass it directly.
 */

require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';

// ── Secret check ────────────────────────────────────────────────
$expectedSecret = getenv('SEED_SECRET') ?: null;
$providedSecret = $_GET['secret'] ?? '';

if (!$expectedSecret) {
    sendError('SEED_SECRET environment variable is not set. Set it on Railway before running this script.', 500);
}

if (!hash_equals($expectedSecret, $providedSecret)) {
    sendError('Forbidden — invalid secret.', 403);
}

// ── Only allow GET ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendError('Method not allowed', 405);
}

// ── Run seed ─────────────────────────────────────────────────────
try {
    $pdo = getDbConnection();
    $log = [];

    // Password hash for "Demo1234!" — bcrypt cost 10
    $passwordHash = password_hash('Demo1234!', PASSWORD_BCRYPT);

    // ── 1. Users ─────────────────────────────────────────────────
    $demoUsers = [
        [101, 'MelodyKing',  'melodyking@demo.tunegie',  60],
        [102, 'BeatDropper', 'beatdropper@demo.tunegie', 45],
        [103, 'RhythmRider', 'rhythmrider@demo.tunegie', 30],
        [104, 'SonicWave',   'sonicwave@demo.tunegie',   25],
        [105, 'TuneHunter',  'tunehunter@demo.tunegie',  20],
        [106, 'BassBomber',  'bassbomber@demo.tunegie',  15],
        [107, 'ChordMaster', 'chordmaster@demo.tunegie', 10],
        [108, 'NoteNinja',   'noteninja@demo.tunegie',    5],
    ];

    $userStmt = $pdo->prepare('
        INSERT IGNORE INTO users (id, username, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
    ');
    foreach ($demoUsers as [$id, $username, $email, $daysAgo]) {
        $userStmt->execute([$id, $username, $email, $passwordHash, $daysAgo]);
    }
    $log[] = '✅ Demo users inserted (or already exist)';

    // ── 2. Game sessions + leaderboard entries ────────────────────
    $games = [
        // [sessionId, userId, username, correct, score, mode, daysAgo]
        [1001, 101, 'MelodyKing',  10, 1200, 'random',  55],
        [1002, 101, 'MelodyKing',   9, 1050, 'random',  40],
        [1003, 101, 'MelodyKing',   8,  920, 'genre',   20],
        [1004, 101, 'MelodyKing',  10, 1180, 'artist',   5],
        [1005, 101, 'MelodyKing',   7,  780, 'random',   2],

        [1006, 102, 'BeatDropper', 10, 1100, 'random',  42],
        [1007, 102, 'BeatDropper',  9,  980, 'genre',   28],
        [1008, 102, 'BeatDropper', 10, 1090, 'artist',  14],
        [1009, 102, 'BeatDropper',  8,  860, 'random',   3],

        [1010, 103, 'RhythmRider',  9, 1010, 'genre',   28],
        [1011, 103, 'RhythmRider',  8,  870, 'genre',   18],
        [1012, 103, 'RhythmRider',  7,  740, 'random',   8],
        [1013, 103, 'RhythmRider',  9,  960, 'genre',    1],

        [1014, 104, 'SonicWave',    8,  890, 'artist',  22],
        [1015, 104, 'SonicWave',    9,  970, 'artist',  12],
        [1016, 104, 'SonicWave',    7,  720, 'random',   4],

        [1017, 105, 'TuneHunter',   6,  640, 'random',  18],
        [1018, 105, 'TuneHunter',   7,  710, 'random',   9],
        [1019, 105, 'TuneHunter',   8,  800, 'genre',    2],

        [1020, 106, 'BassBomber',   5,  520, 'random',  13],
        [1021, 106, 'BassBomber',   7,  730, 'random',   7],
        [1022, 106, 'BassBomber',   8,  840, 'artist',   1],

        [1023, 107, 'ChordMaster',  8,  860, 'random',   8],
        [1024, 107, 'ChordMaster',  9,  940, 'genre',    3],

        [1025, 108, 'NoteNinja',    6,  610, 'random',   4],
        [1026, 108, 'NoteNinja',    7,  700, 'random',   1],
    ];

    $sessionStmt = $pdo->prepare('
        INSERT IGNORE INTO game_sessions
            (id, user_id, total_rounds, correct_answers, score, game_mode, status, session_started_at, session_ended_at)
        VALUES (?, ?, 10, ?, ?, ?, "completed", DATE_SUB(NOW(), INTERVAL ? DAY), DATE_SUB(NOW(), INTERVAL ? DAY))
    ');
    $lbStmt = $pdo->prepare('
        INSERT IGNORE INTO leaderboards
            (user_id, session_id, username, score, correct_answers, total_rounds, accuracy_percentage, game_mode, achieved_at)
        VALUES (?, ?, ?, ?, ?, 10, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
    ');

    foreach ($games as [$sid, $uid, $uname, $correct, $score, $mode, $daysAgo]) {
        $accuracy = ($correct / 10) * 100;
        $sessionStmt->execute([$sid, $uid, $correct, $score, $mode, $daysAgo, $daysAgo]);
        $lbStmt->execute([$uid, $sid, $uname, $score, $correct, $accuracy, $mode, $daysAgo]);
    }
    $log[] = '✅ Game sessions and leaderboard entries inserted';

    // ── 3. User statistics ────────────────────────────────────────
    $statsData = [
        [101, 5, 50, 44, 1200, 100.00, 'random',  2],
        [102, 4, 40, 37, 1100, 100.00, 'random',  3],
        [103, 4, 40, 33, 1010,  90.00, 'genre',   1],
        [104, 3, 30, 24,  970,  90.00, 'artist',  4],
        [105, 3, 30, 21,  800,  80.00, 'random',  2],
        [106, 3, 30, 20,  840,  80.00, 'random',  1],
        [107, 2, 20, 17,  940,  90.00, 'genre',   3],
        [108, 2, 20, 13,  700,  70.00, 'random',  1],
    ];

    $statsStmt = $pdo->prepare('
        INSERT INTO user_statistics
            (user_id, total_games_played, total_rounds_played, total_correct_answers,
             best_score, best_accuracy, favorite_game_mode, last_played_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? DAY))
        ON DUPLICATE KEY UPDATE
            total_games_played    = VALUES(total_games_played),
            total_rounds_played   = VALUES(total_rounds_played),
            total_correct_answers = VALUES(total_correct_answers),
            best_score            = VALUES(best_score),
            best_accuracy         = VALUES(best_accuracy),
            favorite_game_mode    = VALUES(favorite_game_mode),
            last_played_at        = VALUES(last_played_at)
    ');
    foreach ($statsData as $row) {
        $statsStmt->execute($row);
    }
    $log[] = '✅ User statistics inserted';

    // ── 4. Daily streaks ──────────────────────────────────────────
    $streaks = [
        [101, 7,  14, 0], [102, 5, 10, 0], [103, 4, 8, 0],
        [104, 3,   6, 1], [105, 2,  4, 0], [106, 3, 3, 0],
        [107, 2,   2, 1], [108, 1,  1, 0],
    ];

    $streakStmt = $pdo->prepare('
        INSERT INTO daily_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
        VALUES (?, ?, ?, ?, DATE_SUB(CURDATE(), INTERVAL ? DAY))
        ON DUPLICATE KEY UPDATE
            current_streak     = VALUES(current_streak),
            longest_streak     = VALUES(longest_streak),
            last_activity_date = VALUES(last_activity_date)
    ');
    foreach ($streaks as [$uid, $cur, $longest, $daysAgo]) {
        $streakStmt->execute([$uid, 'play_game', $cur, $longest, $daysAgo]);
        $streakStmt->execute([$uid, 'login',     $cur, $longest, $daysAgo]);
    }
    $log[] = '✅ Daily streaks inserted';

    // ── 5. Achievements ───────────────────────────────────────────
    // Map username → achievement names they should have
    $userAchievements = [
        101 => ['first_game', 'game_veteran', 'high_roller', 'perfectionist',
                'sharp_shooter', 'sniper_elite', 'perfect_game',
                'streak_starter', 'dedicated_player',
                'first_points', 'score_climber', 'score_crusher', 'consistent_performer'],
        102 => ['first_game', 'high_roller', 'perfectionist',
                'sharp_shooter', 'sniper_elite', 'perfect_game',
                'streak_starter', 'first_points', 'score_climber', 'score_crusher'],
        103 => ['first_game', 'high_roller', 'perfectionist',
                'sharp_shooter', 'sniper_elite',
                'streak_starter', 'first_points', 'score_climber'],
        104 => ['first_game', 'high_roller', 'sharp_shooter', 'sniper_elite',
                'streak_starter', 'first_points', 'score_climber'],
        105 => ['first_game', 'sharp_shooter', 'first_points', 'score_climber'],
        106 => ['first_game', 'sharp_shooter', 'first_points', 'score_climber'],
        107 => ['first_game', 'high_roller', 'sharp_shooter', 'sniper_elite', 'first_points'],
        108 => ['first_game', 'first_points'],
    ];

    $achStmt = $pdo->prepare('
        INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
        SELECT ?, id, DATE_SUB(NOW(), INTERVAL ? DAY)
        FROM achievements WHERE name = ?
    ');

    $daysAgoMap = [101 => 50, 102 => 35, 103 => 25, 104 => 20, 105 => 15, 106 => 10, 107 => 7, 108 => 3];
    foreach ($userAchievements as $uid => $names) {
        foreach ($names as $name) {
            $achStmt->execute([$uid, $daysAgoMap[$uid], $name]);
        }
    }
    $log[] = '✅ User achievements inserted';

    sendResponse([
        'success' => true,
        'message' => 'Demo data seeded successfully',
        'log'     => $log,
    ]);

} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
