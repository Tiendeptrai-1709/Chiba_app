import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@chiba/api-client";
import { api } from "@/lib/axios";
import { AuthGuard } from "@/guards/AuthGuards";


const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { setAccessToken, setChecking } = useAuthStore();

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await api.post("/auth/refresh");

        setAccessToken(res.data.accessToken);
      } catch (error) {
        console.log("Chưa đăng nhập", error);
      } finally {
        setChecking(false);
      }
    };

    refresh();
  }, [setAccessToken, setChecking]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>{children}</AuthGuard>
    </QueryClientProvider>
  );
}

export default Providers;