---
title: Frequently asked questions
description: Common answers about privacy, SDK compatibility and event usage.
category: Start here
order: 3
---

## Is this Vemetric?

Insight.info is a distinct product fork built from the AGPL-licensed Vemetric project. It retains upstream attribution and compatibility identifiers where changing them would break existing integrations.

## Which SDK should I install?

Use the published Vemetric-compatible SDK for your platform and configure its host as `https://insight.info`. Browser packages should load `https://insight.info/insight.min.js` instead of the upstream CDN.

## Does a missing public timespan redirect?

No. A public dashboard without `t` behaves as a 24-hour view, but the browser is not redirected. Generated links explicitly include `?t=24hrs`.

## Can I self-host?

The source remains available under the AGPL license. Review the repository documentation and configure all origins, storage, queues and billing dependencies for your deployment.
