---
title: Installation
description: Add Insight.info to a site or application and verify the first event.
category: Start here
order: 1
---

Create a project in Insight.info, copy its project token, and choose the guide for your stack. Existing `@vemetric/*` SDK names remain unchanged for compatibility.

## Browser setup

```html
<script
  defer
  src="https://cdn.jsdelivr.net/npm/@vemetric/web@latest/dist/vemetric.min.js"
  data-token="YOUR_PROJECT_TOKEN"
  data-api-url="https://hub.insight.info"
></script>
```

Keep the event hub configurable in self-hosted deployments. After loading a page, open the project dashboard and confirm that the page view appears.

## Next steps

- [Track a custom event](/docs/product-analytics/tracking-custom-events)
- [Identify a user](/docs/product-analytics/user-identification)
- [Use a first-party proxy](/docs/advanced/using-a-proxy)
