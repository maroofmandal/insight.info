import { Hono } from 'hono';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerIngestionProxyRoutes } from './ingestion-proxy';

function createTestApp() {
  const app = new Hono();
  registerIngestionProxyRoutes(app);
  app.get('/login', (c) => c.text('SPA fallback'));
  return app;
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.INSIGHT_HUB_INTERNAL_URL;
});

describe('single-origin ingestion proxy', () => {
  it('forwards clean root event paths to the private hub service', async () => {
    process.env.INSIGHT_HUB_INTERNAL_URL = 'http://hub:4004/';
    let forwardedUrl = '';
    let forwardedBody = '';

    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        forwardedUrl = String(input);
        forwardedBody = await new Response(init?.body).text();
        return new Response('accepted', { status: 202 });
      }),
    );

    const response = await createTestApp().request('https://insight.info/e?source=test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', token: 'public-token' },
      body: JSON.stringify({ name: 'smoke-test' }),
    });

    expect(response.status).toBe(202);
    expect(await response.text()).toBe('accepted');
    expect(forwardedUrl).toBe('http://hub:4004/e?source=test');
    expect(forwardedBody).toBe(JSON.stringify({ name: 'smoke-test' }));
  });

  it('lets unrelated paths continue to the parent application', async () => {
    const response = await createTestApp().request('https://insight.info/login');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('SPA fallback');
  });
});
