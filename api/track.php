<?php
require_once '../config/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['domain'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Domain is required']);
    exit;
}

$conn = getDBConnection();

// Get or create website
$domain = sanitize($data['domain']);
$stmt = $conn->prepare("INSERT IGNORE INTO websites (domain) VALUES (?)");
$stmt->bind_param("s", $domain);
$stmt->execute();

$stmt = $conn->prepare("SELECT id FROM websites WHERE domain = ?");
$stmt->bind_param("s", $domain);
$stmt->execute();
$result = $stmt->get_result();
$website = $result->fetch_assoc();
$websiteId = $website['id'];

// Create visitor hash
$visitorHash = md5(getClientIP() . $_SERVER['HTTP_USER_AGENT']);

// Get country info using IP (you might want to use a proper IP geolocation service)
$country = "Unknown";
$countryCode = "XX";

// Record visit
$stmt = $conn->prepare("
    INSERT INTO visits (
        website_id, visitor_ip, visitor_hash, country, country_code,
        browser, browser_version, os, os_version, screen_resolution,
        referrer, page_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$ip = getClientIP();
$browser = $data['browser'];
$browserVersion = $data['browserVersion'];
$os = $data['os'];
$osVersion = $data['osVersion'];
$screenResolution = $data['screenResolution'];
$referrer = $data['referrer'];
$pageUrl = $data['pageUrl'];

$stmt->bind_param("isssssssssss", 
    $websiteId, $ip, $visitorHash, $country, $countryCode,
    $browser, $browserVersion, $os, $osVersion, $screenResolution,
    $referrer, $pageUrl
);
$stmt->execute();

// Get current stats
$stats = [
    'online' => 0,
    'today' => 0,
    'total' => 0
];

// Get online visitors (active in last 5 minutes)
$stmt = $conn->prepare("
    SELECT COUNT(DISTINCT visitor_hash) as count 
    FROM visits 
    WHERE website_id = ? 
    AND is_online = 1 
    AND last_activity >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stats['online'] = $row['count'];

// Get today's visits
$stmt = $conn->prepare("
    SELECT visit_count 
    FROM daily_stats 
    WHERE website_id = ? 
    AND visit_date = CURDATE()
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stats['today'] = $row ? $row['visit_count'] : 0;

// Get total visits
$stmt = $conn->prepare("
    SELECT SUM(visit_count) as total 
    FROM daily_stats 
    WHERE website_id = ?
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stats['total'] = $row['total'] ?? 0;

$conn->close();

echo json_encode($stats);
