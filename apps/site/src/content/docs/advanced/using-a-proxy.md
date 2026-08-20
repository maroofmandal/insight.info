---
title: Use a first-party proxy
description: Route browser analytics through an endpoint on your own domain.
category: Advanced
order: 30
---

A proxy can keep analytics traffic on your application domain and centralize transport controls. Forward only the required ingestion path to the Insight event hub and preserve request bodies and content types.

Configure the SDK API URL to your proxy endpoint. Add rate limits, request-size limits and an explicit destination rather than a general-purpose open proxy.
