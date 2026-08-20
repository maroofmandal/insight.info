const MARKETING_ROUTES = new Set([
  '/',
  '/pricing',
  '/about',
  '/customers',
  '/changelog',
  '/blog',
  '/favicon-api',
  '/docs',
  '/legal/terms-of-service',
  '/legal/privacy-policy',
  '/legal/cookie-policy',
]);

const MARKETING_PREFIXES = ['/blog/', '/docs/'];

export const isMarketingPath = (pathname: string): boolean =>
  MARKETING_ROUTES.has(pathname) || MARKETING_PREFIXES.some((prefix) => pathname.startsWith(prefix));
