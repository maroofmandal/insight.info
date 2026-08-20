export const FREE_PLAN_EVENTS = 2_500;

export interface PublicPricingTier {
  events: number;
  monthlyPrice: number;
}

export const PUBLIC_PRICING_TIERS: readonly PublicPricingTier[] = [
  { events: 10_000, monthlyPrice: 5 },
  { events: 100_000, monthlyPrice: 15 },
  { events: 250_000, monthlyPrice: 25 },
  { events: 500_000, monthlyPrice: 40 },
  { events: 1_000_000, monthlyPrice: 80 },
  { events: 2_500_000, monthlyPrice: 160 },
  { events: 5_000_000, monthlyPrice: 230 },
] as const;

export const YEARLY_MONTHS_CHARGED = 10;

export const PUBLIC_PRICING = {
  freeEvents: FREE_PLAN_EVENTS,
  tiers: PUBLIC_PRICING_TIERS,
  yearlyMonthsCharged: YEARLY_MONTHS_CHARGED,
} as const;
