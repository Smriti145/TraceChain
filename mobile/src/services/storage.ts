import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "access_token";
const API_URL_KEY = "api_base_url";

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
