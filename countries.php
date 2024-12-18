<?php
require_once 'includes/header.php';

$conn = getDBConnection();

// Get all countries data
$stmt = $conn->prepare("
    SELECT 
        cs.country,
        cs.country_code,
        cs.visit_count,
        ROUND(cs.visit_count * 100.0 / (
            SELECT SUM(visit_count) 
            FROM country_stats 
            WHERE website_id = ?
        ), 2) as percentage
    FROM country_stats cs
    WHERE cs.website_id = ?
    ORDER BY cs.visit_count DESC
");
$stmt->bind_param("ii", $websiteId, $websiteId);
$stmt->execute();
$countries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$conn->close();
?>

<div class="container-fluid">
    <h2 class="mb-4">Countries</h2>

    <div class="row g-4">
        <!-- World Map -->
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Visitor Distribution</h5>
                </div>
                <div class="card-body">
                    <div id="worldMap" style="height: 400px;"></div>
                </div>
            </div>
        </div>

        <!-- Countries Table -->
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Countries Breakdown</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped" id="countriesTable">
                            <thead>
                                <tr>
                                    <th>Country</th>
                                    <th>Visits</th>
                                    <th>Percentage</th>
                                    <th>Graph</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($countries as $country): ?>
                                <tr>
                                    <td>
                                        <img src="https://flagcdn.com/16x12/<?php echo strtolower($country['country_code']); ?>.png" 
                                             alt="<?php echo htmlspecialchars($country['country']); ?>" 
                                             class="me-1">
                                        <?php echo htmlspecialchars($country['country']); ?>
                                    </td>
                                    <td><?php echo number_format($country['visit_count']); ?></td>
                                    <td><?php echo $country['percentage']; ?>%</td>
                                    <td>
                                        <div class="progress" style="height: 20px;">
                                            <div class="progress-bar bg-primary" 
                                                 role="progressbar" 
                                                 style="width: <?php echo $country['percentage']; ?>%"
                                                 aria-valuenow="<?php echo $country['percentage']; ?>" 
                                                 aria-valuemin="0" 
                                                 aria-valuemax="100">
                                            </div>
                                        </div>
                                    </td>
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

<!-- Include jVectorMap -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/jvectormap/2.0.5/jquery-jvectormap.min.css" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jvectormap/2.0.5/jquery-jvectormap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jvectormap/2.0.5/jquery-jvectormap-world-mill.min.js"></script>

<script>
$(document).ready(function() {
    // Initialize DataTable
    $('#countriesTable').DataTable({
        pageLength: 25,
        order: [[1, 'desc']]
    });

    // Prepare data for the map
    const mapData = {};
    <?php foreach ($countries as $country): ?>
    mapData['<?php echo strtolower($country['country_code']); ?>'] = <?php echo $country['visit_count']; ?>;
    <?php endforeach; ?>

    // Initialize World Map
    $('#worldMap').vectorMap({
        map: 'world_mill',
        backgroundColor: 'transparent',
        series: {
            regions: [{
                values: mapData,
                scale: ['#C8EEFF', '#0071A4'],
                normalizeFunction: 'polynomial'
            }]
        },
        onRegionTipShow: function(e, el, code) {
            if (mapData[code]) {
                el.html(el.html() + ': ' + mapData[code].toLocaleString() + ' visits');
            } else {
                el.html(el.html() + ': 0 visits');
            }
        }
    });
});
</script>

<?php require_once 'includes/footer.php'; ?>
