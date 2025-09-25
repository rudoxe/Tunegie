<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    sendError('Search query is required', 400);
}

if (strlen($query) < 2) {
    sendError('Search query must be at least 2 characters', 400);
}

try {
    // Search for users by username (case-insensitive, partial match)
    $stmt = $pdo->prepare('
        SELECT id, username, profile_picture, created_at, is_private 
        FROM users 
        WHERE username LIKE ? 
        AND is_private = 0
        ORDER BY username ASC 
        LIMIT 10
    ');
    
    $searchTerm = '%' . $query . '%';
    $stmt->execute([$searchTerm]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    sendResponse(['users' => $users]);
    
} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
}
?>