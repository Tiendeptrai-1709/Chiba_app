import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { RefreshCw } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { MenuStats, Store } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Chip, COLORS } from '@/components/ui';

const DAY_MS = 24 * 60 * 60 * 1000;
// Ngày theo giờ Việt Nam dạng YYYY-MM-DD (server cũng tính theo giờ Việt Nam)
const vnDate = (offsetDays = 0) => new Date(Date.now() + 7 * 3600_000 + offsetDays * DAY_MS).toISOString().slice(0, 10);

type Preset = 'TODAY' | 'YESTERDAY' | '7D' | '30D' | 'MONTH' | 'CUSTOM';
const PRESETS: { key: Preset; label: string }[] = [
  { key: 'TODAY', label: 'Hôm nay' },
  { key: 'YESTERDAY', label: 'Hôm qua' },
  { key: '7D', label: '7 ngày' },
  { key: '30D', label: '30 ngày' },
  { key: 'MONTH', label: 'Tháng này' },
  { key: 'CUSTOM', label: 'Tùy chọn' },
];

function presetRange(p: Preset): { from: string; to: string } | null {
  const today = vnDate();
  switch (p) {
    case 'TODAY':
      return { from: today, to: today };
    case 'YESTERDAY':
      return { from: vnDate(-1), to: vnDate(-1) };
    case '7D':
      return { from: vnDate(-6), to: today };
    case '30D':
      return { from: vnDate(-29), to: today };
    case 'MONTH':
      return { from: `${today.slice(0, 8)}01`, to: today };
    default:
      return null;
  }
}

