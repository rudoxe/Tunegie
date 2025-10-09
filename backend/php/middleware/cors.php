<?php
// CORS handling for all API endpoints
function handleCors() {
    // Allow from any origin for development (change in production)
    $allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://[::1]:3000'
    ];
    
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    // For development, be more permissive
    if ($origin && (in_array($origin, $allowedOrigins) || strpos($origin, 'localhost') !== false)) {
        header("Access-Control-Allow-Origin: {$origin}");
    } else {
        // Fallback for development - allow localhost origins
        header("Access-Control-Allow-Origin: http://localhost:3000");
    }
    
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
    
    // Access-Control headers are received during OPTIONS requests
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        }
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
        }
        
        http_response_code(200);
        exit(0);
    }
}

// Call this at the beginning of each API endpoint
handleCors();
?>
