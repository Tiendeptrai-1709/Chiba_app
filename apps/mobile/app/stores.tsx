import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, MapPin, Phone, RefreshCw, Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiRequest } from '@/lib/api';
import { useCart } from '@/lib/stores/cart';
import { Store } from '@/lib/types';
import { cn } from '@/lib/utils';
import { COLORS, SHADOW } from '@/components/ui';

// Giống web: app/stores/page.tsx
export default function StoresScreen() {
  const router = useRouter();
  const { store: selected, setStore } = useCart();
  const [stores, setStores] = useState<Store[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const fetchStores = () =>
    apiRequest<Store[]>('/stores', { auth: false })
      .then((list) => {
        setStores(list);
        setError(null);
      })
      .catch((e) => setError(e?.message ?? 'Không tải được danh sách cửa hàng'));

  useEffect(() => {
    fetchStores();
  }, []);

  const retry = () => {
    setError(null);
    setStores(null);
    fetchStores();
  };

  const choose = (s: Store) => {
    setStore({ id: s.id, name: s.name, address: s.address });
    if (router.canGoBack()) router.back();
    else router.replace('/order');
  };

  const q = query.toLowerCase().trim();
  const filtered = (stores ?? []).filter((s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q));

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView edges={['top']} className="bg-primary">
        <View className="px-4 py-4 flex-row items-center gap-4">
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/order'))} accessibilityLabel="Quay lại" className="p-2 rounded-full">
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <Text className="text-xl font-bold text-white">Chọn cửa hàng</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerClassName="px-4 py-6 gap-6" keyboardShouldPersistTaps="handled">
        <View style={SHADOW.sm} className="flex-row items-center bg-card border border-border rounded-xl px-4">
          <Search size={20} color="rgba(107,94,83,0.6)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm chi nhánh gần nhất..."
            placeholderTextColor="rgba(107,94,83,0.5)"
            className="flex-1 h-12 ml-3 text-sm text-foreground"
          />
        </View>

        <View style={SHADOW.sm} className="bg-card rounded-2xl border border-border overflow-hidden">
          {stores === null && !error ? (
            <Text className="p-10 text-center text-sm text-muted-foreground">Đang tải danh sách cửa hàng...</Text>
          ) : error ? (
            <View className="p-10 items-center gap-3">
              <Text className="text-sm font-semibold text-foreground text-center">{error}</Text>
              <Pressable onPress={retry} className="flex-row items-center gap-2 bg-primary px-4 py-2 rounded-full">
                <RefreshCw size={16} color="#fff" />
                <Text className="text-white text-sm font-bold">Thử lại</Text>
              </Pressable>
            </View>
          ) : filtered.length > 0 ? (
            filtered.map((s, i) => {
              const active = s.id === selected?.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => choose(s)}
                  accessibilityState={{ selected: active }}
                  className={cn('p-5 flex-row items-start gap-4', i !== filtered.length - 1 && 'border-b border-border', active && 'bg-primary/5')}
                >
                  <View className="p-2 bg-primary/5 rounded-xl mt-0.5">
                    <MapPin size={20} color={COLORS.primary} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="font-bold text-foreground text-sm" numberOfLines={1}>
                      {s.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground leading-relaxed">{s.address}</Text>
                    {s.phone ? (
                      <View className="flex-row items-center gap-1">
                        <Phone size={12} color={COLORS.muted} />
                        <Text className="text-[11px] text-muted-foreground">{s.phone}</Text>
                      </View>
                    ) : null}
                  </View>
                  {active && <Check size={20} color={COLORS.primary} style={{ marginTop: 4 }} />}
                </Pressable>
              );
            })
          ) : (
            <View className="p-10 items-center">
              <Text className="text-3xl mb-2">📍</Text>
              <Text className="font-semibold text-sm text-muted-foreground">Không tìm thấy chi nhánh nào</Text>
              <Text className="text-xs text-muted-foreground/60 mt-1">Vui lòng thử tìm kiếm bằng từ khóa khác.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
