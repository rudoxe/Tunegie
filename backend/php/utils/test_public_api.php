<?php
// Test the public achievements API

$url = 'http://localhost:8000/backend/php/api/user/achievements-public.php';

echo "Testing public achievements API...\n";
echo "URL: $url\n\n";

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => 'Content-Type: application/json'
    ]
]);

$response = file_get_contents($url, false, $context);

if ($response === false) {
    echo "❌ API call failed\n";
    if (isset($http_response_header)) {
        echo "Headers: " . print_r($http_response_header, true) . "\n";
    }
} else {
    echo "✅ API call successful\n";
    
    $data = json_decode($response, true);
    
    if ($data) {
        echo "📊 Response data:\n";
        echo "- Achievement count: " . count($data['achievements'] ?? []) . "\n";
        
        if (!empty($data['achievements'])) {
            echo "- Sample achievements:\n";
            foreach (array_slice($data['achievements'], 0, 3) as $achievement) {
                echo "  • {$achievement['name']} ({$achievement['points']} points)\n";
            }
        }
    } else {
        echo "❌ Invalid JSON response\n";
        echo "Raw response: $response\n";
    }
}
?>
