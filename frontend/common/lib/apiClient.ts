import axios from "axios";

import { config } from "@/common/constants/config";
import { getToken, useAuthStore } from "@/common/stores/authStore";

const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
