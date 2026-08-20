---
title: SDK overview
description: Select a Vemetric-compatible SDK and connect it to Insight.info.
category: SDKs
order: 40
---

Insight.info retains the published `@vemetric/*` package names because integrations and package registries depend on those identifiers. These references describe compatibility; they do not imply that Insight.info owns the upstream packages.

Configure the SDK token from your project, set its host to `https://insight.info`, and configure `scriptUrl: 'https://insight.info/insight.min.js'` for packages that dynamically load the browser bundle. No analytics subdomain or third-party CDN is required.
