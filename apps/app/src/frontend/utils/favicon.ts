const faviconRefreshKey = Date.now().toString(36);

const getHostname = (url: string) => {
  let hostname = url;

  try {
    const urlObj = new URL(url);
    hostname = urlObj.hostname;
  } catch {
    try {
      hostname = new URL(`https://${url}`).hostname;
    } catch {
      // Keep the original value so the fallback service can handle it.
    }
  }

  return hostname;
};

export const getWebsiteFaviconUrl = (url: string, refreshKey = faviconRefreshKey) => {
  const hostname = getHostname(url);
  return `https://${hostname}/favicon.ico?insight-refresh=${encodeURIComponent(refreshKey)}`;
};

export const getFaviconUrl = (url: string, size = 64) => {
  const hostname = getHostname(url);

  const baseUrl = (import.meta.env.VITE_INSIGHT_FAVICON_API_URL || 'https://favicon.vemetric.com').replace(/\/$/, '');
  return `${baseUrl}/${hostname}?size=${size}`;
};
