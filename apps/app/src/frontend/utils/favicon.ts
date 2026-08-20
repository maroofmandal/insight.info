export const getFaviconUrl = (url: string, size = 64) => {
  let hostname = url;

  try {
    const urlObj = new URL(url);
    hostname = urlObj.hostname;
  } catch {
    // empty
  }

  const baseUrl = (import.meta.env.VITE_INSIGHT_FAVICON_API_URL || 'https://favicon.vemetric.com').replace(/\/$/, '');
  return `${baseUrl}/${hostname}?size=${size}`;
};
