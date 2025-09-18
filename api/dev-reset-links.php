<?php
// Development only - shows recent password reset links
require_once __DIR__ . '/config.php';

// Only work in development
if ($_SERVER['SERVER_NAME'] !== 'localhost' && strpos($_SERVER['SERVER_NAME'], '127.0.0.1') === false) {
    http_response_code(404);
    exit('Not found');
}

try {
    $pdo = getDbConnection();
    
    // Get recent password reset tokens that haven't been used
    $stmt = $pdo->prepare('
        SELECT prt.token, prt.created_at, prt.expires_at, prt.used, u.email, u.username
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        ORDER BY prt.created_at DESC
        LIMIT 10
    ');
    $stmt->execute();
    $tokens = $stmt->fetchAll();
    
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Development - Password Reset Links</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #22c55e; }
            .token { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; border-left: 4px solid #22c55e; }
            .expired { border-left-color: #dc3545; opacity: 0.6; }
            .used { border-left-color: #6c757d; opacity: 0.6; }
            .reset-link { background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; margin: 10px 0; }
            .copy-btn { background: #22c55e; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-left: 10px; }
            .copy-btn:hover { background: #16a34a; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔧 Development - Recent Password Reset Links</h1>
            <p><em>This page is only available in development mode.</em></p>
            
            <?php if (empty($tokens)): ?>
                <p>No password reset requests found.</p>
            <?php else: ?>
                <?php foreach ($tokens as $token): ?>
                    <?php 
                    $isExpired = strtotime($token['expires_at']) < time();
                    $isUsed = $token['used'];
                    $cssClass = $isUsed ? 'used' : ($isExpired ? 'expired' : '');
                    $status = $isUsed ? 'USED' : ($isExpired ? 'EXPIRED' : 'ACTIVE');
                    ?>
                    <div class="token <?php echo $cssClass; ?>">
                        <h3><?php echo htmlspecialchars($token['email']); ?> (<?php echo htmlspecialchars($token['username']); ?>)</h3>
                        <p><strong>Status:</strong> <?php echo $status; ?></p>
                        <p><strong>Created:</strong> <?php echo $token['created_at']; ?></p>
                        <p><strong>Expires:</strong> <?php echo $token['expires_at']; ?></p>
                        <p><strong>Reset Link:</strong></p>
                        <div class="reset-link">
                            <a href="http://localhost:3000/reset-password?token=<?php echo $token['token']; ?>" target="_blank">
                                http://localhost:3000/reset-password?token=<?php echo $token['token']; ?>
                            </a>
                            <button class="copy-btn" onclick="copyToClipboard('http://localhost:3000/reset-password?token=<?php echo $token['token']; ?>')">Copy</button>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
        
        <script>
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                alert('Link copied to clipboard!');
            }, function() {
                alert('Failed to copy link');
            });
        }
        </script>
    </body>
    </html>
    <?php
    
} catch (PDOException $e) {
    echo 'Database error: ' . $e->getMessage();
}
?>