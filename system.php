<?php
require_once 'includes/header.php';

$conn = getDBConnection();

// Get browser statistics
$stmt = $conn->prepare("
    SELECT 
        browser,
        browser_version,
        visit_count,
        ROUND(visit_count * 100.0 / (
            SELECT SUM(visit_count) 
            FROM browser_stats 
            WHERE website_id = ?
        ), 2) as percentage
    FROM browser_stats
    WHERE website_id = ?
    ORDER BY visit_count DESC
");
$stmt->bind_param("ii", $websiteId, $websiteId);
$stmt->execute();
$browsers = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get operating system statistics
$stmt = $conn->prepare("
    SELECT 
        os,
        os_version,
        visit_count,
        ROUND(visit_count * 100.0 / (
            SELECT SUM(visit_count) 
            FROM os_stats 
            WHERE website_id = ?
        ), 2) as percentage
    FROM os_stats
    WHERE website_id = ?
    ORDER BY visit_count DESC
");
$stmt->bind_param("ii", $websiteId, $websiteId);
$stmt->execute();
$operatingSystems = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get screen resolution statistics
$stmt = $conn->prepare("
    SELECT 
        screen_resolution,
        visit_count,
        ROUND(visit_count * 100.0 / (
            SELECT SUM(visit_count) 
            FROM resolution_stats 
            WHERE website_id = ?
        ), 2) as percentage
    FROM resolution_stats
    WHERE website_id = ?
    ORDER BY visit_count DESC
");
$stmt->bind_param("ii", $websiteId, $websiteId);
$stmt->execute();
$resolutions = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>

<div class="container-fluid">
    <h2 class="mb-4">System Information</h2>

    <div class="row g-4">
        <!-- Browsers -->
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Browsers</h5>
                    <button class="btn btn-sm btn-outline-primary" onclick="toggleView('browsers')">
                        <i class="fas fa-chart-pie me-1"></i>
                        <span>Toggle View</span>
                    </button>
                </div>
                <div class="card-body">
                    <canvas id="browserChart" style="display: none;"></canvas>
                    <div id="browserTable">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Browser</th>
                                        <th>Version</th>
                                        <th>Visits</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($browsers as $browser): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($browser['browser']); ?></td>
                                        <td><?php echo htmlspecialchars($browser['browser_version']); ?></td>
                                        <td><?php echo number_format($browser['visit_count']); ?></td>
                                        <td><?php echo $browser['percentage']; ?>%</td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Operating Systems -->
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Operating Systems</h5>
                    <button class="btn btn-sm btn-outline-primary" onclick="toggleView('os')">
                        <i class="fas fa-chart-pie me-1"></i>
                        <span>Toggle View</span>
                    </button>
                </div>
                <div class="card-body">
                    <canvas id="osChart" style="display: none;"></canvas>
                    <div id="osTable">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>OS</th>
                                        <th>Version</th>
                                        <th>Visits</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($operatingSystems as $os): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($os['os']); ?></td>
                                        <td><?php echo htmlspecialchars($os['os_version']); ?></td>
                                        <td><?php echo number_format($os['visit_count']); ?></td>
                                        <td><?php echo $os['percentage']; ?>%</td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Screen Resolutions -->
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Screen Resolutions</h5>
                    <button class="btn btn-sm btn-outline-primary" onclick="toggleView('resolution')">
                        <i class="fas fa-chart-pie me-1"></i>
                        <span>Toggle View</span>
                    </button>
                </div>
                <div class="card-body">
                    <canvas id="resolutionChart" style="display: none;"></canvas>
                    <div id="resolutionTable">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Resolution</th>
                                        <th>Visits</th>
                                        <th>%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($resolutions as $resolution): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($resolution['screen_resolution']); ?></td>
                                        <td><?php echo number_format($resolution['visit_count']); ?></td>
                                        <td><?php echo $resolution['percentage']; ?>%</td>
                                    </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Chart colors
const chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF9F40'
];

// Initialize charts
const browserChart = new Chart(document.getElementById('browserChart').getContext('2d'), {
    type: 'pie',
    data: {
        labels: <?php echo json_encode(array_map(function($b) { 
            return $b['browser'] . ' ' . $b['browser_version']; 
        }, array_slice($browsers, 0, 10))); ?>,
        datasets: [{
            data: <?php echo json_encode(array_column(array_slice($browsers, 0, 10), 'visit_count')); ?>,
            backgroundColor: chartColors
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

const osChart = new Chart(document.getElementById('osChart').getContext('2d'), {
    type: 'pie',
    data: {
        labels: <?php echo json_encode(array_map(function($os) { 
            return $os['os'] . ' ' . $os['os_version']; 
        }, array_slice($operatingSystems, 0, 10))); ?>,
        datasets: [{
            data: <?php echo json_encode(array_column(array_slice($operatingSystems, 0, 10), 'visit_count')); ?>,
            backgroundColor: chartColors
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

const resolutionChart = new Chart(document.getElementById('resolutionChart').getContext('2d'), {
    type: 'pie',
    data: {
        labels: <?php echo json_encode(array_column(array_slice($resolutions, 0, 10), 'screen_resolution')); ?>,
        datasets: [{
            data: <?php echo json_encode(array_column(array_slice($resolutions, 0, 10), 'visit_count')); ?>,
            backgroundColor: chartColors
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

// Toggle between chart and table views
function toggleView(type) {
    const chart = document.getElementById(`${type}Chart`);
    const table = document.getElementById(`${type}Table`);
    
    if (chart.style.display === 'none') {
        chart.style.display = 'block';
        table.style.display = 'none';
    } else {
        chart.style.display = 'none';
        table.style.display = 'block';
    }
}
</script>

<?php require_once 'includes/footer.php'; ?>
