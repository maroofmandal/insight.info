export function getDevProxyPort(): number {
  const port = Number(process.env.INSIGHT_DEV_PROXY_PORT ?? process.env.VEMETRIC_DEV_PROXY_PORT);
  return isNaN(port) ? 4050 : port;
}

export function getDevProxyPortExtension(): string {
  const port = getDevProxyPort();
  return port === 80 ? '' : `:${port}`;
}

export function getBaseDomain(): string {
  return (
    process.env.INSIGHT_BASE_DOMAIN ||
    process.env.VEMETRIC_BASE_DOMAIN ||
    process.env.DOMAIN ||
    `insight.localhost${getDevProxyPortExtension()}`
  );
}

type SubDomain = 'app' | 'backend' | 'hub';

const getExplicitServiceUrl = (subDomain?: SubDomain): string | undefined => {
  if (!subDomain) return process.env.INSIGHT_SITE_URL || process.env.VEMETRIC_SITE_URL;
  if (subDomain === 'app') return process.env.INSIGHT_APP_URL || process.env.VEMETRIC_APP_URL;
  if (subDomain === 'hub') return process.env.INSIGHT_HUB_URL || process.env.VEMETRIC_HUB_URL;
  return process.env.INSIGHT_BACKEND_URL || process.env.VEMETRIC_BACKEND_URL;
};

export function getInsightUrl(subDomain?: SubDomain): string {
  const explicitUrl = getExplicitServiceUrl(subDomain);
  if (explicitUrl) return explicitUrl.replace(/\/$/, '');

  const baseDomain = getBaseDomain();
  const protocol = baseDomain.includes('localhost') ? 'http' : 'https';
  const singleOrigin =
    process.env.INSIGHT_SINGLE_ORIGIN === 'true' ||
    (process.env.INSIGHT_SINGLE_ORIGIN !== 'false' && !baseDomain.includes('localhost'));
  const subDomainPrefix =
    subDomain && !(singleOrigin && (subDomain === 'app' || subDomain === 'backend')) ? `${subDomain}.` : '';
  return `${protocol}://${subDomainPrefix}${baseDomain}`;
}

/** @deprecated Kept for upstream package compatibility. */
export const getVemetricUrl = getInsightUrl;

export function getInsightToken(): string | undefined {
  return process.env.INSIGHT_TOKEN ?? process.env.VEMETRIC_TOKEN;
}

export function getFaviconApiUrl(): string {
  return (
    process.env.INSIGHT_FAVICON_API_URL ||
    process.env.VEMETRIC_FAVICON_API_URL ||
    'https://favicon.vemetric.com'
  ).replace(/\/$/, '');
}

export function getSourceUrl(): string {
  return process.env.INSIGHT_SOURCE_URL || process.env.VEMETRIC_SOURCE_URL || 'https://github.com/vemetric/vemetric';
}
