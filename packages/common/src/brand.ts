export const BRAND = {
  name: 'Insight.info',
  shortName: 'Insight',
  domain: 'insight.info',
  siteUrl: 'https://insight.info',
  contactEmail: 'info@insight.info',
  description: 'Privacy-conscious web and product analytics for clear, actionable insight.',
  sourceUrl: 'https://github.com/vemetric/vemetric',
  upstreamName: 'Vemetric',
  upstreamUrl: 'https://vemetric.com',
} as const;

export const BRAND_COLORS = {
  purple: '#7c3aed',
  purpleLight: '#a78bfa',
  purpleDark: '#5b21b6',
  ink: '#17131f',
  paper: '#fbfaff',
} as const;

export const LEGAL_REQUIRED_FIELDS = ['legalEntityName', 'registeredAddress', 'jurisdiction', 'effectiveDate'] as const;

export type LegalRequiredField = (typeof LEGAL_REQUIRED_FIELDS)[number];

export interface LegalConfig {
  status: 'draft' | 'published';
  legalEntityName?: string;
  registeredAddress?: string;
  jurisdiction?: string;
  effectiveDate?: string;
  contactEmail: string;
}

export function isLegalConfigPublishable(config: LegalConfig): boolean {
  return config.status === 'published' && LEGAL_REQUIRED_FIELDS.every((field) => Boolean(config[field]?.trim()));
}
