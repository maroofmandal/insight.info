import type { TimeSpan } from './charts/timespans';

export const DEFAULT_PUBLIC_DASHBOARD_TIMESPAN: TimeSpan = '24hrs';

export function getPublicDashboardPath(domain: string, timespan: TimeSpan = DEFAULT_PUBLIC_DASHBOARD_TIMESPAN) {
  return `/${encodeURIComponent(domain)}?t=${encodeURIComponent(timespan)}`;
}

export function getPublicDashboardUrl(
  domain: string,
  origin = 'https://insight.info',
  timespan: TimeSpan = DEFAULT_PUBLIC_DASHBOARD_TIMESPAN,
) {
  return `${origin.replace(/\/$/, '')}${getPublicDashboardPath(domain, timespan)}`;
}

export function getLegacyPublicDashboardRedirect(domain: string, searchString = ''): string {
  const search = new URLSearchParams(searchString.replace(/^\?/, ''));
  if (!search.has('t')) search.set('t', DEFAULT_PUBLIC_DASHBOARD_TIMESPAN);
  return `/${encodeURIComponent(domain)}?${search.toString()}`;
}
