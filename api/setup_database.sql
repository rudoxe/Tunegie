-- Create database
CREATE DATABASE IF NOT EXISTS tunegie_db;
USE tunegie_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Game sessions table for tracking individual game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_ended_at TIMESTAMP NULL,
    total_rounds INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    score INT DEFAULT 0,
    game_mode VARCHAR(50) DEFAULT 'standard',
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Game rounds table for tracking individual rounds within sessions
CREATE TABLE IF NOT EXISTS game_rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    round_number INT NOT NULL,
    track_id VARCHAR(100) NOT NULL,
    track_title VARCHAR(255),
    track_artist VARCHAR(255),
    album_title VARCHAR(255),
    user_guess VARCHAR(255),
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken_seconds INT DEFAULT 0,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
);

-- Leaderboards table for high scores
CREATE TABLE IF NOT EXISTS leaderboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    username VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    correct_answers INT NOT NULL,
    total_rounds INT NOT NULL,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0.00,
    game_mode VARCHAR(50) DEFAULT 'standard',
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    INDEX idx_score (score DESC),
    INDEX idx_accuracy (accuracy_percentage DESC),
    INDEX idx_game_mode (game_mode),
    INDEX idx_achieved_at (achieved_at DESC)
);

-- User statistics table for overall player stats
CREATE TABLE IF NOT EXISTS user_statistics (
    user_id INT PRIMARY KEY,
    total_games_played INT DEFAULT 0,
    total_rounds_played INT DEFAULT 0,
    total_correct_answers INT DEFAULT 0,
    best_score INT DEFAULT 0,
    best_accuracy DECIMAL(5,2) DEFAULT 0.00,
    total_time_played_seconds INT DEFAULT 0,
    favorite_game_mode VARCHAR(50) DEFAULT 'standard',
    last_played_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data for testing (optional)
-- INSERT INTO users (username, email, password_hash) VALUES 
-- ('testuser', 'test@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: "password"
