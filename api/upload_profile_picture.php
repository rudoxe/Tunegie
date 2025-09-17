<?php
require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/config.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendError('Method not allowed', 405);
}

// Get user from JWT token
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    sendError('Authorization header missing or invalid', 401);
}

$token = $matches[1];
$userData = verifyJWT($token);

if (!$userData) {
    sendError('Invalid or expired token', 401);
}

$userId = $userData['user_id'];

// Check if file was uploaded
if (!isset($_FILES['profile_picture'])) {
    sendError('No profile_picture file found in upload');
}

if ($_FILES['profile_picture']['error'] !== UPLOAD_ERR_OK) {
    $error = $_FILES['profile_picture']['error'];
    sendError('File upload error: ' . $error);
}

$file = $_FILES['profile_picture'];
$fileName = $file['name'];
$fileTmpName = $file['tmp_name'];
$fileSize = $file['size'];
$fileType = $file['type'];

// Validate file type
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
if (!in_array($fileType, $allowedTypes)) {
    sendError('File format or size is not correct!');
}

// Validate file size (6MB max)
$maxSize = 6 * 1024 * 1024; // 6MB in bytes
if ($fileSize > $maxSize) {
    sendError('File format or size is not correct!');
}

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/../uploads/profile_pictures/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
$newFileName = 'profile_' . $userId . '_' . time() . '.' . $fileExtension;
$uploadPath = $uploadDir . $newFileName;

// Move uploaded file
if (!move_uploaded_file($fileTmpName, $uploadPath)) {
    sendError('Failed to save uploaded file');
}

try {
    // Get current profile picture to delete old one
    $stmt = $pdo->prepare('SELECT profile_picture FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $oldPicture = $stmt->fetchColumn();

    // Update database with new profile picture path
    $relativePath = 'uploads/profile_pictures/' . $newFileName;
    $stmt = $pdo->prepare('UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$relativePath, $userId]);

    // Delete old profile picture file if it exists
    if ($oldPicture && file_exists(__DIR__ . '/../' . $oldPicture)) {
        unlink(__DIR__ . '/../' . $oldPicture);
    }

    sendResponse([
        'message' => 'Profile successfully saved!',
        'profile_picture' => $relativePath
    ]);
} catch (PDOException $e) {
    // Delete uploaded file if database update fails
    if (file_exists($uploadPath)) {
        unlink($uploadPath);
    }
    sendError('Database error: ' . $e->getMessage(), 500);
}
