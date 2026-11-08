import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/lib/stores/toast';
import { COLORS, SHADOW } from './ui';

// Thông báo dạng viên thuốc ở đầu màn hình (giống web) — bấm để tắt
export default function Toast() {
  const { message, kind, hide } = useToast();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  if (!message) return null;

  return (
    <View pointerEvents="box-none" className="absolute left-0 right-0 z-50 items-center px-4" style={{ top: insets.top + 8 }}>
      <Pressable
        onPress={hide}
        accessibilityRole="alert"
        style={SHADOW.floating}
        className={`max-w-full flex-row items-center gap-2 px-4 py-3 rounded-full ${kind === 'error' ? 'bg-destructive' : 'bg-primary'}`}
      >
        {kind === 'added' ? (
          <>
            <Sparkles size={16} color={COLORS.caramel} />
            <Text className="text-white text-xs flex-shrink" numberOfLines={1}>
              Đã thêm <Text className="font-bold text-caramel">{message}</Text>
            </Text>
            <Text
              onPress={() => {
                hide();
                router.push('/cart');
              }}
              className="text-white text-xs font-bold underline ml-1"
            >
              Xem giỏ
            </Text>
          </>
        ) : (
          <Text className="text-white text-xs font-semibold text-center">{message}</Text>
        )}
      </Pressable>
    </View>
  );
}
