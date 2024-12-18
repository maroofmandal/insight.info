<?php
require_once 'config/config.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insight.info - Website Traffic Analytics</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .hero-section {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            padding: 100px 0;
        }
        .feature-icon {
            font-size: 2.5rem;
            color: #6e8efb;
            margin-bottom: 1rem;
        }
        .code-box {
            background: #f8f9fa;
            border-radius: 5px;
            padding: 20px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="/">Insight.info</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#features">Features</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#demo">Demo</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <section class="hero-section">
        <div class="container text-center">
            <h1 class="display-4 mb-4">Track Your Website Traffic</h1>
            <p class="lead mb-4">Get detailed insights about your website visitors, traffic patterns, and user behavior.</p>
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <form id="domainForm" class="mb-4">
                        <div class="input-group">
                            <input type="text" class="form-control form-control-lg" id="domain" 
                                   placeholder="Enter your domain (e.g., example.com)" required>
                            <button class="btn btn-light btn-lg" type="submit">Get Counter Code</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <div class="container my-5" id="codeSection" style="display: none;">
        <div class="row">
            <div class="col-md-12">
                <h3>Add this code to your website</h3>
                <div class="code-box">
                    <h5>Add to &lt;head&gt; section:</h5>
                    <pre id="headCode" class="bg-light p-3"></pre>
                    <button class="btn btn-primary btn-sm copy-btn" data-target="headCode">Copy Code</button>
                </div>
                <div class="code-box mt-4">
                    <h5>Add to &lt;body&gt; section where you want to display the counter:</h5>
                    <pre id="bodyCode" class="bg-light p-3"></pre>
                    <button class="btn btn-primary btn-sm copy-btn" data-target="bodyCode">Copy Code</button>
                </div>
            </div>
        </div>
    </div>

    <section class="container my-5" id="features">
        <h2 class="text-center mb-5">Features</h2>
        <div class="row g-4">
            <div class="col-md-4">
                <div class="text-center">
                    <i class="fas fa-chart-line feature-icon"></i>
                    <h4>Real-time Analytics</h4>
                    <p>Track visitors in real-time with detailed analytics and insights.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="text-center">
                    <i class="fas fa-globe feature-icon"></i>
                    <h4>Global Tracking</h4>
                    <p>See where your visitors are coming from with country-wise statistics.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="text-center">
                    <i class="fas fa-desktop feature-icon"></i>
                    <h4>System Info</h4>
                    <p>Get detailed information about browsers, operating systems, and screen resolutions.</p>
                </div>
            </div>
        </div>
    </section>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        $(document).ready(function() {
            $('#domainForm').on('submit', function(e) {
                e.preventDefault();
                const domain = $('#domain').val().trim();
                if (domain) {
                    const headCode = `<script src="https://insight.info/tracker.js?domain=${domain}" async><\/script>`;
                    const bodyCode = `<div class="insight-counter" data-domain="${domain}"></div>`;
                    
                    $('#headCode').text(headCode);
                    $('#bodyCode').text(bodyCode);
                    $('#codeSection').slideDown();
                }
            });

            $('.copy-btn').on('click', function() {
                const target = $(this).data('target');
                const text = $(`#${target}`).text();
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = $(this).text();
                    $(this).text('Copied!');
                    setTimeout(() => {
                        $(this).text(originalText);
                    }, 2000);
                });
            });
        });
    </script>
</body>
</html>
