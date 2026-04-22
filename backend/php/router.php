<?php
// Router for PHP built-in server (Railway deployment)
// .htaccess doesn't work with php -S, so this handles all routing

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = urldecode($uri);

// Serve static files that exist on disk directly (images, css, etc.)
if ($uri !== '/' && file_exists(__DIR__ . $uri) && !is_dir(__DIR__ . $uri)) {
    return false; // Let PHP built-in server handle it
}

// Route /serve_image.php (profile picture serving)
if (strpos($uri, '/serve_image.php') === 0) {
    require __DIR__ . '/serve_image.php';
    exit;
}

// Route /api/* requests
if (strpos($uri, '/api/') === 0) {
    // Try exact path (URL already has .php extension)
    $exactFile = __DIR__ . $uri;
    if (file_exists($exactFile) && is_file($exactFile)) {
        require $exactFile;
        exit;
    }

    // Try appending .php (URL without extension)
    $fileWithExt = __DIR__ . rtrim($uri, '/') . '.php';
    if (file_exists($fileWithExt) && is_file($fileWithExt)) {
        require $fileWithExt;
        exit;
    }

    // Try index.php in directory
    $indexFile = __DIR__ . rtrim($uri, '/') . '/index.php';
    if (file_exists($indexFile)) {
        require $indexFile;
        exit;
    }
}

// 404
http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Not found', 'path' => $uri]);
exit;
