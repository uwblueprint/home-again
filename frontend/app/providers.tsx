"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { MswProvider } from "@/common/components/MswProvider";
import { initAuthListener } from "@/common/stores/authStore";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
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
