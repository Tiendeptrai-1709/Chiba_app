import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { Check, Coins, Copy, Store } from 'lucide-react-native';
import { useAuth } from '@/lib/stores/auth';
import { usePolling } from '@/lib/usePolling';
import { useNavSpace } from '@/components/PillNav';
import { COLORS, GREEN_GRADIENT, PageHeader, Screen, SHADOW } from '@/components/ui';

// Giống web: app/qr/page.tsx — khách đưa mã cho nhân viên quét để tích điểm tại quầy
export default function QrScreen() {
  const router = useRouter();
  const navSpace = useNavSpace();
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  // Cập nhật số điểm ngay sau khi nhân viên quét
  usePolling(useCallback(() => refreshUser(), [refreshUser]), 8_000);
  if (!user) return null;

  const copyCode = async () => {
    await Clipboard.setStringAsync(user.customerCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Screen>
      <PageHeader title="QR tích điểm" onBack={() => router.navigate('/')} />
      <ScrollView contentContainerClassName="px-5 pt-3 gap-5" contentContainerStyle={{ paddingBottom: navSpace }}>
        {/* Thẻ thành viên */}
        <View style={SHADOW.floating} className="bg-card rounded-[32px] overflow-hidden">
          <LinearGradient colors={GREEN_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View className="px-6 pt-5 pb-14">
              <Text className="text-xs text-white/80 uppercase tracking-widest">Thẻ thành viên Chiba</Text>
              <Text className="text-xl font-bold mt-1 text-white" numberOfLines={1}>
                {user.fullName}
              </Text>
            </View>
          </LinearGradient>

          <View className="-mt-10 px-6 pb-6 items-center">
            <View style={SHADOW.premium} className="bg-white p-4 rounded-3xl">
              <QRCode value={user.customerCode} size={208} color={COLORS.foreground} backgroundColor="#FFFFFF" quietZone={4} />
            </View>
            <Pressable onPress={copyCode} accessibilityLabel="Sao chép mã khách hàng" className="mt-4 flex-row items-center gap-2">
              <Text className="text-lg font-black tracking-[3px] text-foreground">{user.customerCode}</Text>
              {copied ? <Check size={16} color={COLORS.accent} /> : <Copy size={16} color={COLORS.muted} />}
            </Pressable>
            <View className="mt-5 w-full flex-row items-center justify-between bg-background rounded-2xl px-4 py-3">
              <View className="flex-row items-center gap-2">
                <Coins size={16} color={COLORS.accent} />
                <Text className="text-sm font-semibold text-muted-foreground">Điểm hiện có</Text>
              </View>
              <Text className="text-lg font-black text-primary">{user.zenPoints} điểm</Text>
            </View>
          </View>
        </View>

        {/* Hướng dẫn */}
        <View style={SHADOW.premium} className="bg-card rounded-[28px] p-5 flex-row gap-4">
          <View className="w-11 h-11 rounded-2xl bg-caramel items-center justify-center">
            <Store size={20} color={COLORS.primary} />
          </View>
          <View className="flex-1 gap-1">
            <Text className="font-bold text-foreground">Order tại cửa hàng</Text>
            <Text className="text-sm text-muted-foreground leading-relaxed">
              Đưa mã QR này cho nhân viên khi thanh toán để được tích điểm. Có thể đọc mã số bên dưới QR nếu máy quét không đọc được.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
