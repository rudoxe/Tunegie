<?php
// Test script to simulate achievements API call
// Simulate a POST request with JSON data

// Set up the request simulation
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Create a test token (you would normally use a real token from the database)
$testToken = 'test_token_12345';

// Simulate the JSON input
$jsonInput = json_encode(['token' => $testToken]);

// Mock the php://input stream
$_POST = [];
file_put_contents('php://memory', $jsonInput);

// Capture output
ob_start();

try {
    // Include the achievements API
    include 'api/user/achievements.php';
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

$output = ob_get_clean();
echo $output;
?>