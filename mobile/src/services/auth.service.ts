import api from "../api/axios";

export const login = async (
  email: string,
  password: string
) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  return response.data;
};

export const register = async (name: string, email: string, password: string, accountType: "CUSTOMER" | "BUSINESS") => {
  const response = await api.post("/auth/register", {name, email, password, accountType});
  return response.data;
};

export const getMyAccount = async () => {
  const response = await api.get("/auth/me");
  return response.data.user;
};

export const getGoogleClientId = async (): Promise<string | null> => {
  const response = await api.get("/auth/google/config");
  return response.data.clientId || null;
};

export const loginWithGoogleToken = async (idToken: string) => {
  const response = await api.post("/auth/google", {idToken});
  return response.data;
};

export const linkGoogleToken = async (idToken: string) => {
  const response = await api.post("/auth/google/link", {idToken});
  return response.data;
};
