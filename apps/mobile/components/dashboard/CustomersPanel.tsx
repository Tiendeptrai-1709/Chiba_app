import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { Coins, Search } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { toast } from '@/lib/stores/toast';
import { PointTransaction, StaffOrder, User } from '@/lib/types';
import Dialog, { DialogActions } from '@/components/Dialog';
import { Button, COLORS } from '@/components/ui';

type Action = { customer: User; type: 'REDEEM' | 'ADJUST' };

// Giống web: components/dashboard/CustomerManager.tsx + PointActionModal.tsx
export default function CustomersPanel({
  customers,
  orders,
  isAdmin,
  onRefresh,
}: {
  customers: User[];
  orders: StaffOrder[];
  isAdmin: boolean;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState('');
  const [action, setAction] = useState<Action | null>(null);

  const q = query.toLowerCase().trim();
  const filtered = customers.filter(
    (c) =>
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q) ||
      c.customerCode.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q),
  );
  const completedCount = (c: User) => orders.filter((o) => o.userId === c.id && o.status === 'COMPLETED').length;

  return (
    <>
      <ScrollView
        contentContainerClassName="px-5 pb-10 gap-4"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View className="border-b border-border/60 pb-2">
          <Text className="text-sm font-bold text-foreground uppercase tracking-wider">👥 Quản lý điểm & đổi thưởng khách hàng</Text>
          <Text className="text-[10px] text-muted-foreground mt-1">
            Tìm khách bằng tên, SĐT, email hoặc mã khách hàng để đổi quà tại quầy{isAdmin ? ' hoặc điều chỉnh điểm' : ''}.
          </Text>
        </View>

        <View className="flex-row items-center bg-neutral-50 border border-border rounded-xl px-3.5">
          <Search size={16} color="rgba(107,94,83,0.6)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm khách theo Tên, SĐT hoặc Mã..."
            placeholderTextColor="rgba(107,94,83,0.5)"
            className="flex-1 h-12 ml-2.5 text-xs font-semibold text-foreground"
          />
        </View>

        {filtered.map((c) => (
          <View key={c.id} className="p-4 bg-card border border-border rounded-2xl gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-accent/10 rounded-full items-center justify-center">
                <Text className="text-accent-strong font-black text-xs">{c.fullName[0]?.toUpperCase()}</Text>
              </View>
              <View className="flex-1 gap-0.5">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-xs font-bold text-foreground">{c.fullName}</Text>
                  <View className="px-1.5 py-0.5 rounded bg-primary/5 border border-primary/10">
                    <Text className="text-[9.5px] font-black text-primary tracking-widest">{c.customerCode}</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-muted-foreground font-medium" numberOfLines={1}>
                  {c.email} | SĐT: {c.phone || 'Chưa cập nhật'}
                </Text>
                <View className="flex-row gap-3 pt-1 flex-wrap">
                  <View className="flex-row items-center gap-1 bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded">
                    <Coins size={14} color={COLORS.accent} />
                    <Text className="text-[10px] font-bold text-accent-strong">
                      Điểm: <Text className="font-black text-sm">{c.zenPoints || 0}</Text>
                    </Text>
                  </View>
                  <Text className="text-[10px] font-bold text-muted-foreground">
                    🛍️ Đã mua: <Text className="text-foreground">{completedCount(c)} đơn</Text>
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row gap-2 self-end">
              <Pressable onPress={() => setAction({ customer: c, type: 'REDEEM' })} className="bg-accent/10 border border-accent/20 px-3 py-2 rounded-xl">
                <Text className="text-[10px] font-black text-accent-strong">🎁 Đổi quà tại quầy</Text>
              </Pressable>
              {isAdmin && (
                <Pressable onPress={() => setAction({ customer: c, type: 'ADJUST' })} className="bg-primary/10 border border-primary/20 px-3 py-2 rounded-xl">
                  <Text className="text-[10px] font-black text-primary">✏️ Điều chỉnh điểm</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View className="items-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-border/80">
            <Text className="text-xs text-muted-foreground font-bold">Không tìm thấy khách hàng nào</Text>
            <Text className="text-[10px] text-muted-foreground/60 mt-0.5">Vui lòng kiểm tra lại từ khóa tìm kiếm</Text>
          </View>
        )}
      </ScrollView>

      {action && <PointActionDialog action={action} onClose={() => setAction(null)} onSuccess={onRefresh} />}
    </>
  );
}

// REDEEM: đổi quà tại quầy (trừ điểm) — nhân viên & admin. ADJUST: cộng/trừ tự do kèm lý do — chỉ admin.
function PointActionDialog({ action, onClose, onSuccess }: { action: Action; onClose: () => void; onSuccess: () => void }) {
  const { customer, type } = action;
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const value = parseInt(points, 10) || 0;

  const submit = async () => {
    if (type === 'REDEEM' && value <= 0) return toast.error('Nhập số điểm cần trừ');
    if (type === 'ADJUST' && value === 0) return toast.error('Số điểm phải khác 0');
    if (type === 'REDEEM' && value > customer.zenPoints) return toast.error('Khách không đủ điểm');
    if (!reason.trim()) return toast.error(type === 'REDEEM' ? 'Nhập tên quà tặng' : 'Nhập lý do điều chỉnh');
    setSubmitting(true);
    try {
      const tx = await apiRequest<PointTransaction>('/points/adjust', {
        method: 'POST',
        body:
          type === 'REDEEM'
            ? { userId: customer.id, points: -value, type: 'REDEEMED_STORE', description: `Đổi quà: ${reason.trim()}` }
            : { userId: customer.id, points: value, type: 'ADMIN_ADJUST', description: reason.trim() },
      });
      toast.success(`${type === 'REDEEM' ? 'Đổi quà' : 'Điều chỉnh điểm'} cho ${customer.fullName} thành công · còn ${tx.pointsAfter} điểm`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const input = 'w-full border border-border px-3 py-3 rounded-xl text-sm font-semibold text-foreground bg-card';

  return (
    <Dialog title={type === 'REDEEM' ? '🎁 Đổi quà tại quầy' : '✏️ Điều chỉnh điểm'} onClose={onClose}>
      <Text className="text-xs font-semibold text-muted-foreground">
        Khách hàng: <Text className="text-foreground font-bold">{customer.fullName}</Text> ({customer.customerCode}) ·{' '}
        <Text className="text-accent-strong font-bold">{customer.zenPoints} điểm</Text>
      </Text>
      <View className="gap-1">
        <Text className="text-[10px] font-bold text-muted-foreground uppercase">{type === 'REDEEM' ? 'Số điểm cần trừ' : 'Số điểm thay đổi (âm để trừ)'}</Text>
        <TextInput
          value={points}
          onChangeText={(t) => setPoints(type === 'REDEEM' ? t.replace(/\D/g, '') : t.replace(/[^\d-]/g, ''))}
          keyboardType={type === 'REDEEM' ? 'number-pad' : 'numbers-and-punctuation'}
          placeholder={type === 'REDEEM' ? 'Ví dụ: 20' : 'Ví dụ: 10 hoặc -5'}
          placeholderTextColor="rgba(107,94,83,0.5)"
          className={input}
        />
      </View>
      <View className="gap-1">
        <Text className="text-[10px] font-bold text-muted-foreground uppercase">{type === 'REDEEM' ? 'Tên quà tặng' : 'Lý do điều chỉnh'}</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          maxLength={150}
          placeholder={type === 'REDEEM' ? 'Ví dụ: Ly sứ Chiba' : 'Ví dụ: Bù điểm đơn lỗi'}
          placeholderTextColor="rgba(107,94,83,0.5)"
          className={input}
        />
      </View>
      <DialogActions>
        <Button title="Hủy" variant="outline" onPress={onClose} className="min-h-0 py-2.5 px-4" textClassName="text-xs" />
        <Button title={submitting ? 'Đang lưu...' : 'Xác nhận'} onPress={submit} loading={submitting} className="min-h-0 py-2.5 px-5" textClassName="text-xs" />
      </DialogActions>
    </Dialog>
  );
}
