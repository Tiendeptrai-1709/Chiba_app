import { useNotificationStore } from '@chiba/api-client/src/stores/useNotificationStore';
import React, { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'

const Notification = () => {
    const { error, success, clearNotification } = useNotificationStore();
    // Tự động ẩn thông báo lỗi/thành công sau 5 giây để nâng cao trải nghiệm người dùng
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                clearNotification();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success, clearNotification]);

    if (!error && !success) return null;
    return (
        <View className="mb-4 space-y-2 animate-fade-in relative">
            {/* Notification Alert Box */}
            {error && (
                <View className="p-4 bg-red-500 text-red-700 border border-red-200 text-sm rounded-xl font-medium flex items-center justify-between shadow-sm">
                    <Text className="flex items-center gap-2">⚠️ {error} </Text>
                    <Pressable onPress={clearNotification}>
                        <Text className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity px-2">✕</Text>
                    </Pressable>
                </View>
            )}
            {success && (
                <View className="p-4 bg-emerald-500 text-emerald-700 border border-emerald-200 text-sm rounded-xl font-medium flex items-center justify-between shadow-sm">
                    <Text className="flex items-center gap-2">✅ {success}</Text>
                    <Pressable onPress={clearNotification}>
                        <Text className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity px-2">✕</Text>
                    </Pressable>
                </View>
            )}
        </View>
    )
}

export default Notification
