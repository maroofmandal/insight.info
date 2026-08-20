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
import { Vemetric } from '@vemetric/web';

Vemetric.init({ token: 'YOUR_PROJECT_TOKEN', apiUrl: 'https://hub.insight.info' });
Vemetric.trackEvent('application_opened');
```
