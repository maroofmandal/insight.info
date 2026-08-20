---
title: User identification
description: Connect anonymous activity to a stable product user.
category: Product analytics
order: 12
---

Identify a user after authentication or when your application has a stable internal ID.

```ts
Vemetric.identify({
  id: currentUser.id,
  name: currentUser.displayName,
  email: currentUser.email,
});
```

Use the minimum attributes needed by your team and avoid IDs that change between sessions.
