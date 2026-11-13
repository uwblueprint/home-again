import { AxiosError, AxiosHeaders } from "axios";

import { retryUnlessNotFound } from "../providers";

function axiosError(status: number) {
  return new AxiosError("Request failed", String(status), undefined, null, {
    status,
    statusText: "",
    data: {},
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe("retryUnlessNotFound", () => {
  it("never retries a 404", () => {
    expect(retryUnlessNotFound(0, axiosError(404))).toBe(false);
  });

  it("retries other failures up to three times", () => {
    for (const error of [axiosError(500), new Error("network")]) {
      expect(retryUnlessNotFound(0, error)).toBe(true);
      expect(retryUnlessNotFound(2, error)).toBe(true);
      expect(retryUnlessNotFound(3, error)).toBe(false);
    }
  });
});
