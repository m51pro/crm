const rawApiUrl = import.meta.env.VITE_API_URL || "/api";

export const API_URL = rawApiUrl.replace(/\/$/, "");

export const apiFetch = (path: string, init?: RequestInit) =>
  fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, init);
