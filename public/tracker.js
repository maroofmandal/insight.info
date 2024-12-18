(() => {
    const INSIGHT_URL = 'https://insight.info';
    let lastPing = Date.now();
    let counterElements = [];

    function getSystemInfo() {
        const ua = navigator.userAgent;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        
        // Browser detection
        let browser = 'Unknown';
        let browserVersion = '';
        
        if (ua.includes('Firefox/')) {
            browser = 'Firefox';
            browserVersion = ua.match(/Firefox\/([\d.]+)/)[1];
        } else if (ua.includes('Chrome/')) {
            browser = 'Chrome';
            browserVersion = ua.match(/Chrome\/([\d.]+)/)[1];
        } else if (ua.includes('Safari/')) {
            browser = 'Safari';
            browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
        } else if (ua.includes('Edge/')) {
            browser = 'Edge';
            browserVersion = ua.match(/Edge\/([\d.]+)/)[1];
        }

        // OS detection
        let os = 'Unknown';
        let osVersion = '';

        if (ua.includes('Windows')) {
            os = 'Windows';
            osVersion = ua.match(/Windows NT ([\d.]+)/)[1];
        } else if (ua.includes('Mac OS X')) {
            os = 'macOS';
            osVersion = ua.match(/Mac OS X ([\d_]+)/)[1].replace(/_/g, '.');
        } else if (ua.includes('Linux')) {
            os = 'Linux';
        }

        return {
            browser,
            browserVersion,
            os,
            osVersion,
            screenResolution,
            referrer: document.referrer,
            pageUrl: window.location.href
        };
    }

    function sendVisit() {
        const systemInfo = getSystemInfo();
        const domain = document.currentScript.src.match(/domain=([^&]+)/)[1];

        fetch(`${INSIGHT_URL}/api/track.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                domain,
                ...systemInfo
            }),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            updateCounters(data);
        })
        .catch(console.error);
    }

    function updateCounters(data) {
        counterElements.forEach(element => {
            let html = '';
            if (element.dataset.showOnline) {
                html += `<div>Online: ${data.online}</div>`;
            }
            if (element.dataset.showToday) {
                html += `<div>Today: ${data.today}</div>`;
            }
            if (element.dataset.showTotal) {
                html += `<div>Total: ${data.total}</div>`;
            }
            element.innerHTML = html;
        });
    }

    function ping() {
        if (Date.now() - lastPing > 30000) { // Ping every 30 seconds
            sendVisit();
            lastPing = Date.now();
        }
    }

    function init() {
        counterElements = document.getElementsByClassName('insight-counter');
        sendVisit();
        setInterval(ping, 30000);

        // Track when user leaves the page
        window.addEventListener('beforeunload', () => {
            navigator.sendBeacon(`${INSIGHT_URL}/api/offline.php`);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
