---
title: React
description: Add Insight.info to a React component tree.
category: SDKs
order: 43
---

```bash
npm install @vemetric/react
```

Load the compatible component once near the application root:

```tsx
<VemetricScript
  token="YOUR_PROJECT_TOKEN"
  host="https://insight.info"
  scriptUrl="https://insight.info/insight.min.js"
/>
```

Track actions from handlers after the action succeeds, rather than when a button merely receives a click.
