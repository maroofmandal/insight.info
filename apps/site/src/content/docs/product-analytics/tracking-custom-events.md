---
title: Track custom events
description: Record meaningful product actions with useful properties.
category: Product analytics
order: 11
---

```ts
import { Vemetric } from '@vemetric/web';

Vemetric.trackEvent('project_created', {
  source: 'onboarding',
  template: 'blank',
});
```

Names should describe completed actions. Avoid placing secrets, raw payment details or unnecessary personal information in properties.
