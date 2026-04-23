<?php
// Simple health check endpoint — no external dependencies
require_once __DIR__ . '/../middleware/cors.php';
header('Content-Type: application/json');
http_response_code(200);
echo json_encode(['status' => 'ok']);
exit;
