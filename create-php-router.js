const fs = require('fs');
const path = require('path');

const phpRouter = `<?php
// Railway deployment router - serves React app and handles API routes

$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Handle API routes
if (strpos($path, '/api/') === 0) {
    // Remove /api prefix and route to appropriate PHP file
    $apiPath = substr($path, 4); // Remove '/api'
    
    if ($apiPath === '/' || $apiPath === '') {
        // API status endpoint
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'ok',
            'message' => 'Tunegie API is running',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ]);
        exit;
    }
    
    // Route to specific API endpoints - use absolute path from project root
    // Handle both with and without .php extension
    $cleanPath = $apiPath;
    if (substr($apiPath, -4) === '.php') {
        $cleanPath = substr($apiPath, 0, -4);
    }
    $apiFile = null;
    
    switch ($cleanPath) {
        case '/login':
            $apiFile = __DIR__ . '/../api/login.php';
            break;
        case '/register':
            $apiFile = __DIR__ . '/../api/register.php';
            break;
        case '/forgot-password':
            $apiFile = __DIR__ . '/../api/forgot-password.php';
            break;
        case '/game/start':
            $apiFile = __DIR__ . '/../api/game/start.php';
            break;
        case '/game/guess':
            $apiFile = __DIR__ . '/../api/game/guess.php';
            break;
        case '/game/scores':
            $apiFile = __DIR__ . '/../api/game/scores.php';
            break;
        case '/profile':
            $apiFile = __DIR__ . '/../api/profile.php';
            break;
        case '/my-profile':
            $apiFile = __DIR__ . '/../api/my-profile.php';
            break;
        case '/user-profile':
            $apiFile = __DIR__ . '/../api/user-profile.php';
            break;
        case '/search-users':
            $apiFile = __DIR__ . '/../api/search-users.php';
            break;
        case '/itunes_proxy':
            $apiFile = __DIR__ . '/../api/itunes_proxy.php';
            break;
        case '/itunes_test':
            $apiFile = __DIR__ . '/../api/itunes_test.php';
            break;
        default:
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'API endpoint not found', 'requested_path' => $apiPath, 'cleaned_path' => $cleanPath]);
            exit;
    }
    
    // Check if API file exists and include it
    if ($apiFile && file_exists($apiFile)) {
        include $apiFile;
    } else {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'API file not found', 
            'requested_path' => $apiPath,
            'expected_file' => $apiFile
        ]);
    }
    exit;
}

// For all non-API routes, serve the React app
if ($path !== '/' && file_exists(__DIR__ . $path)) {
    // Serve static files (CSS, JS, images, etc.)
    return false; // Let PHP's built-in server handle static files
}

// Serve React app for all other routes (SPA routing)
include __DIR__ . '/index.html';
?>`;

// Write the PHP router to the build directory
const buildDir = path.join(__dirname, 'build');
const routerPath = path.join(buildDir, 'index.php');

console.log('Creating PHP router at:', routerPath);

try {
    fs.writeFileSync(routerPath, phpRouter);
    console.log('✅ PHP router created successfully!');
} catch (error) {
    console.error('❌ Failed to create PHP router:', error);
    process.exit(1);
}