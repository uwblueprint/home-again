import axios, { type AxiosInstance } from "axios";

import { config } from "@/common/constants/config";
import { getToken, useAuthStore } from "@/common/stores/authStore";

export type TokenGetter = () => string | null;

export type ApiClientOptions = {
  getToken: TokenGetter;
  /** Clear auth and send the user to /login when the backend rejects the token. */
  onUnauthorized?: () => void | Promise<void>;
};

export function createApiClient(options: ApiClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: config.api.baseUrl,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use((requestConfig) => {
    const token = options.getToken();
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await options.onUnauthorized?.();
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const apiClient = createApiClient({
  getToken,
  onUnauthorized: () => useAuthStore.getState().signOut(),
});

export default apiClient;
