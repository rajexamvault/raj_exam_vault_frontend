export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // When accessed from browser/devices via LAN IP (192.168.x.x, 10.x.x.x, 172.x.x.x)
    if (/^(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)$/.test(hostname)) {
      return `http://${hostname}:5000/api`;
    }
  }
  const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api').trim().replace(/\/+$/, '');
  const resolvedUrl = rawUrl.replace('http://localhost:5000', 'http://127.0.0.1:5000');
  return resolvedUrl.endsWith('/api') ? resolvedUrl : `${resolvedUrl}/api`;
}

const API_BASE_URL = {
  toString() {
    return getApiBaseUrl();
  },
  valueOf() {
    return getApiBaseUrl();
  },
  [Symbol.toPrimitive]() {
    return getApiBaseUrl();
  }
};

export default API_BASE_URL;