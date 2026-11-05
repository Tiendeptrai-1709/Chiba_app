'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Order, User } from '@/types';
import { apiRequest } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { useProductStore } from '@/lib/stores/useProductStore';
import OrderFulfillment from '@/components/dashboard/OrderFulfillment';
import MenuManager from '@/components/dashboard/MenuManager';
import QrScanPanel from '@/components/dashboard/QrScanPanel';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import CustomerManager from '@/components/dashboard/CustomerManager';
import SystemOverview from '@/components/dashboard/SystemOverview';
import PointActionModal from '@/components/PointActionModal';
import HeaderTabRole, { DashboardTab, defaultTab } from '@/components/dashboard/HeaderTabRole';
import Validation from '@/components/Validation';
import PageLoader from '@/components/ui/PageLoader';

const ORDER_POLL_MS = 15_000;

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, fetchAllUsers } = useAuthStore();
  const { showError, showSuccess } = useNotificationStore();
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const router = useRouter();

  const isAdmin = user?.role === 'ADMIN';
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const [activeTab, setActiveTab] = useState<DashboardTab | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [allCustomers, setAllCustomers] = useState<User[]>([]);
  const [pointAction, setPointAction] = useState<{ customer: User; type: 'REDEEM' | 'ADJUST' } | null>(null);

  useEffect(() => {
    if (user && !activeTab) setActiveTab(defaultTab(user.role === 'ADMIN'));
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
    // Tự tải lại đơn mới định kỳ để nhân viên không bỏ sót đơn
    const timer = setInterval(refreshOrders, ORDER_POLL_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, isStaffOrAdmin, refreshCustomers, refreshOrders, fetchProducts]);

  // SystemOverview dùng callback kiểu cũ → chuyển sang thông báo chung
  const handleNotification = (type: 'success' | 'error', msg: string) =>
    type === 'success' ? showSuccess(msg) : showError(msg);

  const changeTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tab === 'CUSTOMERS') refreshCustomers();
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
            <h1 className="text-lg font-bold text-foreground">📊 Bảng điều khiển {isAdmin ? 'Admin' : 'Nhân viên'}</h1>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isAdmin ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-strong'
            }`}
          >
            {user.role}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 w-full flex-grow">
        <HeaderTabRole isAdmin={isAdmin} activeTab={activeTab} setActiveTab={changeTab} badges={{ ORDERS: pendingCount }} />

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

        {activeTab === 'MENU' && <MenuManager canEditImages={isAdmin} />}

        {!isAdmin && activeTab === 'SCAN' && <QrScanPanel />}

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
              {isAdmin
                ? 'Admin: xem thống kê, xử lý đơn, quản lý món & ảnh, điều chỉnh điểm và xem nhật ký điểm.'
                : 'Nhân viên: xử lý đơn hàng, báo hết món, quét QR tích điểm và đổi quà tại quầy cho khách.'}
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
