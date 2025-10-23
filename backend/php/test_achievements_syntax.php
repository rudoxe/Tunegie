<?php
// Simple syntax test for achievements API
echo "Testing PHP syntax...\n";

try {
    // Include the achievements file to check for syntax errors
    include_once 'api/user/achievements.php';
    echo "No syntax errors found!\n";
} catch (ParseError $e) {
    echo "Syntax error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Other error: " . $e->getMessage() . "\n";
}
?>
