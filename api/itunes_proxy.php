<?php
// Include CORS handling
require_once 'cors.php';

// Set JSON header
header('Content-Type: application/json');

// iTunes API base URLs
$itunesSearchUrl = 'https://itunes.apple.com/search';
$itunesLookupUrl = 'https://itunes.apple.com/lookup';

// Get request parameters
$term = isset($_GET['term']) ? $_GET['term'] : '';
$limit = isset($_GET['limit']) ? $_GET['limit'] : '200';
$country = isset($_GET['country']) ? $_GET['country'] : 'US';
$media = isset($_GET['media']) ? $_GET['media'] : 'music';
$entity = isset($_GET['entity']) ? $_GET['entity'] : 'song';
$explicit = isset($_GET['explicit']) ? $_GET['explicit'] : 'Yes';
$attribute = isset($_GET['attribute']) ? $_GET['attribute'] : '';
$artistId = isset($_GET['artistId']) ? $_GET['artistId'] : '';
$isLookup = isset($_GET['lookup']) && $_GET['lookup'] === 'true';

// Handle lookup requests differently
if ($isLookup && !empty($artistId)) {
    $baseUrl = $itunesLookupUrl;
    $params = array_filter([
        'id' => $artistId,
        'entity' => $entity,
        'limit' => $limit,
        'country' => $country
    ], function($value) { return $value !== ''; });
} else {
    // Regular search request
    if (empty($term) && empty($artistId)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Search term or artist ID is required'
        ]);
        exit;
    }

    $baseUrl = $itunesSearchUrl;
    $params = array_filter([
        'term' => $term,
        'limit' => $limit,
        'country' => $country,
        'media' => $media,
        'entity' => $entity,
        'explicit' => $explicit,
        'attribute' => $attribute
    ], function($value) { return $value !== ''; });
}

$url = $baseUrl . '?' . http_build_query($params);

// Log the request (optional, for debugging)
error_log("iTunes API Request: " . $url);

// Make the API request using cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For development only
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
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
        'message' => 'Failed to fetch from iTunes API',
        'error' => $error
    ]);
    error_log("iTunes API Error: " . $error);
    exit;
}

// Check HTTP status
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => false,
        'message' => 'iTunes API returned error',
        'httpCode' => $httpCode
    ]);
    error_log("iTunes API HTTP Error: " . $httpCode);
    exit;
}

// Decode the response to validate it
$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON response from iTunes API'
    ]);
    error_log("iTunes API JSON Error: " . json_last_error_msg());
    exit;
}

// Log success
error_log("iTunes API Success: " . $data['resultCount'] . " results");

// Return successful response
echo json_encode([
    'success' => true,
    'data' => $data
]);
?>
