<?php
require_once 'includes/header.php';

$conn = getDBConnection();

// Get hourly stats for today
$stmt = $conn->prepare("
    SELECT HOUR(visit_time) as hour, COUNT(*) as visits
    FROM visits
    WHERE website_id = ? 
    AND DATE(visit_time) = CURDATE()
    GROUP BY HOUR(visit_time)
    ORDER BY hour
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$hourlyStats = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get daily stats for the week
$stmt = $conn->prepare("
    SELECT visit_date, visit_count
    FROM daily_stats
    WHERE website_id = ?
    AND visit_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ORDER BY visit_date
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$weeklyStats = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get monthly stats for the year
$stmt = $conn->prepare("
    SELECT DATE_FORMAT(visit_date, '%Y-%m') as month, SUM(visit_count) as visits
    FROM daily_stats
    WHERE website_id = ?
    AND visit_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY DATE_FORMAT(visit_date, '%Y-%m')
    ORDER BY month
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$monthlyStats = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get yearly stats
$stmt = $conn->prepare("
    SELECT YEAR(visit_date) as year, SUM(visit_count) as visits
    FROM daily_stats
    WHERE website_id = ?
    GROUP BY YEAR(visit_date)
    ORDER BY year
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$yearlyStats = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>

<div class="container-fluid">
    <h2 class="mb-4">Traffic Analysis</h2>

    <div class="row g-4">
        <!-- Hourly Traffic -->
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Today's Hourly Traffic</h5>
                </div>
                <div class="card-body">
                    <canvas id="hourlyChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Weekly Traffic -->
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Last 7 Days Traffic</h5>
                </div>
                <div class="card-body">
                    <canvas id="weeklyChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Monthly Traffic -->
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Monthly Traffic</h5>
                </div>
                <div class="card-body">
                    <canvas id="monthlyChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Yearly Traffic -->
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Yearly Traffic</h5>
                </div>
                <div class="card-body">
                    <canvas id="yearlyChart"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Helper function to format hours
function formatHour(hour) {
    return `${hour.toString().padStart(2, '0')}:00`;
}

// Helper function to format dates
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function to format months
function formatMonth(month) {
    return new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

// Hourly Chart
const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
new Chart(hourlyCtx, {
    type: 'line',
    data: {
        labels: <?php 
            $hours = array_column($hourlyStats, 'hour');
            echo json_encode(array_map('formatHour', $hours));
        ?>,
        datasets: [{
            label: 'Visits',
            data: <?php echo json_encode(array_column($hourlyStats, 'visits')); ?>,
            borderColor: '#36A2EB',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Weekly Chart
const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
new Chart(weeklyCtx, {
    type: 'bar',
    data: {
        labels: <?php 
            $dates = array_column($weeklyStats, 'visit_date');
            echo json_encode(array_map('formatDate', $dates));
        ?>,
        datasets: [{
            label: 'Visits',
            data: <?php echo json_encode(array_column($weeklyStats, 'visit_count')); ?>,
            backgroundColor: '#4BC0C0'
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Monthly Chart
const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
new Chart(monthlyCtx, {
    type: 'line',
    data: {
        labels: <?php 
            $months = array_column($monthlyStats, 'month');
            echo json_encode(array_map('formatMonth', $months));
        ?>,
        datasets: [{
            label: 'Visits',
            data: <?php echo json_encode(array_column($monthlyStats, 'visits')); ?>,
            borderColor: '#FF6384',
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Yearly Chart
const yearlyCtx = document.getElementById('yearlyChart').getContext('2d');
new Chart(yearlyCtx, {
    type: 'bar',
    data: {
        labels: <?php echo json_encode(array_column($yearlyStats, 'year')); ?>,
        datasets: [{
            label: 'Visits',
            data: <?php echo json_encode(array_column($yearlyStats, 'visits')); ?>,
            backgroundColor: '#FFCE56'
        }]
    },
    options: {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
</script>

<?php require_once 'includes/footer.php'; ?>
