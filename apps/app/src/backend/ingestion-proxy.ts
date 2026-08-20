import { getInternalHubUrl } from '@vemetric/common/env';
import { Hono } from 'hono';

export const INGESTION_PATHS = ['/e', '/i', '/u', '/r', '/l'] as const;

export function createIngestionProxyApp() {
  const ingestion = new Hono();

  for (const path of INGESTION_PATHS) {
    ingestion.all(path, async (c) => {
      const requestUrl = new URL(c.req.url);
      const targetUrl = `${getInternalHubUrl()}${requestUrl.pathname}${requestUrl.search}`;
      const headers = new Headers(c.req.raw.headers);
      headers.delete('host');
      headers.delete('content-length');
      headers.set('x-forwarded-host', requestUrl.host);
      headers.set('x-forwarded-proto', requestUrl.protocol.replace(':', ''));

      try {
        return await fetch(targetUrl, {
          method: c.req.method,
          headers,
          body: c.req.method === 'GET' || c.req.method === 'HEAD' ? undefined : await c.req.raw.arrayBuffer(),
          redirect: 'manual',
        });
      } catch {
        return c.text('Event ingestion is temporarily unavailable', 502);
      }
    });
  }

  return ingestion;
}
