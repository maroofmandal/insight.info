<?php
require_once __DIR__ . '/../config/config.php';

// Check if domain exists and get website ID
function getWebsiteId($domain) {
    $conn = getDBConnection();
    $stmt = $conn->prepare("SELECT id FROM websites WHERE domain = ?");
    $stmt->bind_param("s", $domain);
    $stmt->execute();
    $result = $stmt->get_result();
    $website = $result->fetch_assoc();
    $conn->close();
    return $website ? $website['id'] : null;
}

$domain = isset($_GET['domain']) ? sanitize($_GET['domain']) : null;
$websiteId = $domain ? getWebsiteId($domain) : null;

if (!$domain || !$websiteId) {
    header('Location: /');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard - <?php echo htmlspecialchars($domain); ?></title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.css" rel="stylesheet">
    <style>
        .sidebar {
            min-height: calc(100vh - 56px);
            background: #f8f9fa;
        }
        .nav-link {
            color: #333;
        }
        .nav-link.active {
            background: #e9ecef;
        }
        .card {
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }
        .stats-card {
            transition: transform 0.2s;
        }
        .stats-card:hover {
            transform: translateY(-3px);
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Insight.info</a>
            <span class="navbar-text text-light">
                <?php echo htmlspecialchars($domain); ?>
            </span>
        </div>
    </nav>

    <div class="container-fluid">
        <div class="row">
            <nav class="col-md-2 sidebar py-3">
                <div class="list-group">
                    <a href="/overview.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'overview.php' ? 'active' : ''; ?>">
                        <i class="fas fa-chart-bar me-2"></i> Overview
                    </a>
                    <a href="/traffic.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'traffic.php' ? 'active' : ''; ?>">
                        <i class="fas fa-chart-line me-2"></i> Traffic
                    </a>
                    <a href="/countries.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'countries.php' ? 'active' : ''; ?>">
                        <i class="fas fa-globe me-2"></i> Countries
                    </a>
                    <a href="/system.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'system.php' ? 'active' : ''; ?>">
                        <i class="fas fa-desktop me-2"></i> System
                    </a>
                    <a href="/referrer.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'referrer.php' ? 'active' : ''; ?>">
                        <i class="fas fa-link me-2"></i> Referrer
                    </a>
                    <a href="/online.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'online.php' ? 'active' : ''; ?>">
                        <i class="fas fa-users me-2"></i> Online
                    </a>
                    <a href="/visitors.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'visitors.php' ? 'active' : ''; ?>">
                        <i class="fas fa-user-clock me-2"></i> Visitors
                    </a>
                    <a href="/map.php?domain=<?php echo urlencode($domain); ?>" 
                       class="list-group-item list-group-item-action <?php echo basename($_SERVER['PHP_SELF']) == 'map.php' ? 'active' : ''; ?>">
                        <i class="fas fa-map-marked-alt me-2"></i> Map
                    </a>
                </div>
            </nav>

            <main class="col-md-10 py-3">
