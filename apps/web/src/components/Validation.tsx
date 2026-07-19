'use client';

import { useNotificationStore } from "@/lib/stores/useNotificationStore";
import { useEffect } from "react";


export default function Validation() {
    const { success, error, clearNotification } = useNotificationStore()

    // Tự động ẩn thông báo lỗi/thành công sau 5 giây để nâng cao trải nghiệm người dùng
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success, clearNotification]);

    if (!error && !success) return null;

    return (
        <div className="mb-4 space-y-2 animate-fade-in relative">
            {error && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 font-medium flex items-center justify-between shadow-sm">
                    <span className="flex items-center gap-2">⚠️ {error}</span>
                    <button
                        onClick={clearNotification}
                        className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity px-2"
                    >
                        ✕
                    </button>
                </div>
            )}

            {success && (
                <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-200 font-medium flex items-center justify-between shadow-sm">
                    <span className="flex items-center gap-2">✅ {success}</span>
                    <button
                        onClick={clearNotification}
                        className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity px-2"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}