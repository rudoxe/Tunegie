<?php
require_once __DIR__ . '/../../config/config.php';

try {
    $pdo = getDbConnection();
    
    // Add profile_picture column if it doesn't exist
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'profile_picture'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL AFTER password_hash");
        echo "Successfully added profile_picture column to users table.\n";
    } else {
        echo "profile_picture column already exists in users table.\n";
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
