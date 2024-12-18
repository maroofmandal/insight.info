<?php
require_once '../config/config.php';

header('Content-Type: application/json');

if (!isset($_GET['domain'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Domain is required']);
    exit;
}

$conn = getDBConnection();
$domain = sanitize($_GET['domain']);

// Get website ID
$stmt = $conn->prepare("SELECT id FROM websites WHERE domain = ?");
$stmt->bind_param("s", $domain);
$stmt->execute();
$result = $stmt->get_result();
$website = $result->fetch_assoc();

if (!$website) {
    http_response_code(404);
    echo json_encode(['error' => 'Website not found']);
    exit;
}

$websiteId = $website['id'];
$type = $_GET['type'] ?? 'all';
$response = [];

// Get online visitors
if ($type === 'all' || $type === 'online') {
    $stmt = $conn->prepare("
        SELECT 
            v.visitor_hash,
            v.country,
            v.country_code,
            v.browser,
            v.os,
            v.page_url,
            v.visit_time,
            v.last_activity
        FROM visits v
        WHERE v.website_id = ?
        AND v.is_online = 1
        AND v.last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        ORDER BY v.last_activity DESC
    ");
    $stmt->bind_param("i", $websiteId);
    $stmt->execute();
    $response['online_visitors'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

// Get last 50 visitors
if ($type === 'all' || $type === 'visitors') {
    $stmt = $conn->prepare("
        SELECT 
            v.visitor_hash,
            v.country,
            v.country_code,
            v.browser,
            v.os,
            v.screen_resolution,
            v.referrer,
            v.page_url,
            v.visit_time,
            v.last_activity,
            v.is_online
        FROM visits v
        WHERE v.website_id = ?
        ORDER BY v.visit_time DESC
        LIMIT 50
    ");
    $stmt->bind_param("i", $websiteId);
    $stmt->execute();
    $response['recent_visitors'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

// Get visitor locations for map
if ($type === 'all' || $type === 'map') {
    $stmt = $conn->prepare("
        SELECT 
            v.country,
            v.country_code,
            COUNT(*) as visitor_count
        FROM visits v
        WHERE v.website_id = ?
        AND v.is_online = 1
        AND v.last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        GROUP BY v.country, v.country_code
    ");
    $stmt->bind_param("i", $websiteId);
    $stmt->execute();
    $response['visitor_locations'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

$conn->close();
echo json_encode($response);
