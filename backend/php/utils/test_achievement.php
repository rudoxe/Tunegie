<?php
// Simple test to add achievements
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tunegie_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful\n";
    
    // Create achievements table
    $pdo->exec("
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    
    // Create user_achievements table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_achievements (
            id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            achievement_id INT NOT NULL,
            earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notified BOOLEAN DEFAULT FALSE,
            UNIQUE KEY unique_user_achievement (user_id, achievement_id)
        )
    ");
    
    echo "✅ Tables created\n";
    
    // Insert a test achievement
    $stmt = $pdo->prepare("
        INSERT IGNORE INTO achievements 
        (name, description, icon, color, category, condition_type, condition_value, points) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        'First Steps',
        'Play your first game of Tunegie!',
        '🎯',
        'green',
        'Getting Started',
        'total_games',
        1,
        50
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo "✅ Added test achievement\n";
    } else {
        echo "ℹ️ Achievement already exists\n";
    }
    
    // Check current achievements
    $count = $pdo->query("SELECT COUNT(*) FROM achievements")->fetchColumn();
    echo "📊 Total achievements: $count\n";
    
    if ($count == 0) {
        echo "❌ No achievements found - something went wrong\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>