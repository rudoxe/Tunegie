<?php
// Simple image serving endpoint for profile pictures
$path = isset($_GET['path']) ? $_GET['path'] : '';
$fullPath = __DIR__ . '/../' . $path;

// Security check: ensure path is within uploads directory
$realPath = realpath($fullPath);
$uploadsPath = realpath(__DIR__ . '/../uploads/');

if (!$realPath || !$uploadsPath || strpos($realPath, $uploadsPath) !== 0) {
    http_response_code(403);
    exit('Forbidden');
}

if (!file_exists($fullPath)) {
    http_response_code(404);
    exit('File not found');
}

$fileInfo = pathinfo($fullPath);
$extension = strtolower($fileInfo['extension']);

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
    default:
        http_response_code(400);
        exit('Unsupported file type');
}

header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($fullPath));
header('Cache-Control: public, max-age=31536000'); // Cache for 1 year

readfile($fullPath);

