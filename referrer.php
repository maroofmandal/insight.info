<?php
require_once 'includes/header.php';

$conn = getDBConnection();

// Get last 50 referrers
$stmt = $conn->prepare("
    SELECT 
        referrer,
        page_url,
        visit_time,
        country,
        browser,
        os
    FROM visits
    WHERE website_id = ? 
    AND referrer != ''
    AND referrer NOT LIKE '%search?%'
    AND referrer NOT LIKE '%q=%'
    ORDER BY visit_time DESC
    LIMIT 50
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$referrers = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

// Get last 50 search engine queries
$stmt = $conn->prepare("
    SELECT 
        referrer,
        page_url,
        visit_time,
        country,
        browser,
        os
    FROM visits
    WHERE website_id = ? 
    AND (
        referrer LIKE '%search?%'
        OR referrer LIKE '%q=%'
    )
    ORDER BY visit_time DESC
    LIMIT 50
");
$stmt->bind_param("i", $websiteId);
$stmt->execute();
$searchQueries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

$conn->close();

// Helper function to extract search query from URL
function extractSearchQuery($url) {
    $parsedUrl = parse_url($url);
    if (isset($parsedUrl['query'])) {
        parse_str($parsedUrl['query'], $params);
        return isset($params['q']) ? $params['q'] : 
               (isset($params['p']) ? $params['p'] : 
               (isset($params['query']) ? $params['query'] : ''));
    }
    return '';
}

// Helper function to get search engine name
function getSearchEngine($url) {
    if (strpos($url, 'google.') !== false) return 'Google';
    if (strpos($url, 'bing.') !== false) return 'Bing';
    if (strpos($url, 'yahoo.') !== false) return 'Yahoo';
    if (strpos($url, 'duckduckgo.') !== false) return 'DuckDuckGo';
    if (strpos($url, 'yandex.') !== false) return 'Yandex';
    return 'Other';
}

// Helper function to format URL for display
function formatUrl($url, $maxLength = 50) {
    $parsed = parse_url($url);
    $formatted = $parsed['host'] ?? '';
    if (isset($parsed['path'])) {
        $formatted .= $parsed['path'];
    }
    if (strlen($formatted) > $maxLength) {
        $formatted = substr($formatted, 0, $maxLength) . '...';
    }
    return $formatted;
}
?>

<div class="container-fluid">
    <h2 class="mb-4">Referrers & Search Queries</h2>

    <div class="row g-4">
        <!-- Last 50 Referrers -->
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Last 50 Referrers</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped" id="referrersTable">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Referrer</th>
                                    <th>Landing Page</th>
                                    <th>Country</th>
                                    <th>Browser</th>
                                    <th>OS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($referrers as $ref): ?>
                                <tr>
                                    <td><?php echo date('Y-m-d H:i:s', strtotime($ref['visit_time'])); ?></td>
                                    <td>
                                        <a href="<?php echo htmlspecialchars($ref['referrer']); ?>" 
                                           target="_blank" 
                                           title="<?php echo htmlspecialchars($ref['referrer']); ?>">
                                            <?php echo htmlspecialchars(formatUrl($ref['referrer'])); ?>
                                        </a>
                                    </td>
                                    <td>
                                        <a href="<?php echo htmlspecialchars($ref['page_url']); ?>" 
                                           target="_blank"
                                           title="<?php echo htmlspecialchars($ref['page_url']); ?>">
                                            <?php echo htmlspecialchars(formatUrl($ref['page_url'])); ?>
                                        </a>
                                    </td>
                                    <td><?php echo htmlspecialchars($ref['country']); ?></td>
                                    <td><?php echo htmlspecialchars($ref['browser']); ?></td>
                                    <td><?php echo htmlspecialchars($ref['os']); ?></td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Last 50 Search Queries -->
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Last 50 Search Engine Queries</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped" id="searchQueriesTable">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Search Engine</th>
                                    <th>Query</th>
                                    <th>Landing Page</th>
                                    <th>Country</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($searchQueries as $query): ?>
                                <tr>
                                    <td><?php echo date('Y-m-d H:i:s', strtotime($query['visit_time'])); ?></td>
                                    <td><?php echo htmlspecialchars(getSearchEngine($query['referrer'])); ?></td>
                                    <td><?php echo htmlspecialchars(extractSearchQuery($query['referrer'])); ?></td>
                                    <td>
                                        <a href="<?php echo htmlspecialchars($query['page_url']); ?>" 
                                           target="_blank"
                                           title="<?php echo htmlspecialchars($query['page_url']); ?>">
                                            <?php echo htmlspecialchars(formatUrl($query['page_url'])); ?>
                                        </a>
                                    </td>
                                    <td><?php echo htmlspecialchars($query['country']); ?></td>
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

<script>
$(document).ready(function() {
    // Initialize DataTables
    $('#referrersTable').DataTable({
        order: [[0, 'desc']],
        pageLength: 25
    });

    $('#searchQueriesTable').DataTable({
        order: [[0, 'desc']],
        pageLength: 25
    });
});
</script>

<?php require_once 'includes/footer.php'; ?>
