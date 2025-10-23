<?php
// Include CORS handling
require_once __DIR__ . '/../../middleware/cors.php';

// Set JSON header
header('Content-Type: application/json');

// iTunes API base URL
$itunesBaseUrl = 'https://itunes.apple.com/search';

// Test with a simple query
$params = http_build_query([
    'term' => 'test',
    'limit' => '1',
    'country' => 'US',
    'media' => 'music',
    'entity' => 'song',
    'explicit' => 'Yes'
]);

$url = $itunesBaseUrl . '?' . $params;

// Make the API request using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_USERAGENT, 'Tunegie/1.0');

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Check for errors
if ($error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'connected' => false,
        'message' => 'Failed to connect to iTunes API',
        'error' => $error
    ]);
    exit;
}

// Check HTTP status
if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'connected' => false,
        'message' => 'iTunes API returned error',
        'httpCode' => $httpCode
    ]);
    exit;
}

// Decode the response
$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'connected' => false,
        'message' => 'Invalid JSON response from iTunes API'
    ]);
    exit;
}

// Return successful response
$isConnected = isset($data['results']) && is_array($data['results']);

echo json_encode([
    'success' => true,
    'connected' => $isConnected,
    'message' => $isConnected ? 'iTunes API connection successful' : 'iTunes API connection failed',
    'resultCount' => $data['resultCount'] ?? 0
]);
?>

