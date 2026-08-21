import { describe, expect, it } from 'vitest';
import { FREE_PLAN_EVENTS, PUBLIC_PRICING_TIERS, YEARLY_MONTHS_CHARGED } from '../src/pricing';

describe('public pricing', () => {
  it('provides the requested 100x event allowance', () => {
    expect(FREE_PLAN_EVENTS).toBe(250_000);
    expect(PUBLIC_PRICING_TIERS.map((tier) => tier.events)).toEqual([
      1_000_000, 10_000_000, 25_000_000, 50_000_000, 100_000_000, 250_000_000, 500_000_000,
    ]);
  });

  it('charges ten monthly prices for yearly billing', () => {
    expect(YEARLY_MONTHS_CHARGED).toBe(10);
  });
});
