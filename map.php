<?php
require_once 'includes/header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Live Visitor Map</h2>
        <div class="d-flex align-items-center">
            <div class="text-success me-2">
                <i class="fas fa-circle"></i> Auto-refreshing
            </div>
            <div id="visitorCount" class="badge bg-primary fs-6">
                0 visitors online
            </div>
        </div>
    </div>

    <div class="row g-4">
        <!-- World Map -->
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <div id="worldMap" style="height: 600px;"></div>
                </div>
            </div>
        </div>

        <!-- Online Visitors by Country -->
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Online Visitors by Country</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table" id="countryTable">
                            <thead>
                                <tr>
                                    <th>Country</th>
                                    <th>Visitors</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Will be populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Online Visitors List -->
        <div class="col-md-6">
            <div class="card h-100">
                <div class="card-header">
                    <h5 class="card-title mb-0">Current Online Visitors</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table" id="visitorTable">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Last Activity</th>
                                    <th>Current Page</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Will be populated dynamically -->
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
let map;

function initializeMap() {
    map = $('#worldMap').vectorMap({
        map: 'world_mill',
        backgroundColor: 'transparent',
        series: {
            regions: [{
                values: {},
                scale: ['#C8EEFF', '#0071A4'],
                normalizeFunction: 'polynomial'
            }]
        },
        onRegionTipShow: function(e, el, code) {
            const visitors = map.series.regions[0].values[code] || 0;
            el.html(el.html() + ': ' + visitors + ' visitor(s)');
        }
    }).vectorMap('get', 'mapObject');
}

function updateMap() {
    fetch(`/api/realtime.php?domain=<?php echo urlencode($domain); ?>&type=all`)
        .then(response => response.json())
        .then(data => {
            // Update visitor count
            const totalVisitors = data.online_visitors.length;
            document.getElementById('visitorCount').textContent = 
                `${totalVisitors} visitor${totalVisitors !== 1 ? 's' : ''} online`;

            // Update map data
            const mapData = {};
            data.visitor_locations.forEach(location => {
                mapData[location.country_code.toLowerCase()] = location.visitor_count;
            });
            map.series.regions[0].setValues(mapData);

            // Update country table
            const countryTbody = document.querySelector('#countryTable tbody');
            countryTbody.innerHTML = '';
            data.visitor_locations
                .sort((a, b) => b.visitor_count - a.visitor_count)
                .forEach(location => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <img src="https://flagcdn.com/16x12/${location.country_code.toLowerCase()}.png" 
                                 alt="${location.country}" 
                                 class="me-1">
                            ${location.country}
                        </td>
                        <td>${location.visitor_count}</td>
                    `;
                    countryTbody.appendChild(row);
                });

            // Update visitor table
            const visitorTbody = document.querySelector('#visitorTable tbody');
            visitorTbody.innerHTML = '';
            data.online_visitors.forEach(visitor => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <img src="https://flagcdn.com/16x12/${visitor.country_code.toLowerCase()}.png" 
                             alt="${visitor.country}" 
                             class="me-1">
                        ${visitor.country}
                    </td>
                    <td>${timeAgo(visitor.last_activity)}</td>
                    <td>
                        <a href="${visitor.page_url}" 
                           target="_blank"
                           title="${visitor.page_url}"
                           class="text-truncate d-inline-block"
                           style="max-width: 200px;">
                            ${formatUrl(visitor.page_url)}
                        </a>
                    </td>
                `;
                visitorTbody.appendChild(row);
            });
        })
        .catch(console.error);
}

// Initialize map and start updates
$(document).ready(function() {
    initializeMap();
    updateMap();
    setInterval(updateMap, 10000);
});
</script>

<?php require_once 'includes/footer.php'; ?>
