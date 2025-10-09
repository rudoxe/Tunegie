<?php
// Simple router for Railway deployment
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Health check for Railway
if ($path === '/' || $path === '/health') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'ok',
        'message' => 'Tunegie API is running',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0'
    ]);
    exit;
}

// API routes
if (strpos($path, '/api/') === 0) {
    $apiPath = substr($path, 5); // Remove '/api/' prefix
    $phpFile = __DIR__ . '/backend/php/api/' . $apiPath;
    
    // Add .php extension if not present
    if (!pathinfo($apiPath, PATHINFO_EXTENSION)) {
        $phpFile .= '.php';
    }
    
    if (file_exists($phpFile)) {
        require $phpFile;
        exit;
    }
}

// Serve static files for React build
if (file_exists(__DIR__ . '/frontend/build' . $path)) {
    $file = __DIR__ . '/frontend/build' . $path;
    $mimeType = mime_content_type($file);
    header('Content-Type: ' . $mimeType);
    readfile($file);
    exit;
}

// Serve React app for all other routes (SPA routing)
if (file_exists(__DIR__ . '/frontend/build/index.html')) {
    header('Content-Type: text/html');
    readfile(__DIR__ . '/frontend/build/index.html');
    exit;
}

// 404 if nothing matches
http_response_code(404);
header('Content-Type: application/json');
echo json_encode([
    'error' => 'Not Found',
    'path' => $path,
    'message' => 'The requested resource was not found'
]);
?>