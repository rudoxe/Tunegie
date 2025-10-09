<?php
// Script to add is_private column to users table
require_once __DIR__ . '/../../config/config.php';

try {
    $pdo = getDbConnection();
    
    echo "Adding is_private column to users table...\n";
    
    // Check if column already exists
    $stmt = $pdo->prepare("SHOW COLUMNS FROM users LIKE 'is_private'");
    $stmt->execute();
    
    if ($stmt->rowCount() == 0) {
        // Column doesn't exist, add it
        $pdo->exec("ALTER TABLE users ADD COLUMN is_private BOOLEAN DEFAULT FALSE");
        echo "✓ is_private column added successfully\n";
    } else {
        echo "✓ is_private column already exists\n";
    }
    
    echo "Database update completed!\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>