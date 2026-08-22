import { describe, expect, it } from 'vitest';
import { isMarketingPath, isSiteAssetPath } from './marketing-routes';

describe('isMarketingPath', () => {
  it.each(['/', '/pricing', '/docs', '/docs/installation', '/blog/introducing-insight-info', '/legal/privacy-policy'])(
    'reserves %s for the marketing site',
    (path) => expect(isMarketingPath(path)).toBe(true),
  );

  it.each(['/app', '/login', '/outbid.lol', '/public/outbid.lol'])('keeps %s in the analytics application', (path) =>
    expect(isMarketingPath(path)).toBe(false),
  );
});

describe('isSiteAssetPath', () => {
  const assets = new Set(['/favicon.ico']);

  it.each(['/_astro/page.css', '/images/founder-maroof.png', '/images/reference/dashboard.webp', '/favicon.ico'])(
    'serves localized marketing asset %s',
    (path) => expect(isSiteAssetPath(path, assets)).toBe(true),
  );

  it('does not take over application assets', () => {
    expect(isSiteAssetPath('/assets/app.js', assets)).toBe(false);
  });
});
