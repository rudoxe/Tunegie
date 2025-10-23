<?php
require_once __DIR__ . '/middleware/cors.php';

// Robust image serving endpoint for profile pictures
$path = isset($_GET['path']) ? $_GET['path'] : '';

// Normalize path (strip leading slash if present)
$path = ltrim($path, '/\\');

// Security: only allow uploads/profile_pictures/* with supported extensions
if (!preg_match('/^uploads\/profile_pictures\/[^\/]+\.(jpg|jpeg|png|gif|webp)$/i', $path)) {
    http_response_code(400);
    exit('Invalid path');
}

// Build full path (do not rely on realpath so we can return 404 for missing files)
$fullPath = __DIR__ . '/api/' . $path;

if (!file_exists($fullPath) || !is_file($fullPath)) {
    http_response_code(404);
    exit('File not found');
}

$fileInfo = pathinfo($fullPath);
$extension = strtolower($fileInfo['extension'] ?? '');

// Set appropriate content type
switch ($extension) {
    case 'jpg':
    case 'jpeg':
        $contentType = 'image/jpeg';
        break;
    case 'png':
        $contentType = 'image/png';
        break;
    case 'gif':
        $contentType = 'image/gif';
        break;
    case 'webp':
        $contentType = 'image/webp';
        break;
    default:
        http_response_code(400);
        exit('Unsupported file type');
}

header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($fullPath));
header('Cache-Control: public, max-age=31536000'); // Cache for 1 year

readfile($fullPath);
?>

