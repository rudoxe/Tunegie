<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$userId = getUserIdFromToken();

if (!$userId) {
    sendError('Unauthorized', 401);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare('
            SELECT old_username, new_username, changed_at 
            FROM username_history 
            WHERE user_id = ? 
            ORDER BY changed_at DESC
        ');
        $stmt->execute([$userId]);
        $history = $stmt->fetchAll();

        sendResponse([
            'history' => $history
        ]);

    } catch (PDOException $e) {
        sendError('Database error: ' . $e->getMessage(), 500);
    }
} else {
    sendError('Method not allowed', 405);
}
?>