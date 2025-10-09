<?php
// Include CORS handling
require_once __DIR__ . '/../../middleware/cors.php';

// Set JSON header
header('Content-Type: application/json');

// Return simple test response
echo json_encode([
    'success' => true,
    'message' => 'CORS test successful',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'http_host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'server_port' => $_SERVER['SERVER_PORT'] ?? 'unknown',
        'request_method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none'
    ]
]);
?>