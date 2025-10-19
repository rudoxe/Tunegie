-- Achievement and Streak System Schema
USE tunegie_db;

-- Achievements table - defines all possible achievements
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) DEFAULT NULL,
    category ENUM('gameplay', 'scoring', 'consistency', 'special', 'streak') DEFAULT 'gameplay',
    condition_type ENUM('total_games', 'total_score', 'best_score', 'accuracy', 'streak_days', 'consecutive_wins', 'total_rounds') NOT NULL,
    condition_value INT NOT NULL,
    points_reward INT DEFAULT 0,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements - tracks which achievements each user has unlocked
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_value INT DEFAULT 0, -- current progress towards achievement
    is_completed BOOLEAN DEFAULT FALSE,
    notified BOOLEAN DEFAULT FALSE, -- whether user has been notified of unlock
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_achievements (user_id),
    INDEX idx_achievement_progress (achievement_id, is_completed)
);

-- Daily streaks table - tracks login/play streaks for each user
CREATE TABLE IF NOT EXISTS daily_streaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE DEFAULT NULL,
    streak_type ENUM('login', 'play_game') DEFAULT 'play_game',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_streak_type (user_id, streak_type),
    INDEX idx_user_streaks (user_id),
    INDEX idx_streak_date (last_activity_date)
);

-- Achievement progress tracking for complex achievements
CREATE TABLE IF NOT EXISTS achievement_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    progress_value INT DEFAULT 0,
    target_value INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement_progress (user_id, achievement_id),
    INDEX idx_user_progress (user_id),
    INDEX idx_achievement_progress_value (achievement_id, progress_value)
);

-- Insert default achievements
INSERT IGNORE INTO achievements (name, title, description, category, condition_type, condition_value, points_reward) VALUES
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
('endurance_champion', 'Endurance Champion', 'Play 500 rounds total', 'consistency', 'total_rounds', 500, 200);