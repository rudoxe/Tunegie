<?php
// Test script to debug score saving
require_once 'api/config.php';

// Get a user ID from the database
$pdo = getDbConnection();
$stmt = $pdo->query('SELECT id, username FROM users LIMIT 1');
$user = $stmt->fetch();

if (!$user) {
    echo "❌ No users found. Please register a user first.\n";
    exit;
}

echo "✅ Testing with user: {$user['username']} (ID: {$user['id']})\n";

// Generate test JWT token
$testToken = generateJWT($user['id'], 'test@example.com');
echo "✅ Generated test JWT token\n";

// Test payload
$payload = [
    'total_rounds' => 5,
    'correct_answers' => 3,
    'score' => 350,
    'game_mode' => 'standard',
    'rounds' => [
        [
            'track_id' => '1',
            'track_title' => 'Test Song',
            'track_artist' => 'Test Artist',
            'album_title' => 'Test Album',
            'user_guess' => 'Test Album',
            'is_correct' => true,
            'time_taken' => 5,
            'points_earned' => 100
        ]
    ]
];

echo "✅ Test payload created:\n";
echo json_encode($payload, JSON_PRETTY_PRINT) . "\n\n";

// Simulate the API call
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_AUTHORIZATION'] = "Bearer $testToken";

// Set the input
$jsonData = json_encode($payload);
file_put_contents('php://temp', $jsonData);

echo "✅ Testing save_score.php directly...\n";

try {
    // Capture output
    ob_start();
    include 'api/save_score.php';
    $output = ob_get_clean();
    
    echo "✅ Response: $output\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
