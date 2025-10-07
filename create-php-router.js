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
    
    // Route to specific API endpoints
    switch ($apiPath) {
        case '/login':
        case '/login.php':
            include '../api/login.php';
            break;
        case '/register':
        case '/register.php':
            include '../api/register.php';
            break;
        case '/forgot-password':
        case '/forgot-password.php':
            include '../api/forgot-password.php';
            break;
        case '/game/start':
        case '/game/start.php':
            include '../api/game/start.php';
            break;
        case '/game/guess':
        case '/game/guess.php':
            include '../api/game/guess.php';
            break;
        case '/game/scores':
        case '/game/scores.php':
            include '../api/game/scores.php';
            break;
        case '/profile':
        case '/profile.php':
            include '../api/profile.php';
            break;
        case '/my-profile':
        case '/my-profile.php':
            include '../api/my-profile.php';
            break;
        case '/user-profile':
        case '/user-profile.php':
            include '../api/user-profile.php';
            break;
        case '/search-users':
        case '/search-users.php':
            include '../api/search-users.php';
            break;
        case '/itunes_proxy':
        case '/itunes_proxy.php':
            include '../api/itunes_proxy.php';
            break;
        case '/itunes_test':
        case '/itunes_test.php':
            include '../api/itunes_test.php';
            break;
        default:
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'API endpoint not found', 'requested_path' => $apiPath]);
            exit;
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