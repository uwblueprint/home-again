import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { camelizeKeys, decamelizeKeys } from "humps";

const baseAPIClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

// Python API uses snake_case, frontend uses camelCase
// convert request and response data to/from snake_case and camelCase through axios interceptors
baseAPIClient.interceptors.response.use((response: AxiosResponse) => {
  if (
    response.data &&
    response.headers["content-type"] === "application/json"
  ) {
    response.data = camelizeKeys(response.data);
  }
  return response;
});

baseAPIClient.interceptors.request.use(async (config: AxiosRequestConfig) => {
  const newConfig = { ...config };

  if (config.params) {
    newConfig.params = decamelizeKeys(config.params);
  }
  if (config.data && !(config.data instanceof FormData)) {
    newConfig.data = decamelizeKeys(config.data);
  }

  return newConfig;
});

export default baseAPIClient;
