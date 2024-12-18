<?php
require_once 'includes/header.php';
?>

<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Online Visitors</h2>
        <div class="d-flex align-items-center">
            <div class="text-success me-2">
                <i class="fas fa-circle"></i> Auto-refreshing
            </div>
            <div id="visitorCount" class="badge bg-primary fs-6">
                0 visitors online
            </div>
        </div>
    </div>

    <div class="row" id="onlineVisitors">
        <!-- Online visitors will be populated here -->
    </div>
</div>

<template id="visitorCardTemplate">
    <div class="col-md-4 mb-4 visitor-card">
        <div class="card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 class="card-title mb-1">
                            <img src="" alt="" class="country-flag me-2" style="width: 24px;">
                            <span class="visitor-country"></span>
                        </h5>
                        <p class="card-subtitle text-muted visitor-time"></p>
                    </div>
                    <span class="badge bg-success">Online</span>
                </div>
                <div class="mb-2">
                    <i class="fas fa-globe me-2"></i>
                    <a href="#" class="current-page text-truncate" target="_blank"></a>
                </div>
                <div class="mb-2">
                    <i class="fas fa-clock me-2"></i>
                    <span class="last-activity"></span>
                </div>
                <div class="mb-2">
                    <i class="fas fa-desktop me-2"></i>
                    <span class="system-info"></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 120) return '1 minute ago';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 7200) return '1 hour ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    return Math.floor(seconds / 86400) + ' days ago';
}

function updateOnlineVisitors() {
    fetch(`/api/realtime.php?domain=<?php echo urlencode($domain); ?>&type=online`)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('onlineVisitors');
            const template = document.getElementById('visitorCardTemplate');
            const visitorCount = document.getElementById('visitorCount');
            
            // Update visitor count
            visitorCount.textContent = `${data.online_visitors.length} visitor${data.online_visitors.length !== 1 ? 's' : ''} online`;
            
            // Clear existing cards
            container.innerHTML = '';
            
            // Add new cards
            data.online_visitors.forEach(visitor => {
                const card = template.content.cloneNode(true);
                
                // Set country flag and name
                const flagImg = card.querySelector('.country-flag');
                flagImg.src = `https://flagcdn.com/24x18/${visitor.country_code.toLowerCase()}.png`;
                flagImg.alt = visitor.country;
                card.querySelector('.visitor-country').textContent = visitor.country;
                
                // Set time information
                card.querySelector('.visitor-time').textContent = 
                    `Visited ${timeAgo(visitor.visit_time)}`;
                card.querySelector('.last-activity').textContent = 
                    `Last active ${timeAgo(visitor.last_activity)}`;
                
                // Set current page
                const pageLink = card.querySelector('.current-page');
                pageLink.href = visitor.page_url;
                pageLink.textContent = new URL(visitor.page_url).pathname;
                
                // Set system information
                card.querySelector('.system-info').textContent = 
                    `${visitor.browser} on ${visitor.os}`;
                
                container.appendChild(card);
            });
        })
        .catch(console.error);
}

// Update immediately and then every 10 seconds
updateOnlineVisitors();
setInterval(updateOnlineVisitors, 10000);
</script>

<?php require_once 'includes/footer.php'; ?>
