---
title: API onboarding
description: Authenticate a server integration and send its first event.
category: API
order: 20
---

Copy a project token from project settings and store it as a server-side secret. Send events to the configured Insight event hub, which defaults to `https://hub.insight.info` in production.

Do not embed a privileged server credential in public client code. Use the browser SDK token intended for frontend ingestion, or proxy requests through your backend.
