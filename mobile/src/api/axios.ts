import axios from "axios";
import { Platform } from "react-native";
import { getApiBaseUrl, getToken } from "../services/storage";

// Android emulators reach the host through 10.0.2.2, while the iOS simulator
// can use localhost. Physical devices should replace this with the computer's
// LAN address (for example http://192.168.1.10:5001/api).
export const DEFAULT_BASE_URL = Platform.select({
  android: "http://10.0.2.2:5001/api",
  ios: "http://localhost:5001/api",
  default: "http://localhost:5001/api",
});

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

  config.baseURL = savedBaseUrl || DEFAULT_BASE_URL;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
