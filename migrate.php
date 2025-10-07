<?php
// Database migration script for Railway deployment
echo "🚀 Starting database migration...\n";

// Railway provides these environment variables
$host = $_ENV['MYSQLHOST'] ?? 'localhost';
$port = $_ENV['MYSQLPORT'] ?? '3306';
$database = $_ENV['MYSQLDATABASE'] ?? 'tunegie_db';
$username = $_ENV['MYSQLUSER'] ?? 'root';
$password = $_ENV['MYSQLPASSWORD'] ?? '';

try {
    // Connect to MySQL
    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    
    echo "✅ Connected to database: {$database}\n";
    
    // Read and execute main database schema
    $mainSchema = file_get_contents(__DIR__ . '/api/db/setup_database.sql');
    if ($mainSchema) {
        // Remove USE database statements
        $mainSchema = preg_replace('/^USE\s+\w+;\s*$/m', '', $mainSchema);
        
        // Execute schema
        $pdo->exec($mainSchema);
        echo "✅ Main database schema created\n";
    }
    
    // Read and execute achievements schema
    $achievementsSchema = file_get_contents(__DIR__ . '/api/db/achievements_streaks_schema.sql');
    if ($achievementsSchema) {
        // Remove USE database statements
        $achievementsSchema = preg_replace('/^USE\s+\w+;\s*$/m', '', $achievementsSchema);
        
        // Split into individual statements and execute
        $statements = array_filter(
            array_map('trim', explode(';', $achievementsSchema)),
            function($stmt) { return !empty($stmt); }
        );
        
        foreach ($statements as $statement) {
            if (!empty(trim($statement))) {
                try {
                    $pdo->exec($statement);
                } catch (PDOException $e) {
                    // Ignore "already exists" errors
                    if (strpos($e->getMessage(), 'already exists') === false && 
                        strpos($e->getMessage(), 'Duplicate entry') === false) {
                        throw $e;
                    }
                }
            }
        }
        echo "✅ Achievements system schema created\n";
    }
    
    // Verify tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "✅ Database tables: " . implode(', ', $tables) . "\n";
    
    echo "🎉 Database migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>