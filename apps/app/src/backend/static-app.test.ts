import { describe, expect, it } from 'vitest';
import { isMarketingPath } from './marketing-routes';

describe('isMarketingPath', () => {
  it.each(['/', '/pricing', '/docs', '/docs/installation', '/blog/introducing-insight-info', '/legal/privacy-policy'])(
    'reserves %s for the marketing site',
    (path) => expect(isMarketingPath(path)).toBe(true),
  );

  it.each(['/app', '/login', '/outbid.lol', '/public/outbid.lol'])('keeps %s in the analytics application', (path) =>
    expect(isMarketingPath(path)).toBe(false),
  );
});
