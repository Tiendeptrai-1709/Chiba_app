import React from 'react';
import { Tabs } from 'expo-router';
import PillNav from '@/components/PillNav';
import { COLORS } from '@/components/ui';

// 4 mục trên thanh điều hướng giống web: Trang chủ · Đặt món · Mã QR · Hồ sơ.
// "Đơn của tôi" là tab không có nút trên thanh (PillNav chỉ vẽ 4 mục trên), mở từ ô trên trang chủ,
// nhưng vẫn giữ thanh điều hướng như web. Không dùng href: null — nó gỡ luôn đường dẫn /orders.
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PillNav {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: COLORS.background } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Trang chủ' }} />
      <Tabs.Screen name="order" options={{ title: 'Đặt món' }} />
      <Tabs.Screen name="qr" options={{ title: 'Mã QR' }} />
      <Tabs.Screen name="profile" options={{ title: 'Hồ sơ' }} />
      <Tabs.Screen name="orders" options={{ title: 'Đơn của tôi' }} />
    </Tabs>
  );
}
