"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryclient } from "./get-query-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryclient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
