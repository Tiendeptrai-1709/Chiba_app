import React, { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/lib/stores/auth';
import { useProducts } from '@/lib/stores/products';
import { toast } from '@/lib/stores/toast';
import { isManager, isStaffMember, ROLE_LABELS, StaffOrder, User, UserRole } from '@/lib/types';
import { usePolling } from '@/lib/usePolling';
import { cn } from '@/lib/utils';
import CustomersPanel from '@/components/dashboard/CustomersPanel';
import HistoryPanel from '@/components/dashboard/HistoryPanel';
import OrdersPanel from '@/components/dashboard/OrdersPanel';
import RolePanel from '@/components/dashboard/RolePanel';
import ScanPanel from '@/components/dashboard/ScanPanel';
import StatsPanel from '@/components/dashboard/StatsPanel';
import StockPanel from '@/components/dashboard/StockPanel';
import SystemPanel from '@/components/dashboard/SystemPanel';
import { PageHeader, Screen, SHADOW } from '@/components/ui';

type Tab = 'SYSTEM' | 'STATS' | 'ORDERS' | 'SCAN' | 'MENU' | 'CUSTOMERS' | 'HISTORY' | 'TEAM';
type TabDef = { key: Tab; label: string };

// Giống web (components/dashboard/HeaderTabRole.tsx)
const STAFF_TABS: TabDef[] = [
  { key: 'ORDERS', label: '📦 Đơn hàng' },
  { key: 'SCAN', label: '📷 Quét QR' },
  { key: 'MENU', label: '🛒 Kho món' },
  { key: 'CUSTOMERS', label: '🎁 Khách đổi quà' },
];
// Admin làm được mọi việc của nhân viên + quản trị
const ADMIN_TABS: TabDef[] = [
  { key: 'SYSTEM', label: '📊 Hệ thống' },
  { key: 'STATS', label: '📈 Thống kê' },
  { key: 'ORDERS', label: '📦 Đơn hàng' },
  { key: 'SCAN', label: '📷 Quét QR' },
  { key: 'MENU', label: '🍹 Món & kho' },
  { key: 'CUSTOMERS', label: '👥 Khách hàng' },
  { key: 'HISTORY', label: '🧾 Lịch sử điểm' },
];
// Chủ quán = Admin + phân quyền
const OWNER_TABS: TabDef[] = [...ADMIN_TABS, { key: 'TEAM', label: '👑 Phân quyền' }];

const tabsForRole = (role: UserRole) => (role === 'OWNER' ? OWNER_TABS : role === 'ADMIN' ? ADMIN_TABS : STAFF_TABS);

// Bảng điều khiển nhân viên / admin / chủ quán — giống web (app/admin/dashboard)
export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const fetchProducts = useProducts((s) => s.fetch);
  const [tab, setTab] = useState<Tab>(() => (user && user.role !== 'STAFF' ? 'SYSTEM' : 'ORDERS'));
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const knownIds = useRef<Set<string> | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await apiRequest<StaffOrder[]>('/orders');
      // Báo "có đơn mới" (bỏ qua lần tải đầu tiên)
      if (knownIds.current) {
        const fresh = list.filter((o) => !knownIds.current!.has(o.id) && o.status === 'PENDING');
        if (fresh.length > 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          toast.success(fresh.length === 1 ? `🔔 Đơn mới ${fresh[0].code} · ${fresh[0].customerName}` : `🔔 Có ${fresh.length} đơn mới`);
          fetchProducts(); // tồn kho vừa bị trừ
        }
      }
      knownIds.current = new Set(list.map((o) => o.id));
      setOrders(list);
    } catch (e: any) {
      toast.error(e?.message ?? 'Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await apiRequest<User[]>('/users'));
    } catch (e: any) {
      toast.error(e?.message ?? 'Không tải được danh sách người dùng');
    }
  }, []);

  // Đơn mới hiện trong ~10 giây (app chưa nhận được thông báo đẩy khi tắt màn hình)
  usePolling(loadOrders, 10_000);

  // Danh sách người dùng & menu: tải khi mở bảng điều khiển
  const staff = !!user && isStaffMember(user.role);
  useFocusEffect(
    useCallback(() => {
      if (!staff) return;
      loadUsers();
      fetchProducts();
    }, [staff, loadUsers, fetchProducts]),
  );

  if (!user || !isStaffMember(user.role)) {
    return (
      <Screen>
        <PageHeader title="Bảng điều khiển" />
        <Text className="text-center text-muted-foreground mt-10">Chỉ nhân viên cửa hàng mới mở được trang này.</Text>
      </Screen>
    );
  }

  const admin = isManager(user.role);
  const tabs = tabsForRole(user.role);
  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const customers = users.filter((u) => u.role === 'CUSTOMER');

  return (
    <Screen>
      <PageHeader title={`Bảng điều khiển · ${ROLE_LABELS[user.role]}`} onBack={() => (router.canGoBack() ? router.back() : router.replace('/profile'))} />

      {/* Thanh tab giống web (HeaderTabRole) — cuộn ngang khi nhiều tab */}
      <View className="mx-5 mb-3 bg-neutral-100 p-1 rounded-xl border border-border/80">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1 flex-grow">
          {tabs.map((t) => {
            const active = tab === t.key;
            const badge = t.key === 'ORDERS' ? pending : 0;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={active ? SHADOW.sm : undefined}
                className={cn('flex-grow py-2.5 px-3 rounded-lg flex-row items-center justify-center gap-1.5', active && 'bg-white')}
              >
                <Text className={cn('text-xs font-black', active ? 'text-primary' : 'text-muted-foreground')}>{t.label}</Text>
                {badge > 0 && (
                  <View className="min-w-5 h-5 px-1 rounded-full bg-accent items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">{badge}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex-1">
        {tab === 'SYSTEM' && admin && <SystemPanel orders={orders} users={users} onRefresh={loadUsers} />}
        {tab === 'STATS' && admin && <StatsPanel />}
        {tab === 'ORDERS' && (
          <OrdersPanel
            orders={orders}
            loading={loading}
            onRefresh={loadOrders}
            onUpdated={(o) => setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, ...o } : x)))}
          />
        )}
        {tab === 'SCAN' && <ScanPanel />}
        {tab === 'MENU' && <StockPanel canEdit={admin} />}
        {tab === 'CUSTOMERS' && <CustomersPanel customers={customers} orders={orders} isAdmin={admin} onRefresh={loadUsers} />}
        {tab === 'HISTORY' && admin && <HistoryPanel />}
        {tab === 'TEAM' && user.role === 'OWNER' && <RolePanel users={users} currentUserId={user.id} onChanged={loadUsers} />}
      </View>
    </Screen>
  );
}