const money = (n: number) => `${n.toLocaleString('vi-VN')}₫`;
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Giống web: components/dashboard/MenuStats.tsx
export default function StatsPanel() {
  const [preset, setPreset] = useState<Preset>('7D');
  const [range, setRange] = useState(() => presetRange('7D')!);
  const [draft, setDraft] = useState(range); // ô nhập ngày khi "Tùy chọn"
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<Store[]>([]);
  const [data, setData] = useState<MenuStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusGroup, setFocusGroup] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    apiRequest<Store[]>('/stores', { auth: false })
      .then(setStores)
      .catch(() => setStores([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = `from=${range.from}&to=${range.to}${storeId ? `&storeId=${encodeURIComponent(storeId)}` : ''}`;
      setData(await apiRequest<MenuStats>(`/stats/menu?${q}`));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được thống kê');
    } finally {
      setLoading(false);
    }
  }, [range, storeId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const choosePreset = (p: Preset) => {
    setPreset(p);
    const r = presetRange(p);
    if (r) {
      setRange(r);
      setDraft(r);
    }
  };

  const applyCustom = () => {
    if (!DATE_RE.test(draft.from) || !DATE_RE.test(draft.to)) return setError('Ngày phải có dạng YYYY-MM-DD, ví dụ 2026-11-01');
    setRange(draft);
  };

  const totalQty = useMemo(() => data?.groups.reduce((s, g) => s + g.quantity, 0) ?? 0, [data]);
  const maxRevenue = useMemo(() => Math.max(1, ...(data?.groups.map((g) => g.revenue) ?? [])), [data]);
  const shown = data ? (focusGroup === undefined ? data.products : data.products.filter((p) => p.groupId === focusGroup)) : [];
  const focusName = focusGroup === undefined ? null : data?.groups.find((g) => g.groupId === focusGroup)?.name;

  return (
    <ScrollView
      contentContainerClassName="px-5 pb-10 gap-5"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={COLORS.primary} />}
    >
      <View className="border-b border-border pb-3 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-bold text-sm uppercase tracking-wider text-foreground">📈 Thống kê món bán</Text>
          <Text className="text-[11px] text-muted-foreground mt-1">
            Chỉ tính đơn đã hoàn thành, theo giờ Việt Nam. Món xếp theo danh mục hiện tại — đổi danh mục trong tab “Món & kho”.
          </Text>
        </View>
        <Pressable onPress={load} accessibilityLabel="Tải lại" className="p-2 rounded-lg border border-border">
          {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <RefreshCw size={16} color={COLORS.foreground} />}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5">
        {PRESETS.map((p) => (
          <Chip key={p.key} label={p.label} active={preset === p.key} onPress={() => choosePreset(p.key)} />
        ))}
      </ScrollView>

      {preset === 'CUSTOM' && (
        <View className="flex-row items-end gap-2">
          {(['from', 'to'] as const).map((k) => (
            <View key={k} className="flex-1 gap-1">
              <Text className="text-[11px] font-bold text-muted-foreground uppercase">{k === 'from' ? 'Từ ngày' : 'Đến ngày'}</Text>
              <TextInput
                value={draft[k]}
                onChangeText={(t) => setDraft((d) => ({ ...d, [k]: t }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(107,94,83,0.5)"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                className="border border-border rounded-lg px-2.5 py-2 text-xs font-semibold text-foreground bg-card"
              />
            </View>
          ))}
          <Pressable onPress={applyCustom} className="bg-primary px-3 py-2.5 rounded-lg">
            <Text className="text-white text-xs font-bold">Xem</Text>
          </Pressable>
        </View>
      )}

      {stores.length > 1 && (
        <View className="gap-1.5">
          <Text className="text-[11px] font-bold text-muted-foreground uppercase">Chi nhánh</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5">
            <Chip label="Tất cả chi nhánh" active={!storeId} onPress={() => setStoreId('')} />
            {stores.map((s) => (
              <Chip key={s.id} label={s.name} active={storeId === s.id} onPress={() => setStoreId(s.id)} />
            ))}
          </ScrollView>
        </View>
      )}

      {error && <Text className="text-xs font-semibold text-destructive">{error}</Text>}

      {data && (
        <>
          <View className="flex-row gap-2.5">
            {[
              ['Đơn hoàn thành', String(data.orderCount), 'text-foreground'],
              ['Doanh thu', money(data.revenue), 'text-primary'],
              ['Số phần bán', String(totalQty), 'text-foreground'],
            ].map(([label, value, tone]) => (
              <View key={label} className="flex-1 bg-neutral-50 border border-border/70 rounded-xl p-3">
                <Text className="text-[10px] font-bold text-muted-foreground uppercase">{label}</Text>
                <Text className={cn('text-base font-black', tone)} numberOfLines={1} adjustsFontSizeToFit>
                  {value}
                </Text>
              </View>
            ))}
          </View>
          <Text className="text-[10px] text-muted-foreground -mt-2">
            Doanh thu = tiền khách thực trả (đã trừ điểm, gồm phí ship). Tiền theo danh mục/món = giá món × số phần, chưa trừ điểm; topping tính vào danh mục
            của topping.
          </Text>

          {data.groups.length === 0 ? (
            <Text className="text-xs text-muted-foreground text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-border">
              Chưa có đơn hoàn thành trong khoảng thời gian này.
            </Text>
          ) : (
            <>
              <View className="gap-2">
                <Text className="text-xs font-black text-muted-foreground uppercase tracking-wider">Theo danh mục</Text>
                {data.groups.map((g) => {
                  const active = focusGroup === g.groupId;
                  return (
                    <Pressable
                      key={g.groupId ?? 'none'}
                      onPress={() => setFocusGroup(active ? undefined : g.groupId)}
                      className={cn('rounded-xl border px-3 py-2.5', active ? 'border-primary bg-primary/5' : 'border-border/70')}
                    >
                      <View className="flex-row items-baseline justify-between gap-2">
                        <Text className="text-xs font-bold text-foreground flex-1" numberOfLines={1}>
                          {g.name}
                        </Text>
                        <Text className="text-xs font-black text-foreground">{money(g.revenue)}</Text>
                      </View>
                      <View className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                        <View className="h-full rounded-full bg-primary" style={{ width: `${(g.revenue / maxRevenue) * 100}%` }} />
                      </View>
                      <View className="mt-1 flex-row justify-between">
                        <Text className="text-[10px] text-muted-foreground">{g.quantity} phần</Text>
                        <Text className="text-[10px] text-muted-foreground">{pct(g.revenue, data.itemRevenue)}% tiền món</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                    Món bán chạy{focusName ? ` · ${focusName}` : ''}
                  </Text>
                  {focusGroup !== undefined && (
                    <Pressable onPress={() => setFocusGroup(undefined)}>
                      <Text className="text-[11px] font-bold text-primary underline">Xem tất cả</Text>
                    </Pressable>
                  )}
                </View>
                <View className="rounded-xl border border-border/70 overflow-hidden">
                  <View className="flex-row bg-neutral-50 px-3 py-2">
                    <Text className="w-7 text-[10px] font-bold text-muted-foreground">#</Text>
                    <Text className="flex-1 text-[10px] font-bold text-muted-foreground uppercase">Món</Text>
                    <Text className="w-14 text-right text-[10px] font-bold text-muted-foreground uppercase">Phần</Text>
                    <Text className="w-24 text-right text-[10px] font-bold text-muted-foreground uppercase">Tiền món</Text>
                  </View>
                  {shown.map((p, i) => (
                    <View key={p.productId} className="flex-row items-center px-3 py-2 border-t border-border/60">
                      <Text className="w-7 text-xs text-muted-foreground">{i + 1}</Text>
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-foreground">{p.name}</Text>
                        {focusGroup === undefined && <Text className="text-[10px] text-muted-foreground">{p.groupName}</Text>}
                      </View>
                      <Text className="w-14 text-right text-xs font-bold text-foreground">{p.quantity}</Text>
                      <Text className="w-24 text-right text-xs text-foreground">{money(p.revenue)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
