import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { Coffee, Home, QrCode, User } from 'lucide-react-native';
import { COLORS, SHADOW } from './ui';

// Giống web (components/layout/CustomerNav.tsx): viên thuốc màu xanh nhạt nổi ở đáy,
// mục đang mở là nút trắng có chữ, các mục khác chỉ có icon mờ.
const ITEMS = [
  { name: 'index', label: 'Trang chủ', Icon: Home },
  { name: 'order', label: 'Đặt món', Icon: Coffee },
  { name: 'qr', label: 'Mã QR', Icon: QrCode },
  { name: 'profile', label: 'Hồ sơ', Icon: User },
] as const;

// Chiều cao thanh + khoảng cách đáy: màn hình có thanh này cần chừa chỗ (xem NAV_SPACE)
export const NAV_HEIGHT = 60;

export function useNavSpace() {
  const insets = useSafeAreaInsets();
  return NAV_HEIGHT + Math.max(insets.bottom, 12) + 28;
}

export default function PillNav({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;

  return (
    <View pointerEvents="box-none" className="absolute left-4 right-4" style={{ bottom: Math.max(insets.bottom, 12) + 4 }}>
      <View style={SHADOW.floating} className="flex-row items-center justify-between bg-caramel rounded-full p-1.5">
        {ITEMS.map(({ name, label, Icon }) => {
          const active = current === name;
          return (
            <Pressable
              key={name}
              onPress={() => {
                const route = state.routes.find((r) => r.name === name);
                if (route && !active) navigateToTab(route.key);
              }}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: active }}
              style={active ? SHADOW.sm : undefined}
              className={`h-12 rounded-full flex-row items-center justify-center gap-2 ${active ? 'bg-card px-5' : 'w-12'}`}
            >
              <Icon size={20} color={COLORS.primary} strokeWidth={active ? 2.4 : 2} opacity={active ? 1 : 0.6} />
              {active && <Text className="text-sm font-bold text-primary">{label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
