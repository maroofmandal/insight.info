<?php
require_once 'includes/header.php';

$conn = getDBConnection();

// Get counting since date
$stmt = $conn->prepare("
    SELECT MIN(visit_date) as first_visit
    FROM daily_stats
    WHERE website_id = ?
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$firstVisit = $result->fetch_assoc()['first_visit'];

// Get total visits
$stmt = $conn->prepare("
    SELECT SUM(visit_count) as total_visits
    FROM daily_stats
    WHERE website_id = ?
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$totalVisits = $result->fetch_assoc()['total_visits'] ?? 0;

// Calculate average visits per day
$daysSinceStart = max(1, (strtotime('today') - strtotime($firstVisit)) / 86400);
$avgVisitsPerDay = round($totalVisits / $daysSinceStart);

// Get highest visits day
$stmt = $conn->prepare("
    SELECT visit_date, visit_count
    FROM daily_stats
    WHERE website_id = ?
    ORDER BY visit_count DESC
    LIMIT 1
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$highestDay = $result->fetch_assoc();

// Get today's visits
$stmt = $conn->prepare("
    SELECT visit_count
    FROM daily_stats
    WHERE website_id = ? AND visit_date = CURDATE()
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$todayVisits = $result->fetch_assoc()['visit_count'] ?? 0;

// Get yesterday's visits
$stmt = $conn->prepare("
    SELECT visit_count
    FROM daily_stats
    WHERE website_id = ? AND visit_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$yesterdayVisits = $result->fetch_assoc()['visit_count'] ?? 0;

// Get this week's visits
$stmt = $conn->prepare("
    SELECT SUM(visit_count) as week_visits
    FROM daily_stats
    WHERE website_id = ? 
    AND YEARWEEK(visit_date) = YEARWEEK(CURDATE())
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$thisWeekVisits = $result->fetch_assoc()['week_visits'] ?? 0;

// Get last week's visits
$stmt = $conn->prepare("
    SELECT SUM(visit_count) as week_visits
    FROM daily_stats
    WHERE website_id = ? 
    AND YEARWEEK(visit_date) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK))
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$result = $stmt->get_result();
$lastWeekVisits = $result->fetch_assoc()['week_visits'] ?? 0;

// Get top countries
$stmt = $conn->prepare("
    SELECT country, country_code, visit_count
    FROM country_stats
    WHERE website_id = ?
    ORDER BY visit_count DESC
    LIMIT 10
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$topCountries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get top browsers
$stmt = $conn->prepare("
    SELECT browser, SUM(visit_count) as total_visits
    FROM browser_stats
    WHERE website_id = ?
    GROUP BY browser
    ORDER BY total_visits DESC
    LIMIT 5
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$topBrowsers = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get top operating systems
$stmt = $conn->prepare("
    SELECT os, SUM(visit_count) as total_visits
    FROM os_stats
    WHERE website_id = ?
    GROUP BY os
    ORDER BY total_visits DESC
    LIMIT 5
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$topOS = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>

<div class="container-fluid">
    <h2 class="mb-4">Overview</h2>

    <div class="row g-4">
        <!-- Key Stats -->
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Counting Since</h6>
                    <h5 class="card-title"><?php echo date('F j, Y', strtotime($firstVisit)); ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Total Visits</h6>
                    <h5 class="card-title"><?php echo number_format($totalVisits); ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Average Visits Per Day</h6>
                    <h5 class="card-title"><?php echo number_format($avgVisitsPerDay); ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Highest Visits Day</h6>
                    <h5 class="card-title"><?php echo number_format($highestDay['visit_count']); ?></h5>
                    <p class="card-text small text-muted"><?php echo date('F j, Y', strtotime($highestDay['visit_date'])); ?></p>
                </div>
            </div>
        </div>

        <!-- Time-based Stats -->
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Today's Visits</h6>
                    <h5 class="card-title"><?php echo number_format($todayVisits); ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Yesterday's Visits</h6>
                    <h5 class="card-title"><?php echo number_format($yesterdayVisits); ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">This Week's Visits</h6>
                    <h5 class="card-title"><?php echo number_format($thisWeekVisits); ?></h5>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card stats-card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Last Week's Visits</h6>
                    <h5 class="card-title"><?php echo number_format($lastWeekVisits); ?></h5>
                </div>
            </div>
        </div>

        <!-- Top Countries -->
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Top Countries</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Country</th>
                                    <th>Visits</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($topCountries as $country): ?>
                                <tr>
                                    <td>
                                        <img src="https://flagcdn.com/16x12/<?php echo strtolower($country['country_code']); ?>.png" 
                                             alt="<?php echo htmlspecialchars($country['country']); ?>" 
                                             class="me-1">
                                        <?php echo htmlspecialchars($country['country']); ?>
                                    </td>
                                    <td><?php echo number_format($country['visit_count']); ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Top Browsers -->
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Top Browsers</h5>
                </div>
                <div class="card-body">
                    <canvas id="browserChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Top Operating Systems -->
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Top Operating Systems</h5>
                </div>
                <div class="card-body">
                    <canvas id="osChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Browser Chart
const browserCtx = document.getElementById('browserChart').getContext('2d');
new Chart(browserCtx, {
    type: 'pie',
    data: {
        labels: <?php echo json_encode(array_column($topBrowsers, 'browser')); ?>,
        datasets: [{
            data: <?php echo json_encode(array_column($topBrowsers, 'total_visits')); ?>,
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});

// OS Chart
const osCtx = document.getElementById('osChart').getContext('2d');
new Chart(osCtx, {
    type: 'pie',
    data: {
        labels: <?php echo json_encode(array_column($topOS, 'os')); ?>,
        datasets: [{
            data: <?php echo json_encode(array_column($topOS, 'total_visits')); ?>,
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>
