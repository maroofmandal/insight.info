<?php
require_once 'includes/header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Recent Visitors</h2>
        <div class="text-success">
            <i class="fas fa-circle"></i> Auto-refreshing
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover" id="visitorsTable">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Location</th>
                            <th>Page</th>
                            <th>Referrer</th>
                            <th>System</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Visitors will be populated here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<template id="visitorRowTemplate">
    <tr>
        <td>
            <div class="visit-time fw-bold"></div>
            <div class="last-activity small text-muted"></div>
        </td>
        <td>
            <img src="" alt="" class="country-flag me-1" style="width: 16px;">
            <span class="visitor-country"></span>
        </td>
        <td>
            <a href="#" class="page-url text-truncate d-inline-block" style="max-width: 300px;" target="_blank"></a>
        </td>
        <td>
            <a href="#" class="referrer text-truncate d-inline-block" style="max-width: 300px;" target="_blank"></a>
        </td>
        <td>
            <div class="browser"></div>
            <div class="os small text-muted"></div>
            <div class="screen-resolution small text-muted"></div>
        </td>
        <td>
            <span class="status-badge badge"></span>
        </td>
    </tr>
</template>

<script>
function formatUrl(url, maxLength = 50) {
    try {
        const parsed = new URL(url);
        let formatted = parsed.hostname + parsed.pathname;
        if (formatted.length > maxLength) {
            formatted = formatted.substring(0, maxLength) + '...';
        }
        return formatted;
    } catch (e) {
        return url;
    }
}

function updateVisitorsList() {
    fetch(`/api/realtime.php?domain=<?php echo urlencode($domain); ?>&type=visitors`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#visitorsTable tbody');
            const template = document.getElementById('visitorRowTemplate');
            
            // Clear existing rows
            tbody.innerHTML = '';
            
            // Add new rows
            data.recent_visitors.forEach(visitor => {
                const row = template.content.cloneNode(true);
                
                // Set visit time and last activity
                row.querySelector('.visit-time').textContent = 
                    new Date(visitor.visit_time).toLocaleString();
                row.querySelector('.last-activity').textContent = 
                    `Last active: ${timeAgo(visitor.last_activity)}`;
                
                // Set country information
                const flagImg = row.querySelector('.country-flag');
                flagImg.src = `https://flagcdn.com/16x12/${visitor.country_code.toLowerCase()}.png`;
                flagImg.alt = visitor.country;
                row.querySelector('.visitor-country').textContent = visitor.country;
                
                // Set page URL
                const pageLink = row.querySelector('.page-url');
                pageLink.href = visitor.page_url;
                pageLink.textContent = formatUrl(visitor.page_url);
                pageLink.title = visitor.page_url;
                
                // Set referrer
                const referrerLink = row.querySelector('.referrer');
                if (visitor.referrer) {
                    referrerLink.href = visitor.referrer;
                    referrerLink.textContent = formatUrl(visitor.referrer);
                    referrerLink.title = visitor.referrer;
                } else {
                    referrerLink.textContent = 'Direct visit';
                    referrerLink.removeAttribute('href');
                }
                
                // Set system information
                row.querySelector('.browser').textContent = visitor.browser;
                row.querySelector('.os').textContent = visitor.os;
                row.querySelector('.screen-resolution').textContent = visitor.screen_resolution;
                
                // Set status badge
                const statusBadge = row.querySelector('.status-badge');
                if (visitor.is_online) {
                    statusBadge.classList.add('bg-success');
                    statusBadge.textContent = 'Online';
                } else {
                    statusBadge.classList.add('bg-secondary');
                    statusBadge.textContent = 'Offline';
                }
                
                tbody.appendChild(row);
            });
        })
        .catch(console.error);
}

// Update immediately and then every 10 seconds
updateVisitorsList();
setInterval(updateVisitorsList, 10000);
</script>

<?php require_once 'includes/footer.php'; ?>
