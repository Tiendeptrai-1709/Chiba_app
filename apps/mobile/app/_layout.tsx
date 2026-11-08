import '../global.css';
import '@/lib/nativewind-interop';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/lib/stores/auth';
import Toast from '@/components/Toast';
import { Loading } from '@/components/ui';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Chưa đăng nhập → màn đăng nhập; đã đăng nhập mà đang ở màn đăng nhập → trang chủ
function useAuthRedirect() {
  const { user, ready } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth) router.replace('/login');
    else if (user && inAuth) router.replace('/');
  }, [user, ready, segments, router]);
}

export default function RootLayout() {
  const { ready, init } = useAuth();

  useEffect(() => {
    init().finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, [init]);

  useAuthRedirect();

  if (!ready) return <Loading text="Đang mở Chiba..." />;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAF7F5' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="cart" options={{ presentation: 'card' }} />
        <Stack.Screen name="stores" />
        <Stack.Screen name="orders/[id]" />
        <Stack.Screen name="dashboard" />
      </Stack>
      <Toast />
    </View>
  );
}
