---
title: HTML script
description: Add the lightweight browser tracker without a build step.
category: SDKs
order: 41
---

Add the script before the closing `</head>` tag and replace the token:

```html
<script
  defer
  src="https://cdn.jsdelivr.net/npm/@vemetric/web@latest/dist/vemetric.min.js"
  data-token="YOUR_PROJECT_TOKEN"
  data-api-url="https://hub.insight.info"
></script>
```

The deferred script does not block HTML parsing.
