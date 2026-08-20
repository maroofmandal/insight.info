export function getHostname() {
  return location.hostname.split('.').slice(-2).join('.');
}

type SubDomain = 'app' | 'hub';

function getUrl(subDomain?: SubDomain) {
  const hostname = getHostname();
  const subDomainPrefix = subDomain ? `${subDomain}.` : '';
  const port = Number(location.port);
  let portSuffix = '';
  if (!isNaN(port) && port !== 80 && port !== 443 && port !== 0) {
    portSuffix = `:${port}`;
  }
  return `${location.protocol}//${subDomainPrefix}${hostname}${portSuffix}`;
}

export function getLandingPageUrl() {
  return import.meta.env.VITE_INSIGHT_SITE_URL || getUrl();
}

export function getAppUrl() {
  if (import.meta.env.VITE_INSIGHT_APP_URL) return import.meta.env.VITE_INSIGHT_APP_URL;
  if (import.meta.env.VITE_INSIGHT_SINGLE_ORIGIN === 'true' || !location.hostname.includes('localhost')) {
    return location.origin;
  }
  return getUrl('app');
}

export function getBackendUrl() {
  return location.origin;
}

export function getHubUrl() {
  return import.meta.env.VITE_INSIGHT_HUB_URL || getUrl('hub');
}

export function formatQueryParams(params: Record<string, any>): string {
  const entries = Object.entries(params);
  if (entries.length === 0) return '';
  const queryString = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `?${queryString}`;
}
