-- =============================================================
-- Tunegie Demo Data Seed
-- Run AFTER setup_database.sql and achievements_streaks_schema.sql
-- Creates 8 demo users with realistic game history
-- Password for all demo users: Demo1234!
-- =============================================================

USE tunegie_db;

-- ---------------------------------------------------------------
-- 1. DEMO USERS
-- Password hash = bcrypt of "Demo1234!"
-- ---------------------------------------------------------------
INSERT IGNORE INTO users (id, username, email, password_hash, created_at) VALUES
(101, 'MelodyKing',   'melodyking@demo.tunegie',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 60 DAY)),
(102, 'BeatDropper',  'beatdropper@demo.tunegie',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(103, 'RhythmRider',  'rhythmrider@demo.tunegie',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(104, 'SonicWave',    'sonicwave@demo.tunegie',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(105, 'TuneHunter',   'tunehunter@demo.tunegie',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(106, 'BassBomber',   'bassbomber@demo.tunegie',   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(107, 'ChordMaster',  'chordmaster@demo.tunegie',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(108, 'NoteNinja',    'noteninja@demo.tunegie',    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ---------------------------------------------------------------
-- 2. GAME SESSIONS
-- ---------------------------------------------------------------
INSERT IGNORE INTO game_sessions (id, user_id, total_rounds, correct_answers, score, game_mode, status, session_started_at, session_ended_at) VALUES
-- MelodyKing (101) — top scorer, random mix
(1001, 101, 10, 10, 1200, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 55 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY)),
(1002, 101, 10,  9, 1050, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),
(1003, 101, 10,  8,  920, 'genre',   'completed', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1004, 101, 10, 10, 1180, 'artist',  'completed', DATE_SUB(NOW(), INTERVAL 5 DAY),  DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1005, 101, 10,  7,  780, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 2 DAY),  DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- BeatDropper (102) — accuracy specialist
(1006, 102, 10, 10, 1100, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 42 DAY)),
(1007, 102, 10,  9,  980, 'genre',   'completed', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(1008, 102, 10, 10, 1090, 'artist',  'completed', DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY)),
(1009, 102, 10,  8,  860, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- RhythmRider (103) — genre expert
(1010, 103, 10,  9, 1010, 'genre',   'completed', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(1011, 103, 10,  8,  870, 'genre',   'completed', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(1012, 103, 10,  7,  740, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 8 DAY),  DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1013, 103, 10,  9,  960, 'genre',   'completed', DATE_SUB(NOW(), INTERVAL 1 DAY),  DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- SonicWave (104) — artist mode fan
(1014, 104, 10,  8,  890, 'artist',  'completed', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),
(1015, 104, 10,  9,  970, 'artist',  'completed', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),
(1016, 104, 10,  7,  720, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 4 DAY),  DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- TuneHunter (105) — casual player
(1017, 105, 10,  6,  640, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),
(1018, 105, 10,  7,  710, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 9 DAY),  DATE_SUB(NOW(), INTERVAL 9 DAY)),
(1019, 105, 10,  8,  800, 'genre',   'completed', DATE_SUB(NOW(), INTERVAL 2 DAY),  DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- BassBomber (106) — improving player
(1020, 106, 10,  5,  520, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY)),
(1021, 106, 10,  7,  730, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 7 DAY),  DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1022, 106, 10,  8,  840, 'artist',  'completed', DATE_SUB(NOW(), INTERVAL 1 DAY),  DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- ChordMaster (107) — new but talented
(1023, 107, 10,  8,  860, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 8 DAY),  DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1024, 107, 10,  9,  940, 'genre',   'completed', DATE_SUB(NOW(), INTERVAL 3 DAY),  DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- NoteNinja (108) — newest player
(1025, 108, 10,  6,  610, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 4 DAY),  DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1026, 108, 10,  7,  700, 'random',  'completed', DATE_SUB(NOW(), INTERVAL 1 DAY),  DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ---------------------------------------------------------------
-- 3. LEADERBOARD ENTRIES
-- ---------------------------------------------------------------
INSERT IGNORE INTO leaderboards (user_id, session_id, username, score, correct_answers, total_rounds, accuracy_percentage, game_mode, achieved_at) VALUES
-- MelodyKing
(101, 1001, 'MelodyKing',  1200, 10, 10, 100.00, 'random',  DATE_SUB(NOW(), INTERVAL 55 DAY)),
(101, 1002, 'MelodyKing',  1050,  9, 10,  90.00, 'random',  DATE_SUB(NOW(), INTERVAL 40 DAY)),
(101, 1003, 'MelodyKing',   920,  8, 10,  80.00, 'genre',   DATE_SUB(NOW(), INTERVAL 20 DAY)),
(101, 1004, 'MelodyKing',  1180, 10, 10, 100.00, 'artist',  DATE_SUB(NOW(), INTERVAL 5 DAY)),
(101, 1005, 'MelodyKing',   780,  7, 10,  70.00, 'random',  DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- BeatDropper
(102, 1006, 'BeatDropper', 1100, 10, 10, 100.00, 'random',  DATE_SUB(NOW(), INTERVAL 42 DAY)),
(102, 1007, 'BeatDropper',  980,  9, 10,  90.00, 'genre',   DATE_SUB(NOW(), INTERVAL 28 DAY)),
(102, 1008, 'BeatDropper', 1090, 10, 10, 100.00, 'artist',  DATE_SUB(NOW(), INTERVAL 14 DAY)),
(102, 1009, 'BeatDropper',  860,  8, 10,  80.00, 'random',  DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- RhythmRider
(103, 1010, 'RhythmRider', 1010,  9, 10,  90.00, 'genre',   DATE_SUB(NOW(), INTERVAL 28 DAY)),
(103, 1011, 'RhythmRider',  870,  8, 10,  80.00, 'genre',   DATE_SUB(NOW(), INTERVAL 18 DAY)),
(103, 1012, 'RhythmRider',  740,  7, 10,  70.00, 'random',  DATE_SUB(NOW(), INTERVAL 8 DAY)),
(103, 1013, 'RhythmRider',  960,  9, 10,  90.00, 'genre',   DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- SonicWave
(104, 1014, 'SonicWave',    890,  8, 10,  80.00, 'artist',  DATE_SUB(NOW(), INTERVAL 22 DAY)),
(104, 1015, 'SonicWave',    970,  9, 10,  90.00, 'artist',  DATE_SUB(NOW(), INTERVAL 12 DAY)),
(104, 1016, 'SonicWave',    720,  7, 10,  70.00, 'random',  DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- TuneHunter
(105, 1017, 'TuneHunter',   640,  6, 10,  60.00, 'random',  DATE_SUB(NOW(), INTERVAL 18 DAY)),
(105, 1018, 'TuneHunter',   710,  7, 10,  70.00, 'random',  DATE_SUB(NOW(), INTERVAL 9 DAY)),
(105, 1019, 'TuneHunter',   800,  8, 10,  80.00, 'genre',   DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- BassBomber
(106, 1020, 'BassBomber',   520,  5, 10,  50.00, 'random',  DATE_SUB(NOW(), INTERVAL 13 DAY)),
(106, 1021, 'BassBomber',   730,  7, 10,  70.00, 'random',  DATE_SUB(NOW(), INTERVAL 7 DAY)),
(106, 1022, 'BassBomber',   840,  8, 10,  80.00, 'artist',  DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- ChordMaster
(107, 1023, 'ChordMaster',  860,  8, 10,  80.00, 'random',  DATE_SUB(NOW(), INTERVAL 8 DAY)),
(107, 1024, 'ChordMaster',  940,  9, 10,  90.00, 'genre',   DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- NoteNinja
(108, 1025, 'NoteNinja',    610,  6, 10,  60.00, 'random',  DATE_SUB(NOW(), INTERVAL 4 DAY)),
(108, 1026, 'NoteNinja',    700,  7, 10,  70.00, 'random',  DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ---------------------------------------------------------------
-- 4. USER STATISTICS
-- ---------------------------------------------------------------
INSERT INTO user_statistics (user_id, total_games_played, total_rounds_played, total_correct_answers, best_score, best_accuracy, favorite_game_mode, last_played_at)
VALUES
(101, 5, 50, 44, 1200, 100.00, 'random',  DATE_SUB(NOW(), INTERVAL 2 DAY)),
(102, 4, 40, 37, 1100, 100.00, 'random',  DATE_SUB(NOW(), INTERVAL 3 DAY)),
(103, 4, 40, 33, 1010,  90.00, 'genre',   DATE_SUB(NOW(), INTERVAL 1 DAY)),
(104, 3, 30, 24,  970,  90.00, 'artist',  DATE_SUB(NOW(), INTERVAL 4 DAY)),
(105, 3, 30, 21,  800,  80.00, 'random',  DATE_SUB(NOW(), INTERVAL 2 DAY)),
(106, 3, 30, 20,  840,  80.00, 'random',  DATE_SUB(NOW(), INTERVAL 1 DAY)),
(107, 2, 20, 17,  940,  90.00, 'genre',   DATE_SUB(NOW(), INTERVAL 3 DAY)),
(108, 2, 20, 13,  700,  70.00, 'random',  DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE
  total_games_played    = VALUES(total_games_played),
  total_rounds_played   = VALUES(total_rounds_played),
  total_correct_answers = VALUES(total_correct_answers),
  best_score            = VALUES(best_score),
  best_accuracy         = VALUES(best_accuracy),
  favorite_game_mode    = VALUES(favorite_game_mode),
  last_played_at        = VALUES(last_played_at);

-- ---------------------------------------------------------------
-- 5. DAILY STREAKS
-- ---------------------------------------------------------------
INSERT INTO daily_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
VALUES
(101, 'play_game', 7,  14, CURDATE()),
(101, 'login',     7,  14, CURDATE()),
(102, 'play_game', 5,  10, CURDATE()),
(102, 'login',     5,  10, CURDATE()),
(103, 'play_game', 4,   8, CURDATE()),
(103, 'login',     4,   8, CURDATE()),
(104, 'play_game', 3,   6, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(104, 'login',     3,   6, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(105, 'play_game', 2,   4, CURDATE()),
(105, 'login',     2,   4, CURDATE()),
(106, 'play_game', 3,   3, CURDATE()),
(106, 'login',     3,   3, CURDATE()),
(107, 'play_game', 2,   2, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(107, 'login',     2,   2, DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(108, 'play_game', 1,   1, CURDATE()),
(108, 'login',     1,   1, CURDATE())
ON DUPLICATE KEY UPDATE
  current_streak     = VALUES(current_streak),
  longest_streak     = VALUES(longest_streak),
  last_activity_date = VALUES(last_activity_date);

-- ---------------------------------------------------------------
-- 6. USER ACHIEVEMENTS
-- Award achievements based on each user's stats
-- ---------------------------------------------------------------

-- MelodyKing: 5 games, best score 1200, 100% accuracy, 7-day streak
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 101, id, DATE_SUB(NOW(), INTERVAL 50 DAY) FROM achievements
WHERE name IN ('first_game', 'game_veteran', 'high_roller', 'perfectionist', 'sharp_shooter',
               'sniper_elite', 'perfect_game', 'streak_starter', 'dedicated_player',
               'first_points', 'score_climber', 'score_crusher', 'consistent_performer');

-- BeatDropper: 4 games, best score 1100, 100% accuracy, 5-day streak
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 102, id, DATE_SUB(NOW(), INTERVAL 35 DAY) FROM achievements
WHERE name IN ('first_game', 'high_roller', 'perfectionist', 'sharp_shooter',
               'sniper_elite', 'perfect_game', 'streak_starter',
               'first_points', 'score_climber', 'score_crusher');

-- RhythmRider: 4 games, best score 1010, 90% accuracy, 4-day streak
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 103, id, DATE_SUB(NOW(), INTERVAL 25 DAY) FROM achievements
WHERE name IN ('first_game', 'high_roller', 'perfectionist', 'sharp_shooter',
               'sniper_elite', 'streak_starter', 'first_points', 'score_climber');

-- SonicWave: 3 games, best score 970, 90% accuracy, 3-day streak
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 104, id, DATE_SUB(NOW(), INTERVAL 20 DAY) FROM achievements
WHERE name IN ('first_game', 'high_roller', 'sharp_shooter', 'sniper_elite',
               'streak_starter', 'first_points', 'score_climber');

-- TuneHunter: 3 games, best score 800, 80% accuracy
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 105, id, DATE_SUB(NOW(), INTERVAL 15 DAY) FROM achievements
WHERE name IN ('first_game', 'sharp_shooter', 'first_points', 'score_climber');

-- BassBomber: 3 games, best score 840, 80% accuracy
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 106, id, DATE_SUB(NOW(), INTERVAL 10 DAY) FROM achievements
WHERE name IN ('first_game', 'sharp_shooter', 'first_points', 'score_climber');

-- ChordMaster: 2 games, best score 940, 90% accuracy
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 107, id, DATE_SUB(NOW(), INTERVAL 7 DAY) FROM achievements
WHERE name IN ('first_game', 'high_roller', 'sharp_shooter', 'sniper_elite', 'first_points');

-- NoteNinja: 2 games, best score 700, 70% accuracy
INSERT IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
SELECT 108, id, DATE_SUB(NOW(), INTERVAL 3 DAY) FROM achievements
WHERE name IN ('first_game', 'first_points');
