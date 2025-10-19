-- Migration script to fix achievements and streaks system
-- Run this to update existing database with fixes

USE tunegie_db;

-- Add earned_at column to user_achievements if it doesn't exist
ALTER TABLE user_achievements 
ADD COLUMN IF NOT EXISTS earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER achievement_id;

-- Update existing records to have earned_at same as unlocked_at
UPDATE user_achievements 
SET earned_at = unlocked_at 
WHERE earned_at IS NULL;

-- Ensure all streak records have proper defaults
UPDATE daily_streaks 
SET current_streak = COALESCE(current_streak, 0),
    longest_streak = COALESCE(longest_streak, 0)
WHERE current_streak IS NULL OR longest_streak IS NULL;

-- Add missing index if not exists
CREATE INDEX IF NOT EXISTS idx_achievement_earned_at ON user_achievements(earned_at DESC);

-- Insert or update default achievements with correct schema
INSERT INTO achievements (name, title, description, category, condition_type, condition_value, points_reward) VALUES
-- Gameplay achievements
('first_game', 'First Steps', 'Complete your first game', 'gameplay', 'total_games', 1, 10),
('game_veteran', 'Game Veteran', 'Play 10 games', 'gameplay', 'total_games', 10, 25),
('game_master', 'Game Master', 'Play 50 games', 'gameplay', 'total_games', 50, 100),
('game_legend', 'Game Legend', 'Play 100 games', 'gameplay', 'total_games', 100, 250),

-- Scoring achievements  
('first_points', 'Score Settler', 'Score your first points', 'scoring', 'total_score', 1, 5),
('score_climber', 'Score Climber', 'Reach 1000 total points', 'scoring', 'total_score', 1000, 50),
('score_crusher', 'Score Crusher', 'Reach 5000 total points', 'scoring', 'total_score', 5000, 150),
('high_roller', 'High Roller', 'Score 500 points in a single game', 'scoring', 'best_score', 500, 75),
('perfectionist', 'Perfectionist', 'Score 1000 points in a single game', 'scoring', 'best_score', 1000, 200),

-- Accuracy achievements
('sharp_shooter', 'Sharp Shooter', 'Achieve 80% accuracy in a game', 'scoring', 'accuracy', 80, 30),
('sniper_elite', 'Sniper Elite', 'Achieve 90% accuracy in a game', 'scoring', 'accuracy', 90, 75),
('perfect_game', 'Perfect Game', 'Achieve 100% accuracy in a game', 'scoring', 'accuracy', 100, 150),

-- Streak achievements
('streak_starter', 'Streak Starter', 'Maintain a 3-day play streak', 'streak', 'streak_days', 3, 20),
('dedicated_player', 'Dedicated Player', 'Maintain a 7-day play streak', 'streak', 'streak_days', 7, 50),
('streak_warrior', 'Streak Warrior', 'Maintain a 14-day play streak', 'streak', 'streak_days', 14, 100),
('unstoppable', 'Unstoppable', 'Maintain a 30-day play streak', 'streak', 'streak_days', 30, 300),

-- Consistency achievements
('consistent_performer', 'Consistent Performer', 'Play 50 rounds total', 'consistency', 'total_rounds', 50, 40),
('round_master', 'Round Master', 'Play 200 rounds total', 'consistency', 'total_rounds', 200, 80),
('endurance_champion', 'Endurance Champion', 'Play 500 rounds total', 'consistency', 'total_rounds', 500, 200)

ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    category = VALUES(category),
    condition_type = VALUES(condition_type),
    condition_value = VALUES(condition_value),
    points_reward = VALUES(points_reward);

-- Clean up any incomplete user statistics
UPDATE user_statistics 
SET total_games_played = COALESCE(total_games_played, 0),
    total_rounds_played = COALESCE(total_rounds_played, 0),
    total_correct_answers = COALESCE(total_correct_answers, 0),
    best_score = COALESCE(best_score, 0),
    best_accuracy = COALESCE(best_accuracy, 0.00)
WHERE total_games_played IS NULL 
   OR total_rounds_played IS NULL 
   OR total_correct_answers IS NULL
   OR best_score IS NULL 
   OR best_accuracy IS NULL;

-- Add missing user private column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT FALSE AFTER profile_picture;

COMMIT;