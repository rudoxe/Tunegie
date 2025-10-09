<?php
echo "🔧 Fixing all include paths in backend PHP files...\n";

$basePath = __DIR__ . '/backend/php';

// Files and their correct relative paths to the middleware, config, and utils directories
$fixes = [
    // API files that need to reference ../../middleware/cors.php
    'api/auth/forgot-password.php',
    'api/auth/reset-password.php',
    'api/game/itunes_proxy.php',
    'api/game/itunes_test.php',
    'api/game/public-streaks.php',
    'api/game/streaks.php',
    'api/user/upload_profile_picture.php',
    'api/user/user-achievements.php',
    'api/user/user-profile.php',
    
    // Admin files that need different path
    'api/admin/add_privacy_column.php',
    'api/admin/add_profile_picture_column.php',
    'api/admin/dashboard.php',
    
    // Utils files
    'utils/achievements.php'
];

foreach ($fixes as $file) {
    $filePath = $basePath . '/' . $file;
    
    if (!file_exists($filePath)) {
        echo "❌ File not found: $file\n";
        continue;
    }
    
    $content = file_get_contents($filePath);
    $originalContent = $content;
    
    // Determine the correct relative path based on file location
    $depth = substr_count($file, '/');
    $relativePath = str_repeat('../', $depth);
    
    // Fix common include patterns
    $content = preg_replace(
        '/require_once __DIR__ \. \'\/cors\.php\';/',
        "require_once __DIR__ . '/{$relativePath}middleware/cors.php';",
        $content
    );
    
    $content = preg_replace(
        '/require_once __DIR__ \. \'\/config\.php\';/',
        "require_once __DIR__ . '/{$relativePath}config/config.php';",
        $content
    );
    
    $content = preg_replace(
        '/require_once __DIR__ \. \'\/AchievementSystem\.php\';/',
        "require_once __DIR__ . '/{$relativePath}utils/AchievementSystem.php';",
        $content
    );
    
    if ($content !== $originalContent) {
        file_put_contents($filePath, $content);
        echo "✅ Fixed: $file\n";
    } else {
        echo "⭕ No changes needed: $file\n";
    }
}

echo "\n🎉 Include path fixing completed!\n";
?>