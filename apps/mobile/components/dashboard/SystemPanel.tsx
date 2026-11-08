import React, { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { Mail, Trash2, UserPlus, Users } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { toast } from '@/lib/stores/toast';
import { useProducts } from '@/lib/stores/products';
import { StaffOrder, User } from '@/lib/types';
import { Button, Card, COLORS } from '@/components/ui';

function Stat({ icon, label, value, bg, fg }: { icon: string; label: string; value: string; bg: string; fg: string }) {
  return (
    <View style={{ backgroundColor: bg, width: '48%' }} className="p-4 rounded-xl border border-black/5">
      <Text className="text-2xl mb-1">{icon}</Text>
      <Text style={{ color: fg }} className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </Text>
      <Text style={{ color: fg }} className="text-2xl font-black">
        {value}
      </Text>
    </View>
  );
}

// Giống web: components/dashboard/SystemOverview.tsx (Admin / Chủ quán)
export default function SystemPanel({ orders, users, onRefresh }: { orders: StaffOrder[]; users: User[]; onRefresh: () => void }) {
  const productCount = useProducts((s) => s.products.length);
  const [invites, setInvites] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadInvites = useCallback(async () => {
    try {
      setInvites((await apiRequest<{ email: string }[]>('/staff-invites')).map((i) => i.email));
    } catch (e: any) {
      toast.error(e?.message ?? 'Không tải được lời mời');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadInvites();
    }, [loadInvites]),
  );

  const customers = users.filter((u) => u.role === 'CUSTOMER');
  const staff = users.filter((u) => u.role === 'STAFF');
  const revenue = orders.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + o.total, 0);

  const invite = async () => {
    const value = email.trim().toLowerCase();
    if (!value) return;
    setSubmitting(true);
    try {
      await apiRequest('/staff-invites', { method: 'POST', body: { email: value } });
      toast.success(`Đã mời ${value} làm nhân viên`);
      setEmail('');
      loadInvites();
    } catch (e: any) {
      toast.error(e?.message ?? 'Có lỗi xảy ra khi gửi lời mời.');
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (value: string) => {
    try {
      await apiRequest(`/staff-invites/${encodeURIComponent(value)}`, { method: 'DELETE' });
      toast.success(`Đã thu hồi lời mời dành cho ${value}`);
      loadInvites();
    } catch {
      toast.error('Không thể thu hồi lời mời này');
    }
  };

  return (
    <ScrollView
      contentContainerClassName="px-5 pb-10 gap-6"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            onRefresh();
            loadInvites();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <View>
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">📈 Giám sát hệ thống</Text>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          <Stat icon="📋" label="Đơn hàng" value={String(orders.length)} bg="#EFF6FF" fg="#1E3A8A" />
          <Stat icon="💰" label="Doanh thu (đơn hoàn thành)" value={`${(revenue / 1000).toFixed(1)}k₫`} bg="#F0FDF4" fg="#14532D" />
          <Stat icon="📦" label="Sản phẩm" value={String(productCount)} bg="#FAF5FF" fg="#581C87" />
          <Stat icon="👥" label="Khách hàng" value={String(customers.length)} bg="#FFF7ED" fg="#7C2D12" />
        </View>
      </View>

      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          <UserPlus size={20} color={COLORS.primary} />
          <Text className="font-bold text-sm uppercase tracking-wider text-primary">Mời nhân viên (Staff) mới</Text>
        </View>
        <Text className="text-xs text-muted-foreground leading-relaxed">
          Nhập email của nhân viên. Hệ thống cấp quyền <Text className="font-bold">STAFF</Text> khi email này đăng ký tài khoản.
        </Text>
        <View className="flex-row gap-2">
          <View className="flex-1 flex-row items-center bg-neutral-50 border border-border rounded-xl px-3">
            <Mail size={16} color="rgba(107,94,83,0.6)" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="staff-email@gmail.com"
              placeholderTextColor="rgba(107,94,83,0.5)"
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={invite}
              className="flex-1 h-12 ml-2 text-xs font-semibold text-foreground"
            />
          </View>
          <Button title="Mời" onPress={invite} loading={submitting} className="min-h-0 py-3 px-5" textClassName="text-xs" />
        </View>
      </Card>

      {invites.length > 0 && (
        <Card className="gap-3">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">✉️ Lời mời đang chờ ({invites.length})</Text>
          {invites.map((value, i) => (
            <View key={value} className={`flex-row items-center justify-between py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
              <Text className="text-xs font-bold text-foreground flex-1" numberOfLines={1}>
                {value}
              </Text>
              <Pressable onPress={() => revoke(value)} className="flex-row items-center gap-1 border border-destructive/20 px-3 py-1.5 rounded-lg">
                <Trash2 size={12} color={COLORS.destructive} />
                <Text className="text-[10px] text-destructive font-bold">Thu hồi</Text>
              </Pressable>
            </View>
          ))}
        </Card>
      )}

      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          <Users size={20} color={COLORS.primary} />
          <Text className="text-xs font-bold uppercase tracking-wider text-foreground">Đội ngũ nhân viên hoạt động ({staff.length})</Text>
        </View>
        {staff.length > 0 ? (
          staff.map((s) => (
            <View key={s.id} className="flex-row items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-border/60">
              <View className="w-9 h-9 bg-accent/15 rounded-full items-center justify-center">
                <Text className="text-accent-strong font-bold text-xs">{s.fullName[0]?.toUpperCase()}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                  {s.fullName}
                </Text>
                <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
                  {s.email}
                </Text>
              </View>
              <View className="bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                <Text className="text-[10px] font-bold text-primary">{s.customerCode}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text className="text-xs text-muted-foreground text-center py-4 bg-neutral-50 rounded-xl border border-dashed border-border">
            Chưa có nhân viên nào. Hãy mời nhân viên bằng email ở trên!
          </Text>
        )}
      </Card>
    </ScrollView>
  );
}
