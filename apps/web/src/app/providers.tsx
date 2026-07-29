"use client"
import {AuthGuard} from '@/guards/AuthGuard';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useEffect, useState } from 'react'

function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: { retry: 1, refetchOnWindowFocus: true }
        }
    }));
    const { setAccessToken, setChecking } = useAuthStore();

    useEffect(() => {
        const refresh = async () => {
            try {
                const res = await axiosInstance.post("/auth/refresh");
                setAccessToken(res.data.accessToken);
            } catch (error) {
                console.log("Chưa đăng nhập",error)
            } finally {
                setChecking(false)
            }
        }
        refresh();
    }, [setAccessToken, setChecking])

    return (
        <QueryClientProvider client={queryClient}>
            <AuthGuard>
                {children}
            </AuthGuard>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    )
}

export default Providers