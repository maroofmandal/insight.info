import { describe, expect, it } from 'vitest';
import { resolveAppEntry } from '../src/app-entry';

describe('resolveAppEntry', () => {
  it('sends a new account to organization onboarding', () => {
    expect(resolveAppEntry([])).toEqual({ type: 'organization-onboarding' });
  });

  it('opens the first organization for an existing account', () => {
    expect(resolveAppEntry([{ id: 'org-1' }, { id: 'org-2' }])).toEqual({
      type: 'organization',
      organizationId: 'org-1',
    });
  });
});
