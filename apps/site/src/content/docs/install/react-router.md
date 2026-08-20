---
title: React Router
description: Track navigation and actions in a React Router application.
category: Install guides
order: 53
---

Mount the analytics provider above the router. In a small component under the router, observe location changes and send a page view when `pathname` or the allowed search string changes.

Do not include secret or personally sensitive query parameters in the tracked URL.
