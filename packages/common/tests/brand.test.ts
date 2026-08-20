import { describe, expect, it } from 'vitest';
import { isLegalConfigPublishable } from '../src/brand';
import {
  getLegacyPublicDashboardRedirect,
  getPublicDashboardPath,
  getPublicDashboardUrl,
} from '../src/public-dashboard';

describe('Insight brand helpers', () => {
  it('builds the canonical generated public dashboard URL', () => {
    expect(getPublicDashboardPath('outbid.lol')).toBe('/outbid.lol?t=24hrs');
    expect(getPublicDashboardUrl('outbid.lol')).toBe('https://insight.info/outbid.lol?t=24hrs');
  });

  it('preserves legacy filters and only supplies a missing timespan', () => {
    expect(getLegacyPublicDashboardRedirect('outbid.lol', '?f=country&t=7days')).toBe('/outbid.lol?f=country&t=7days');
    expect(getLegacyPublicDashboardRedirect('outbid.lol', '?f=country')).toBe('/outbid.lol?f=country&t=24hrs');
  });

  it('keeps legal drafts unpublished until every required field is present', () => {
    expect(isLegalConfigPublishable({ status: 'draft', contactEmail: 'info@insight.info' })).toBe(false);
    expect(
      isLegalConfigPublishable({
        status: 'published',
        contactEmail: 'info@insight.info',
        legalEntityName: 'Insight Analytics Ltd',
        registeredAddress: 'Example address',
        jurisdiction: 'Example jurisdiction',
        effectiveDate: '2026-08-20',
      }),
    ).toBe(true);
  });
});
