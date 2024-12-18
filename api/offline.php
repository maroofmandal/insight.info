<?php
require_once '../config/config.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST');
    header('Access-Control-Allow-Headers: Content-Type');
    exit(0);
}

$conn = getDBConnection();

// Update visitor status to offline
$visitorHash = md5(getClientIP() . $_SERVER['HTTP_USER_AGENT']);

$stmt = $conn->prepare("
    UPDATE visits 
    SET is_online = 0 
    WHERE visitor_hash = ? 
    AND is_online = 1
");
$stmt->bind_param("s", $visitorHash);
$stmt->execute();

$conn->close();

// Return 204 No Content
http_response_code(204);
