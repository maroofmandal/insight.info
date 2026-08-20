import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getBaseDomain, getFaviconApiUrl, getInsightToken, getInsightUrl, getSourceUrl } from '../src/env';

const keys = [
  'INSIGHT_BASE_DOMAIN',
  'VEMETRIC_BASE_DOMAIN',
  'DOMAIN',
  'INSIGHT_SITE_URL',
  'VEMETRIC_SITE_URL',
  'INSIGHT_APP_URL',
  'VEMETRIC_APP_URL',
  'INSIGHT_HUB_URL',
  'VEMETRIC_HUB_URL',
  'INSIGHT_SINGLE_ORIGIN',
  'INSIGHT_TOKEN',
  'VEMETRIC_TOKEN',
  'INSIGHT_FAVICON_API_URL',
  'VEMETRIC_FAVICON_API_URL',
  'INSIGHT_SOURCE_URL',
  'VEMETRIC_SOURCE_URL',
] as const;

const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

beforeEach(() => keys.forEach((key) => delete process.env[key]));
afterEach(() =>
  keys.forEach((key) => {
    const value = original[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }),
);

describe('Insight configuration aliases', () => {
  it('prefers Insight values over legacy aliases', () => {
    process.env.INSIGHT_TOKEN = 'insight';
    process.env.VEMETRIC_TOKEN = 'legacy';
    process.env.INSIGHT_BASE_DOMAIN = 'insight.info';
    process.env.VEMETRIC_BASE_DOMAIN = 'legacy.example';
    process.env.INSIGHT_HUB_URL = 'https://events.insight.info/';
    process.env.VEMETRIC_HUB_URL = 'https://legacy.example';

    expect(getInsightToken()).toBe('insight');
    expect(getBaseDomain()).toBe('insight.info');
    expect(getInsightUrl('hub')).toBe('https://events.insight.info');
  });

  it('falls back to legacy aliases', () => {
    process.env.VEMETRIC_TOKEN = 'legacy';
    process.env.VEMETRIC_SITE_URL = 'https://legacy.example/';
    process.env.VEMETRIC_FAVICON_API_URL = 'https://favicons.example/';
    process.env.VEMETRIC_SOURCE_URL = 'https://github.com/example/source';

    expect(getInsightToken()).toBe('legacy');
    expect(getInsightUrl()).toBe('https://legacy.example');
    expect(getFaviconApiUrl()).toBe('https://favicons.example');
    expect(getSourceUrl()).toBe('https://github.com/example/source');
  });

  it('derives single-origin production app URLs and a configurable hub subdomain', () => {
    process.env.INSIGHT_BASE_DOMAIN = 'insight.info';

    expect(getInsightUrl()).toBe('https://insight.info');
    expect(getInsightUrl('app')).toBe('https://insight.info');
    expect(getInsightUrl('backend')).toBe('https://insight.info');
    expect(getInsightUrl('hub')).toBe('https://hub.insight.info');
  });
});
