import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { History, RefreshCw, Search } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { AdminPointTransaction, formatDateTime, POINT_TYPE_COLORS, POINT_TYPE_LABELS } from '@/lib/types';
import { COLORS } from '@/components/ui';

// Giống web: components/dashboard/TransactionHistory.tsx (chỉ Admin / Chủ quán)
export default function HistoryPanel() {
  const [history, setHistory] = useState<AdminPointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHistory(await apiRequest<AdminPointTransaction[]>('/points'));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Không tải được nhật ký điểm');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const q = query.toLowerCase().trim();
  const filtered = history.filter(
    (tx) =>
      !q ||
      tx.user?.fullName.toLowerCase().includes(q) ||
      tx.user?.email.toLowerCase().includes(q) ||
      tx.user?.customerCode.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q),
  );

  return (
    <ScrollView
      contentContainerClassName="px-5 pb-10 gap-4"
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={COLORS.primary} />}
    >
      <View className="border-b border-border/60 pb-2 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="flex-row items-center gap-1">
            <History size={16} color={COLORS.primary} />
            <Text className="text-sm font-bold text-foreground uppercase tracking-wider">Nhật ký giao dịch điểm</Text>
          </View>
          <Text className="text-[10px] text-muted-foreground mt-1">Tích điểm online/tại quầy, dùng điểm, đổi quà, hoàn điểm và điều chỉnh của Admin.</Text>
        </View>
        <Pressable onPress={load} accessibilityLabel="Tải lại" className="p-2 rounded-lg border border-border">
          {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <RefreshCw size={16} color={COLORS.foreground} />}
        </Pressable>
      </View>

      <View className="flex-row items-center bg-card border border-border rounded-xl px-3.5">
        <Search size={16} color="rgba(107,94,83,0.6)" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Lọc theo tên, email, mã khách hoặc nội dung..."
          placeholderTextColor="rgba(107,94,83,0.5)"
          className="flex-1 h-12 ml-2.5 text-xs font-semibold text-foreground"
        />
      </View>

      {error && <Text className="text-xs text-destructive font-semibold">{error}</Text>}

      <View className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.map((tx, i) => {
          const plus = tx.points >= 0;
          const [bg, fg] = POINT_TYPE_COLORS[tx.type];
          return (
            <View key={tx.id} className={`p-4 flex-row items-start justify-between gap-4 ${i > 0 ? 'border-t border-border/60' : ''}`}>
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-xs font-bold text-foreground">{tx.user?.fullName ?? 'Khách đã xóa'}</Text>
                  {tx.user && <Text className="text-[9.5px] text-muted-foreground font-medium">{tx.user.customerCode}</Text>}
                  <View style={{ backgroundColor: bg }} className="px-1.5 py-0.5 rounded">
                    <Text style={{ color: fg }} className="text-[8.5px] font-black uppercase">
                      {POINT_TYPE_LABELS[tx.type]}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-neutral-600 font-semibold">{tx.description}</Text>
                <Text className="text-[9.5px] text-muted-foreground font-semibold">
                  Số dư: {tx.pointsBefore} → {tx.pointsAfter} • {formatDateTime(tx.createdAt)}
                </Text>
              </View>
              <View className={`px-2 py-1 rounded ${plus ? 'bg-green-50' : 'bg-red-50'}`}>
                <Text className={`text-xs font-black ${plus ? 'text-green-600' : 'text-destructive'}`}>
                  {plus ? '+' : ''}
                  {tx.points}
                </Text>
              </View>
            </View>
          );
        })}
        {!loading && filtered.length === 0 && <Text className="text-xs text-muted-foreground font-bold text-center py-12">Chưa có giao dịch điểm nào</Text>}
      </View>
    </ScrollView>
  );
}
