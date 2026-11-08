import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { Crown, Search } from 'lucide-react-native';
import { apiRequest } from '@/lib/api';
import { toast } from '@/lib/stores/toast';
import { ROLE_LABELS, User, UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Chip, COLORS, SHADOW } from '@/components/ui';

const ASSIGNABLE: UserRole[] = ['CUSTOMER', 'STAFF', 'ADMIN'];
const ROLE_TONE: Record<UserRole, [string, string]> = {
  CUSTOMER: ['#F5F5F5', '#404040'],
  STAFF: ['#DBEAFE', '#1E40AF'],
  ADMIN: ['#E6EFE2', '#1E4620'],
  OWNER: ['#FEF3C7', '#92400E'],
};
const ORDER: Record<UserRole, number> = { OWNER: 0, ADMIN: 1, STAFF: 2, CUSTOMER: 3 };

// Giống web: components/dashboard/RoleManager.tsx — chỉ Chủ quán thấy.
// Thăng / hạ cấp Khách hàng ↔ Nhân viên ↔ Admin. Phong Chủ quán chỉ làm trong database.
export default function RolePanel({ users, currentUserId, onChanged }: { users: User[]; currentUserId: string; onChanged: () => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | UserRole>('ALL');
  const [pending, setPending] = useState<{ user: User; role: UserRole } | null>(null);
  const [saving, setSaving] = useState(false);

  const list = useMemo(() => {
    const q = query.toLowerCase().trim();
    return users
      .filter((u) => filter === 'ALL' || u.role === filter)
      .filter((u) => !q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.customerCode.toLowerCase().includes(q) || (u.phone ?? '').includes(q))
      .sort((a, b) => ORDER[a.role] - ORDER[b.role] || a.fullName.localeCompare(b.fullName, 'vi'));
  }, [users, query, filter]);

  const counts = useMemo(() => {
    const c: Partial<Record<UserRole, number>> = {};
    users.forEach((u) => (c[u.role] = (c[u.role] ?? 0) + 1));
    return c;
  }, [users]);

  const apply = async () => {
    if (!pending) return;
    const { user, role } = pending;
    setSaving(true);
    try {
      await apiRequest(`/users/${user.id}/role`, { method: 'PATCH', body: { role } });
      toast.success(`${user.fullName} giờ là ${ROLE_LABELS[role]}`);
      setPending(null);
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? 'Không đổi được vai trò');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="px-5 pb-10 gap-4"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={false} onRefresh={onChanged} tintColor={COLORS.primary} />}
      >
        <View className="border-b border-border/60 pb-2">
          <View className="flex-row items-center gap-1.5">
            <Crown size={16} color="#D97706" />
            <Text className="text-sm font-bold text-foreground uppercase tracking-wider">Phân quyền nhân sự</Text>
          </View>
          <Text className="text-[11px] text-muted-foreground mt-1">
            Thăng cấp khách hàng thành Nhân viên hoặc Admin, hoặc hạ cấp khi nghỉ việc. Có hiệu lực ngay ở lần thao tác tiếp theo của người đó.
          </Text>
        </View>

        <View className="flex-row items-center bg-card border border-border rounded-xl px-3.5">
          <Search size={16} color="rgba(107,94,83,0.6)" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm theo tên, email, SĐT hoặc mã khách..."
            placeholderTextColor="rgba(107,94,83,0.5)"
            className="flex-1 h-12 ml-2.5 text-xs font-semibold text-foreground"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {(['ALL', 'OWNER', 'ADMIN', 'STAFF', 'CUSTOMER'] as const).map((r) => (
            <Chip key={r} label={r === 'ALL' ? `Tất cả (${users.length})` : `${ROLE_LABELS[r]} (${counts[r] ?? 0})`} active={filter === r} onPress={() => setFilter(r)} />
          ))}
        </ScrollView>

        <View className="bg-card border border-border rounded-2xl overflow-hidden">
          {list.map((u, i) => {
            const locked = u.role === 'OWNER' || u.id === currentUserId;
            const [bg, fg] = ROLE_TONE[u.role];
            return (
              <View key={u.id} className={cn('p-4 gap-2.5', i > 0 && 'border-t border-border/60')}>
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                    {u.fullName}
                  </Text>
                  <View style={{ backgroundColor: bg }} className="px-2 py-0.5 rounded-full">
                    <Text style={{ color: fg }} className="text-[10px] font-bold">
                      {ROLE_LABELS[u.role]}
                    </Text>
                  </View>
                  {u.id === currentUserId && <Text className="text-[10px] text-muted-foreground">(bạn)</Text>}
                </View>
                <Text className="text-[11px] text-muted-foreground" numberOfLines={1}>
                  {u.email} · {u.customerCode}
                </Text>
                {locked ? (
                  <Text className="text-[11px] text-muted-foreground">{u.role === 'OWNER' ? 'Đổi Chủ quán trong database' : 'Không tự đổi vai trò của mình'}</Text>
                ) : (
                  <View className="flex-row gap-1.5">
                    {ASSIGNABLE.map((r) => {
                      const active = u.role === r;
                      return (
                        <Pressable
                          key={r}
                          onPress={() => !active && setPending({ user: u, role: r })}
                          accessibilityState={{ selected: active }}
                          className={cn('flex-1 py-2 rounded-lg border items-center', active ? 'bg-primary border-primary' : 'bg-card border-border')}
                        >
                          <Text className={cn('text-[11px] font-bold', active ? 'text-white' : 'text-foreground')}>{ROLE_LABELS[r]}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
          {list.length === 0 && <Text className="text-center text-xs text-muted-foreground py-10">Không tìm thấy người dùng nào</Text>}
        </View>
      </ScrollView>

      {/* Xác nhận trước khi đổi quyền (giống web) */}
      {pending && (
        <View style={SHADOW.modal} className="absolute left-5 right-5 bottom-5 bg-foreground rounded-2xl p-4 gap-3">
          <Text className="text-sm text-white">
            Đổi <Text className="font-bold">{pending.user.fullName}</Text> từ {ROLE_LABELS[pending.user.role]} thành{' '}
            <Text className="font-bold">{ROLE_LABELS[pending.role]}</Text>?
          </Text>
          {pending.role === 'ADMIN' && <Text className="text-xs text-white/70">Admin xem được toàn bộ khách hàng, điều chỉnh điểm và sửa menu.</Text>}
          <View className="flex-row gap-2">
            <Pressable onPress={() => setPending(null)} className="flex-1 py-2.5 rounded-xl bg-white/10 items-center">
              <Text className="text-sm font-semibold text-white">Hủy</Text>
            </Pressable>
            <Pressable onPress={apply} disabled={saving} className={cn('flex-1 py-2.5 rounded-xl bg-white items-center', saving && 'opacity-50')}>
              <Text className="text-sm font-bold text-foreground">{saving ? 'Đang lưu...' : 'Xác nhận'}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
