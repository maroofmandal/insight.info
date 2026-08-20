---
title: JavaScript
description: Install and initialize the browser SDK from npm.
category: SDKs
order: 42
---

```bash
npm install @vemetric/web
```

```ts
import { vemetric } from '@vemetric/web';

vemetric.init({
  token: 'YOUR_PROJECT_TOKEN',
  host: 'https://insight.info',
  scriptUrl: 'https://insight.info/insight.min.js',
});
vemetric.trackEvent('application_opened');
```
