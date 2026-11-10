import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosError, AxiosHeaders } from "axios";

import { createApiClient } from "@/common/lib/apiClient";

jest.mock("@/common/stores/authStore", () => ({
  getToken: jest.fn(() => null),
  useAuthStore: {
    getState: () => ({
      signOut: jest.fn(),
    }),
  },
}));

function okResponse(
  config: InternalAxiosRequestConfig
): AxiosResponse<{ ok: boolean }> {
  return {
    data: { ok: true },
    status: 200,
    statusText: "OK",
    headers: {},
    config,
  };
}

function axiosError(
  config: InternalAxiosRequestConfig,
  status: number
): AxiosError {
  return new AxiosError(
    "Request failed",
    String(status),
    config,
    undefined,
    {
      data: { detail: "nope" },
      status,
      statusText: "Error",
      headers: {},
      config,
    }
  );
}

describe("createApiClient", () => {
  it("attaches Authorization: Bearer <token> from the injected getter", async () => {
    const getToken = jest.fn(() => "fake-token");
    const client = createApiClient({ getToken });

    const response = await client.get("/ping", {
      adapter: async (config) => {
        expect(config.headers.Authorization).toBe("Bearer fake-token");
        return okResponse(config);
      },
    });

    expect(getToken).toHaveBeenCalled();
    expect(response.data).toEqual({ ok: true });
  });

  it("omits Authorization when the injected getter returns null", async () => {
    const getToken = jest.fn(() => null);
    const client = createApiClient({ getToken });

    await client.get("/ping", {
      adapter: async (config) => {
        const headers = AxiosHeaders.from(config.headers);
        expect(headers.get("Authorization")).toBeFalsy();
        return okResponse(config);
      },
    });
  });

  it("clears auth via onUnauthorized on a 401 response", async () => {
    const onUnauthorized = jest.fn().mockResolvedValue(undefined);
    const client = createApiClient({
      getToken: () => "fake-token",
      onUnauthorized,
    });

    await expect(
      client.get("/secure", {
        adapter: async (config) => {
          throw axiosError(config, 401);
        },
      })
    ).rejects.toMatchObject({ response: { status: 401 } });

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("does not call onUnauthorized for non-401 errors", async () => {
    const onUnauthorized = jest.fn();
    const client = createApiClient({
      getToken: () => "fake-token",
      onUnauthorized,
    });

    await expect(
      client.get("/broken", {
        adapter: async (config) => {
          throw axiosError(config, 500);
        },
      })
    ).rejects.toMatchObject({ response: { status: 500 } });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
