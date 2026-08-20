import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('first-party browser SDK asset', () => {
  it('is identical across the app and site and contains no remote runtime host', async () => {
    const appBundle = await readFile(new URL('../../public/insight.min.js', import.meta.url), 'utf8');
    const siteBundle = await readFile(new URL('../../../site/public/insight.min.js', import.meta.url), 'utf8');

    expect(appBundle).toBe(siteBundle);
    expect(appBundle).toContain('https://insight.info');
    expect(appBundle).not.toContain('cdn.jsdelivr.net');
    expect(appBundle).not.toContain('cdn.vemetric.com');
    expect(appBundle).not.toContain('hub.vemetric.com');
  });
});
