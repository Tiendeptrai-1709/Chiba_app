'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { isManager, isStaffMember, Order, ROLE_LABELS, User } from '@/types';
import { apiRequest } from '@/lib/api/client';
import { ORDER_FALLBACK_POLL_MS, useOrderEvents } from '@/lib/api/events';
import { playChime } from '@/lib/chime';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { useProductStore } from '@/lib/stores/useProductStore';
import OrderFulfillment from '@/components/dashboard/OrderFulfillment';
import MenuManager from '@/components/dashboard/MenuManager';
import QrScanPanel from '@/components/dashboard/QrScanPanel';
import RoleManager from '@/components/dashboard/RoleManager';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import CustomerManager from '@/components/dashboard/CustomerManager';
import SystemOverview from '@/components/dashboard/SystemOverview';
import MenuStats from '@/components/dashboard/MenuStats';
import PointActionModal from '@/components/PointActionModal';
import HeaderTabRole, { DashboardTab, defaultTab } from '@/components/dashboard/HeaderTabRole';
import Validation from '@/components/Validation';
import PageLoader from '@/components/ui/PageLoader';

const ORDER_POLL_MS = ORDER_FALLBACK_POLL_MS; // dự phòng — đơn mới đến tức thì qua useOrderEvents

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, fetchAllUsers, allUsers } = useAuthStore();
  const { showError, showSuccess } = useNotificationStore();
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const router = useRouter();

  // OWNER có mọi quyền của ADMIN
  const isAdmin = isManager(user?.role);
  const isOwner = user?.role === 'OWNER';
  const isStaffOrAdmin = isStaffMember(user?.role);
  const [activeTab, setActiveTab] = useState<DashboardTab | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState<User[]>([]);
  const [pointAction, setPointAction] = useState<{ customer: User; type: 'REDEEM' | 'ADJUST' } | null>(null);

  useEffect(() => {
    if (user && !activeTab) setActiveTab(defaultTab(user.role));
  }, [user, activeTab]);

  // Chỉ ADMIN / STAFF được vào
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isStaffOrAdmin)) router.push('/');
  }, [isAuthenticated, isStaffOrAdmin, loading, router]);

  const refreshCustomers = useCallback(async () => {
    try {
      const users = await fetchAllUsers();
      setAllCustomers(users.filter((u) => u.role === 'CUSTOMER'));
    } catch (e: any) {
      showError(e?.message || 'Không tải được danh sách khách hàng');
    }
  }, [fetchAllUsers, showError]);

  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      setOrders(await apiRequest<Order[]>('/orders'));
    } catch (e: any) {
      showError(e?.message || 'Không tải được đơn hàng');
    } finally {
      setOrdersLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    if (!isAuthenticated || !isStaffOrAdmin) return;
    refreshCustomers();
    refreshOrders();
    fetchProducts(true);
    // Dự phòng khi kết nối tức thì bị chặn (mạng/proxy): vẫn tải lại định kỳ
    const timer = setInterval(refreshOrders, ORDER_POLL_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, isStaffOrAdmin, refreshCustomers, refreshOrders, fetchProducts]);

  // Báo đơn mới tức thì: kêu "ting", hiện thông báo, tải lại danh sách đơn và tồn kho
  useOrderEvents('/orders/stream', isAuthenticated && isStaffOrAdmin, (e) => {
    refreshOrders();
    if (e.type === 'order.created') {
      fetchProducts(true);
      playChime();
      navigator.vibrate?.([120, 60, 120]);
      showSuccess(`🔔 Có đơn mới ${e.code}`);
    }
  });

  // SystemOverview dùng callback kiểu cũ → chuyển sang thông báo chung
  const handleNotification = (type: 'success' | 'error', msg: string) =>
    type === 'success' ? showSuccess(msg) : showError(msg);

  const changeTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tab === 'CUSTOMERS' || tab === 'TEAM') refreshCustomers();
    if (tab === 'ORDERS') refreshOrders();
  };

  if (loading || !isAuthenticated || !user || !isStaffOrAdmin || !activeTab) return <PageLoader text="Đang tải bảng điều khiển..." />;

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              aria-label="Về hồ sơ"
              className="p-2 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">📊 Bảng điều khiển {ROLE_LABELS[user.role]}</h1>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isOwner ? 'bg-amber-100 text-amber-800' : isAdmin ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-strong'
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 w-full flex-grow">
        <HeaderTabRole role={user.role} activeTab={activeTab} setActiveTab={changeTab} badges={{ ORDERS: pendingCount }} />

        <Validation />

        {isAdmin && activeTab === 'SYSTEM' && (
          <SystemOverview orders={orders} allCustomers={allCustomers} onSetNotification={handleNotification} />
        )}

        {activeTab === 'ORDERS' && (
          <OrderFulfillment
            orders={orders}
            loading={ordersLoading}
            onRefresh={refreshOrders}
            onUpdated={(updated) => {
              setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
              if (updated.status === 'COMPLETED' || updated.status === 'CANCELLED') refreshCustomers();
            }}
          />
        )}

        {isAdmin && activeTab === 'STATS' && <MenuStats />}

        {activeTab === 'MENU' && <MenuManager canEditImages={isAdmin} />}

        {activeTab === 'SCAN' && <QrScanPanel />}

        {isOwner && activeTab === 'TEAM' && (
          <RoleManager users={allUsers} currentUserId={user.id} onChanged={refreshCustomers} />
        )}

        {activeTab === 'CUSTOMERS' && (
          <CustomerManager
            orders={orders}
            allCustomers={allCustomers}
            isAdmin={isAdmin}
            onTriggerAction={(customer, type) => setPointAction({ customer, type })}
          />
        )}

        {isAdmin && activeTab === 'HISTORY' && <TransactionHistory />}

        <div className="p-4 bg-[#FAF7F2] border border-border rounded-xl flex gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">Vai trò hệ thống:</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isOwner
                ? 'Chủ quán: mọi quyền của Admin, thêm quyền thăng cấp / hạ cấp Nhân viên và Admin.'
                : isAdmin
                  ? 'Admin: làm mọi việc của nhân viên, cộng thêm thống kê, sửa menu & ảnh, điều chỉnh điểm và xem nhật ký điểm.'
                  : 'Nhân viên: xử lý đơn hàng, cập nhật số lượng món, quét QR tích điểm và đổi quà tại quầy cho khách.'}
            </p>
          </div>
        </div>
      </div>

      {pointAction && (
        <PointActionModal action={pointAction} onClose={() => setPointAction(null)} onSuccess={refreshCustomers} />
      )}
    </div>
  );
}
