<?php
try {
    $pdo = new PDO('mysql:host=localhost;dbname=tunegie_db', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful\n";
    
    // Check if achievements table exists and get its structure
    $result = $pdo->query("DESCRIBE achievements");
    if ($result) {
        echo "📋 Current achievements table structure:\n";
        while ($row = $result->fetch()) {
            echo "  - {$row['Field']} ({$row['Type']})\n";
        }
        
        // Add missing columns if they don't exist
        $columns = $pdo->query("SHOW COLUMNS FROM achievements")->fetchAll(PDO::FETCH_COLUMN);
        
        if (!in_array('icon', $columns)) {
            $pdo->exec("ALTER TABLE achievements ADD COLUMN icon VARCHAR(10) DEFAULT '🏆'");
            echo "✅ Added icon column\n";
        }
        
        if (!in_array('color', $columns)) {
            $pdo->exec("ALTER TABLE achievements ADD COLUMN color VARCHAR(20) DEFAULT 'gold'");
            echo "✅ Added color column\n";
        }
        
        if (!in_array('points', $columns)) {
            $pdo->exec("ALTER TABLE achievements ADD COLUMN points INT DEFAULT 100");
            echo "✅ Added points column\n";
        }
        
    } else {
        echo "❌ Achievements table does not exist\n";
        
        // Create the table with all needed columns
        $pdo->exec("
            CREATE TABLE achievements (
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
        echo "✅ Created achievements table\n";
    }
    
    // Now try to add a test achievement
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
    
    // Show current achievements
    $achievements = $pdo->query("SELECT * FROM achievements LIMIT 5")->fetchAll();
    echo "📊 Current achievements:\n";
    foreach ($achievements as $achievement) {
        echo "  - {$achievement['name']} ({$achievement['points']} points)\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
