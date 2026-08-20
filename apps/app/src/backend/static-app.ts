import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { isMarketingPath } from './marketing-routes';
import { isNoCachePath } from './route-config';

const applyIndexHtmlCacheHeaders = (c: { header: (name: string, value: string) => void }) => {
  c.header('Cache-Control', 'no-cache');
  c.header('X-Frame-Options', 'DENY');
};

const setCacheHeaders = (pathname: string, c: { header: (name: string, value: string) => void }) => {
  if (pathname.startsWith('/assets/') || pathname.startsWith('/_astro/') || pathname.startsWith('/workbox-')) {
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (pathname === '/' || pathname === '/index.html') {
    applyIndexHtmlCacheHeaders(c);
  } else if (isNoCachePath(pathname)) {
    c.header('Cache-Control', 'no-cache');
  } else {
    c.header('Cache-Control', 'public, max-age=3600');
  }
};

const getMarketingHtmlPath = (siteDist: string, pathname: string): string => {
  if (pathname === '/') return `${siteDist}/index.html`;
  return `${siteDist}${pathname}/index.html`;
};

export function createStaticApp() {
  const staticApp = new Hono();

  const webappDist = `${import.meta.dir}/../../dist`;
  const siteDist = `${import.meta.dir}/../../../site/dist`;
  const indexHtmlPath = `${webappDist}/index.html`;
  let indexHtml: string | null = null;

  const siteAssets = new Set([
    '/favicon.ico',
    '/favicon.svg',
    '/logo.svg',
    '/logo-lockup.svg',
    '/og-insight.png',
    '/apple-touch-icon-180x180.png',
    '/pwa-64x64.png',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
    '/maskable-icon-512x512.png',
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap-index.xml',
    '/sitemap-0.xml',
  ]);

  staticApp.get('/topo.json', async (c) => {
    const response = await fetch(process.env.INSIGHT_TOPO_UPSTREAM_URL ?? 'https://assets.vemetric.com/topo.json');
    if (!response.ok) return c.text('Unable to load map data', 502);

    return new Response(response.body, {
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'Content-Type': 'application/json',
      },
    });
  });

  staticApp.use(
    '*',
    serveStatic({
      root: siteDist,
      rewriteRequestPath: (path) =>
        path.startsWith('/_astro/') || siteAssets.has(path) ? path : '/__not-a-site-asset__',
      onFound: (_path, c) => setCacheHeaders(new URL(c.req.url).pathname, c),
    }),
  );

  staticApp.get('*', async (c, next) => {
    const pathname = new URL(c.req.url).pathname.replace(/\/$/, '') || '/';
    if (!isMarketingPath(pathname)) return next();

    const htmlFile = Bun.file(getMarketingHtmlPath(siteDist, pathname));
    if (!(await htmlFile.exists())) return next();

    applyIndexHtmlCacheHeaders(c);
    return c.html(await htmlFile.text());
  });

  staticApp.use(
    '*',
    serveStatic({
      root: webappDist,
      onFound: (_path, c) => {
        const pathname = new URL(c.req.url).pathname;
        setCacheHeaders(pathname, c);
      },
    }),
  );

  staticApp.get('*', async (c) => {
    const accept = c.req.header('accept') ?? '';
    if (accept.includes('text/html')) {
      if (!indexHtml) {
        indexHtml = await Bun.file(indexHtmlPath).text();
      }
      applyIndexHtmlCacheHeaders(c);
      return c.html(indexHtml);
    }

    return c.text('Not Found', 404);
  });

  return staticApp;
}
