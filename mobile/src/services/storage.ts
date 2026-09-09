import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "access_token";
const API_URL_KEY = "api_base_url";
const PRODUCT_CACHE_KEY = "verified_product_cache_v1";
const NOTIFICATION_CACHE_KEY = "notification_cache_v1";

export type CachedProduct = {
  lookupKeys: string[];
  product: any;
  cachedAt: string;
};

export type AppNotification = {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  readAt?: string | null;
  createdAt: string;
  product?: {
    id: string;
    productName: string;
    batchNumber: string;
    category: string;
  } | null;
};

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const saveApiBaseUrl = async (url: string) => {
  await AsyncStorage.setItem(API_URL_KEY, url.replace(/\/$/, ""));
};

export const getApiBaseUrl = async () => {
  return AsyncStorage.getItem(API_URL_KEY);
};

const readProductCache = async (): Promise<CachedProduct[]> => {
  const value = await AsyncStorage.getItem(PRODUCT_CACHE_KEY);
  if (!value) return [];

  try {
    return JSON.parse(value) as CachedProduct[];
  } catch {
    return [];
  }
};

export const getCachedProducts = async () => readProductCache();

export const cacheVerifiedProduct = async (lookupValue: string, product: any) => {
  const keys = [
    lookupValue,
    product?.qrCode,
    product?.productCode,
    product?.barcode,
    product?.batchNumber,
    product?.id,
  ]
    .filter(Boolean)
    .map(value => String(value).trim().toLowerCase());
  const existing = await readProductCache();
  const unique = existing.filter(item =>
    !item.lookupKeys.some(key => keys.includes(key)),
  );
  const entry: CachedProduct = {
    lookupKeys: Array.from(new Set(keys)),
    product,
    cachedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(
    PRODUCT_CACHE_KEY,
    JSON.stringify([entry, ...unique].slice(0, 50)),
  );
  return entry;
};

export const getCachedProduct = async (lookupValue: string) => {
  const key = lookupValue.trim().toLowerCase();
  const cache = await readProductCache();
  return cache.find(item => item.lookupKeys.includes(key)) || null;
};

export const cacheNotifications = async (notifications: AppNotification[]) => {
  await AsyncStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(notifications.slice(0, 100)));
};

export const getCachedNotifications = async (): Promise<AppNotification[]> => {
  const value = await AsyncStorage.getItem(NOTIFICATION_CACHE_KEY);
  if (!value) return [];
  try {
    return JSON.parse(value) as AppNotification[];
  } catch {
    return [];
  }
};

export const markCachedNotificationRead = async (id: string) => {
  const notifications = await getCachedNotifications();
  const now = new Date().toISOString();
  const updated = notifications.map(item => item.id === id ? {...item, readAt: item.readAt || now} : item);
  await cacheNotifications(updated);
  return updated;
};

export const markAllCachedNotificationsRead = async () => {
  const notifications = await getCachedNotifications();
  const now = new Date().toISOString();
  const updated = notifications.map(item => ({...item, readAt: item.readAt || now}));
  await cacheNotifications(updated);
  return updated;
};
