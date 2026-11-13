"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";

import { MswProvider } from "@/common/components/MswProvider";
import { initAuthListener } from "@/common/stores/authStore";

/** TanStack's default of 3 retries, but none for a 404. */
export function retryUnlessNotFound(failureCount: number, error: unknown) {
  if (isAxiosError(error) && error.response?.status === 404) return false;
  return failureCount < 3;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: retryUnlessNotFound },
        },
      })
  );

  useEffect(() => {
    initAuthListener();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MswProvider>{children}</MswProvider>
    </QueryClientProvider>
  );
}
