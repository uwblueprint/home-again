"use client";

import { useEffect, useState, type ReactNode } from "react";

const MOCK_API_URL = "https://mock.api.placeholder";

export function MswProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_API_URL !== MOCK_API_URL
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_URL !== MOCK_API_URL) return;

    const timeout = setTimeout(() => {
      console.error("[MSW] Initialization timeout — rendering without mocks");
      setReady(true);
    }, 3000);

    async function enable() {
      const { initMocks } = await import("@/common/lib/mswInit");
      await initMocks();
      clearTimeout(timeout);
      setReady(true);
    }
    enable();

    return () => clearTimeout(timeout);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
