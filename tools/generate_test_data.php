<?php
require_once __DIR__ . '/../config/config.php';

// Test data configuration
$config = [
    'domain' => 'example.com',
    'num_visitors' => 1000,
    'date_range' => [
        'start' => '2024-01-01',
        'end' => date('Y-m-d')
    ],
    'countries' => [
        ['US', 'United States', 40],
        ['IN', 'India', 20],
        ['GB', 'United Kingdom', 10],
        ['DE', 'Germany', 8],
        ['FR', 'France', 7],
        ['CA', 'Canada', 5],
        ['AU', 'Australia', 5],
        ['JP', 'Japan', 3],
        ['BR', 'Brazil', 2]
    ],
    'browsers' => [
        ['Chrome', '120.0', 60],
        ['Firefox', '121.0', 20],
        ['Safari', '17.0', 15],
        ['Edge', '120.0', 5]
    ],
    'operating_systems' => [
        ['Windows', '10', 45],
        ['macOS', '14.0', 25],
        ['iOS', '17.0', 15],
        ['Android', '14', 10],
        ['Linux', 'Ubuntu 22.04', 5]
    ],
    'screen_resolutions' => [
        '1920x1080' => 40,
        '1366x768' => 20,
        '2560x1440' => 15,
        '3840x2160' => 10,
        '1440x900' => 8,
        '1280x720' => 7
    ],
    'pages' => [
        '/' => 30,
        '/products' => 20,
        '/about' => 15,
        '/contact' => 15,
        '/blog' => 10,
        '/pricing' => 10
    ],
    'referrers' => [
        'https://www.google.com/search?q=example+website' => 30,
        'https://www.bing.com/search?q=example+company' => 15,
        'https://www.facebook.com' => 20,
        'https://www.twitter.com' => 15,
        'https://www.linkedin.com' => 10,
        '' => 10 // Direct visits
    ]
];

function weightedRandom($items) {
    $total = array_sum(array_column($items, 2));
    $random = rand(1, $total);
    $current = 0;
    
    foreach ($items as $item) {
        $current += $item[2];
        if ($random <= $current) {
            return [$item[0], $item[1]];
        }
    }
    
    return $items[0];
}

function weightedRandomSingle($items) {
    $total = array_sum($items);
    $random = rand(1, $total);
    $current = 0;
    
    foreach ($items as $key => $weight) {
        $current += $weight;
        if ($random <= $current) {
            return $key;
        }
    }
    
    return array_key_first($items);
}

// Connect to database
$conn = getDBConnection();

// Insert website if it doesn't exist
$stmt = $conn->prepare("INSERT IGNORE INTO websites (domain) VALUES (?)");
$stmt->bind_param("s", $config['domain']);
$stmt->execute();

// Get website ID
$stmt = $conn->prepare("SELECT id FROM websites WHERE domain = ?");
$stmt->bind_param("s", $config['domain']);
$stmt->execute();
$result = $stmt->get_result();
$website = $result->fetch_assoc();
$websiteId = $website['id'];

// Generate visits
$startTimestamp = strtotime($config['date_range']['start']);
$endTimestamp = strtotime($config['date_range']['end']);

for ($i = 0; $i < $config['num_visitors']; $i++) {
    // Generate random timestamp
    $timestamp = rand($startTimestamp, $endTimestamp);
    $visitTime = date('Y-m-d H:i:s', $timestamp);
    
    // Get random data using weighted distribution
    list($countryCode, $country) = weightedRandom($config['countries']);
    list($browser, $browserVersion) = weightedRandom($config['browsers']);
    list($os, $osVersion) = weightedRandom($config['operating_systems']);
    $screenResolution = weightedRandomSingle($config['screen_resolutions']);
    $page = weightedRandomSingle($config['pages']);
    $referrer = weightedRandomSingle($config['referrers']);
    
    // Create page URL
    $pageUrl = 'https://' . $config['domain'] . $page;
    
    // Determine if visitor should be online (last 5 minutes)
    $isOnline = (time() - $timestamp) <= 300 ? 1 : 0;
    $lastActivity = $isOnline ? date('Y-m-d H:i:s') : $visitTime;
    
    // Insert visit
    $stmt = $conn->prepare("
        INSERT INTO visits (
            website_id, visitor_ip, visitor_hash, country, country_code,
            browser, browser_version, os, os_version, screen_resolution,
            referrer, page_url, visit_time, is_online, last_activity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $visitorIp = long2ip(rand(0, 4294967295));
    $visitorHash = md5($visitorIp . rand());
    
    $stmt->bind_param("issssssssssssss",
        $websiteId, $visitorIp, $visitorHash, $country, $countryCode,
        $browser, $browserVersion, $os, $osVersion, $screenResolution,
        $referrer, $pageUrl, $visitTime, $isOnline, $lastActivity
    );
    $stmt->execute();
    
    if ($i % 100 === 0) {
        echo "Generated " . ($i + 1) . " visits...\n";
    }
}

$conn->close();
echo "Test data generation completed!\n";
