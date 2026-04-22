<?php
require_once __DIR__ . '/middleware/cors.php';

// Serve uploaded profile pictures
// DB stores paths like: uploads/profile_pictures/profile_1_123456.jpg
// Files are physically at: backend/php/api/uploads/profile_pictures/...

$path = isset($_GET['path']) ? $_GET['path'] : '';

// Normalize: strip leading slashes
$path = ltrim($path, '/\\');

// Security: only allow uploads/profile_pictures/* with image extensions
if (!preg_match('/^uploads\/profile_pictures\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|gif|webp)$/i', $path)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid image path']);
    exit;
}

// Files are stored under api/ directory
$fullPath = __DIR__ . '/api/' . $path;

// Resolve real path to prevent traversal
$realPath = realpath($fullPath);
$baseDir  = realpath(__DIR__ . '/api/uploads');

if (!$realPath || !$baseDir || strpos($realPath, $baseDir) !== 0) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Access denied']);
    exit;
}

if (!file_exists($realPath) || !is_file($realPath)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Image not found']);
    exit;
}

$ext = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
$contentTypes = [
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
];

$contentType = $contentTypes[$ext] ?? 'application/octet-stream';

header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($realPath));
header('Cache-Control: public, max-age=31536000');
header('X-Content-Type-Options: nosniff');

readfile($realPath);
exit;
