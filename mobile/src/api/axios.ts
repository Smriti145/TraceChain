import axios from "axios";
import { getApiBaseUrl, getToken } from "../services/storage";

// The distributable app must work without a laptop or local network. Developers
// can still select a local endpoint from Connection settings in debug builds.
export const DEFAULT_BASE_URL = "https://tracechain-mvp.onrender.com/api";

export const normalizeApiBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;
  return /\/api$/i.test(withProtocol) ? withProtocol : `${withProtocol}/api`;
};

const api = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async config => {
  const [token, savedBaseUrl] = await Promise.all([getToken(), getApiBaseUrl()]);

  // Never let an old plain-HTTP/LAN override break an installed release APK.
  // HTTPS overrides remain supported for future staging/production services.
  const canUseSavedUrl = savedBaseUrl && (__DEV__ || savedBaseUrl.startsWith("https://"));
  config.baseURL = canUseSavedUrl ? savedBaseUrl : DEFAULT_BASE_URL;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
