<?php
require_once __DIR__ . '/../config/config.php';

$pdo = getDbConnection();

// Create achievements table if it doesn't exist
$createTableSQL = "
CREATE TABLE IF NOT EXISTS achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) DEFAULT '🏆',
    color VARCHAR(20) DEFAULT 'gold',
    category VARCHAR(50) NOT NULL,
    condition_type VARCHAR(50) NOT NULL,
    condition_value INT NOT NULL,
    points INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($createTableSQL);
    echo "✅ Achievements table created/verified\n";
} catch (PDOException $e) {
    echo "❌ Error creating achievements table: " . $e->getMessage() . "\n";
    exit(1);
}

// Create user_achievements table if it doesn't exist
$createUserAchievementsSQL = "
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notified BOOLEAN DEFAULT FALSE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
)";

try {
    $pdo->exec($createUserAchievementsSQL);
    echo "✅ User achievements table created/verified\n";
} catch (PDOException $e) {
    echo "❌ Error creating user_achievements table: " . $e->getMessage() . "\n";
    exit(1);
}

// Sample achievements data
$achievements = [
    // First Steps Category
    [
        'name' => 'First Steps',
        'description' => 'Play your first game of Tunegie!',
        'icon' => '🎯',
        'color' => 'green',
        'category' => 'Getting Started',
        'condition_type' => 'total_games',
        'condition_value' => 1,
        'points' => 50
    ],
    [
        'name' => 'Getting Started',
        'description' => 'Complete 5 games to get familiar with Tunegie',
        'icon' => '🎮',
        'color' => 'blue',
        'category' => 'Getting Started',
        'condition_type' => 'total_games',
        'condition_value' => 5,
        'points' => 100
    ],
    [
        'name' => 'Music Explorer',
        'description' => 'Play 10 games and explore the world of music',
        'icon' => '🎵',
        'color' => 'purple',
        'category' => 'Getting Started',
        'condition_type' => 'total_games',
        'condition_value' => 10,
        'points' => 200
    ],
    
    // Score-based achievements
    [
        'name' => 'First Victory',
        'description' => 'Score your first 100 points in a game',
        'icon' => '🎉',
        'color' => 'green',
        'category' => 'Scoring',
        'condition_type' => 'best_score',
        'condition_value' => 100,
        'points' => 75
    ],
    [
        'name' => 'Rising Star',
        'description' => 'Achieve a score of 500 points in a single game',
        'icon' => '⭐',
        'color' => 'blue',
        'category' => 'Scoring',
        'condition_type' => 'best_score',
        'condition_value' => 500,
        'points' => 150
    ],
    [
        'name' => 'Music Master',
        'description' => 'Score 1000 points in a single game - impressive!',
        'icon' => '🎖️',
        'color' => 'gold',
        'category' => 'Scoring',
        'condition_type' => 'best_score',
        'condition_value' => 1000,
        'points' => 300
    ],
    [
        'name' => 'Legend',
        'description' => 'Achieve the legendary score of 1500 points',
        'icon' => '👑',
        'color' => 'purple',
        'category' => 'Scoring',
        'condition_type' => 'best_score',
        'condition_value' => 1500,
        'points' => 500
    ],
    
    // Cumulative achievements
    [
        'name' => 'Point Collector',
        'description' => 'Accumulate 1,000 total points across all games',
        'icon' => '💎',
        'color' => 'blue',
        'category' => 'Progression',
        'condition_type' => 'total_score',
        'condition_value' => 1000,
        'points' => 200
    ],
    [
        'name' => 'Score Hunter',
        'description' => 'Accumulate 5,000 total points - you\'re dedicated!',
        'icon' => '🏹',
        'color' => 'purple',
        'category' => 'Progression',
        'condition_type' => 'total_score',
        'condition_value' => 5000,
        'points' => 400
    ],
    [
        'name' => 'Point Master',
        'description' => 'Reach an incredible 10,000 total points',
        'icon' => '💰',
        'color' => 'gold',
        'category' => 'Progression',
        'condition_type' => 'total_score',
        'condition_value' => 10000,
        'points' => 750
    ],
    
    // Dedication achievements
    [
        'name' => 'Regular Player',
        'description' => 'Play games for 3 consecutive days',
        'icon' => '📅',
        'color' => 'green',
        'category' => 'Dedication',
        'condition_type' => 'streak_days',
        'condition_value' => 3,
        'points' => 150
    ],
    [
        'name' => 'Devoted Fan',
        'description' => 'Maintain a 7-day playing streak',
        'icon' => '🔥',
        'color' => 'red',
        'category' => 'Dedication',
        'condition_type' => 'streak_days',
        'condition_value' => 7,
        'points' => 300
    ],
    [
        'name' => 'Music Addict',
        'description' => 'Play for 14 consecutive days - you love music!',
        'icon' => '❤️',
        'color' => 'red',
        'category' => 'Dedication',
        'condition_type' => 'streak_days',
        'condition_value' => 14,
        'points' => 500
    ],
    [
        'name' => 'Unstoppable',
        'description' => 'Maintain a 30-day streak - incredible dedication!',
        'icon' => '🚀',
        'color' => 'purple',
        'category' => 'Dedication',
        'condition_type' => 'streak_days',
        'condition_value' => 30,
        'points' => 1000
    ],
    
    // Volume achievements
    [
        'name' => 'Casual Gamer',
        'description' => 'Complete 25 games total',
        'icon' => '🎲',
        'color' => 'blue',
        'category' => 'Volume',
        'condition_type' => 'total_games',
        'condition_value' => 25,
        'points' => 250
    ],
    [
        'name' => 'Frequent Player',
        'description' => 'Complete 50 games - you\'re getting serious!',
        'icon' => '🎯',
        'color' => 'purple',
        'category' => 'Volume',
        'condition_type' => 'total_games',
        'condition_value' => 50,
        'points' => 400
    ],
    [
        'name' => 'Game Enthusiast',
        'description' => 'Reach the milestone of 100 completed games',
        'icon' => '🏆',
        'color' => 'gold',
        'category' => 'Volume',
        'condition_type' => 'total_games',
        'condition_value' => 100,
        'points' => 600
    ],
    [
        'name' => 'Marathon Player',
        'description' => 'Complete an amazing 200 games',
        'icon' => '🏃',
        'color' => 'red',
        'category' => 'Volume',
        'condition_type' => 'total_games',
        'condition_value' => 200,
        'points' => 800
    ],
    
    // Experience achievements
    [
        'name' => 'Question Crusher',
        'description' => 'Answer 100 questions correctly across all games',
        'icon' => '💪',
        'color' => 'blue',
        'category' => 'Experience',
        'condition_type' => 'total_rounds',
        'condition_value' => 100,
        'points' => 200
    ],
    [
        'name' => 'Quiz Master',
        'description' => 'Answer 500 questions - you know your music!',
        'icon' => '🧠',
        'color' => 'purple',
        'category' => 'Experience',
        'condition_type' => 'total_rounds',
        'condition_value' => 500,
        'points' => 400
    ],
    [
        'name' => 'Knowledge Bank',
        'description' => 'Answer an incredible 1,000 questions',
        'icon' => '📚',
        'color' => 'gold',
        'category' => 'Experience',
        'condition_type' => 'total_rounds',
        'condition_value' => 1000,
        'points' => 600
    ]
];

// Insert achievements - adapt to existing table structure
$stmt = $pdo->prepare("
    INSERT IGNORE INTO achievements 
    (name, title, description, icon, color, category, condition_type, condition_value, points) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$inserted = 0;
foreach ($achievements as $achievement) {
    try {
        $stmt->execute([
            $achievement['name'], // name field
            $achievement['name'], // title field (same as name)
            $achievement['description'], 
            $achievement['icon'],
            $achievement['color'],
            $achievement['category'],
            $achievement['condition_type'],
            $achievement['condition_value'],
            $achievement['points']
        ]);
        if ($stmt->rowCount() > 0) {
            $inserted++;
            echo "✅ Added achievement: {$achievement['name']}\n";
        }
    } catch (PDOException $e) {
        echo "❌ Error adding achievement {$achievement['name']}: " . $e->getMessage() . "\n";
    }
}

echo "\n🎉 Achievement setup complete! Added {$inserted} new achievements.\n";
echo "📊 Total achievements in database: " . $pdo->query("SELECT COUNT(*) FROM achievements")->fetchColumn() . "\n";
?>