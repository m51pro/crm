const devApiUrl = "/api" ;
const defaultProdApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const getApiUrl = () => {
  if (import.meta.env.DEV) return devApiUrl;
  // @ts-expect-error - desktopApp might be injected by Electron preload
  if (window.desktopApp?.apiUrl) return window.desktopApp.apiUrl;
  return defaultProdApiUrl;
};

export const API_URL = getApiUrl().replace(/\/$/, "");

export const apiFetch = async (path: string, init?: RequestInit) => {
  const baseUrl = getApiUrl().replace(/\/$/, "");
  return fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, init);
};
