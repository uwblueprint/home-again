const MOCK_API_URL = "https://mock.api.placeholder";

export async function initMocks(): Promise<void> {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_API_URL !== MOCK_API_URL) return;

  try {
    const { worker } = await import("@/mocks/browser");

    await worker.start({
      onUnhandledRequest: "bypass",
    });
  } catch (error) {
    console.error("[MSW] Failed to start service worker:", error);
  }
}
