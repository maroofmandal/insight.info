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
  src="https://insight.info/insight.min.js"
  data-token="YOUR_PROJECT_TOKEN"
  data-host="https://insight.info"
></script>
```

The deferred script does not block HTML parsing. Insight.info serves this pinned SDK directly and accepts its events on clean main-origin endpoints.
