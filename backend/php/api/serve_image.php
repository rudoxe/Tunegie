<?php
// Serve uploaded images (profile pictures, etc.)
require_once __DIR__ . '/../middleware/cors.php';

// Get the requested image path
$imagePath = $_GET['path'] ?? '';

if (empty($imagePath)) {
    http_response_code(400);
    echo json_encode(['error' => 'No image path provided']);
    exit;
}

// Build the full file path
$fullPath = __DIR__ . '/' . $imagePath;

// Security: Prevent directory traversal attacks
$realPath = realpath($fullPath);
$baseDir = realpath(__DIR__);

if (!$realPath || strpos($realPath, $baseDir) !== 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid image path']);
    exit;
}

// Check if file exists
if (!file_exists($realPath) || !is_file($realPath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Image not found']);
    exit;
}

// Get file extension and set content type
$ext = strtolower(pathinfo($realPath, PATHINFO_EXTENSION));
$contentTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp'
];

$contentType = $contentTypes[$ext] ?? 'application/octet-stream';

// Set headers
header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($realPath));
header('Cache-Control: public, max-age=31536000'); // Cache for 1 year

// Output the file
readfile($realPath);
exit;
?>
