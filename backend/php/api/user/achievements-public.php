<?php
require_once __DIR__ . '/../../middleware/cors.php';
require_once __DIR__ . '/../../config/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'GET') {
    sendError('Method not allowed', 405);
}

try {
    $pdo = getDbConnection();
    
    // Get all achievements (public endpoint - no user-specific data)
    $stmt = $pdo->prepare("
        SELECT 
            id,
            name,
            description,
            icon,
            COALESCE(color, 'gold') as color,
            category,
            condition_type,
            condition_value,
            COALESCE(points, points_reward, 100) as points
        FROM achievements 
        ORDER BY category, points DESC, name ASC
    ");
    $stmt->execute();
    $allAchievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format achievements for frontend
    foreach ($allAchievements as &$achievement) {
        $achievement['id'] = (int)$achievement['id'];
        $achievement['points'] = (int)$achievement['points'];
        $achievement['is_earned'] = false; // Public endpoint - no user data
        $achievement['progress'] = 0;
        $achievement['target'] = (int)$achievement['condition_value'];
        $achievement['progress_percentage'] = 0;
        
        // Ensure we have required fields with defaults
        $achievement['icon'] = $achievement['icon'] ?? '🏆';
        $achievement['color'] = $achievement['color'] ?? 'gold';
        
        // Clean up fields
        unset($achievement['condition_type']);
        unset($achievement['condition_value']);
    }
    
    sendResponse([
        'achievements' => $allAchievements,
        'message' => 'Public achievements data (no user progress)'
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in achievements-public.php: " . $e->getMessage());
    sendError('Database error occurred', 500);
} catch (Exception $e) {
    error_log("General error in achievements-public.php: " . $e->getMessage());
    sendError('An error occurred while fetching achievements', 500);
}
?>