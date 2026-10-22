'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

import StockController from '@/components/dashboard/StockController';
import OrderFulfillment from '@/components/dashboard/OrderFulfillment';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import CustomerManager from '@/components/dashboard/CustomerManager';
import SystemOverview from '@/components/dashboard/SystemOverview';
import { PointActionModal } from '@/components/dashboard/PointActionModal';
import HeaderTabRole from '@/components/dashboard/HeaderTabRole';
import { useGetAllCustomers, useGetAllOrders, useGetUserById, useProfile, User, useUpdateOrderStatus } from '@chiba/api-client';
import { api } from '@/lib/axios';
import { useNotificationStore } from '@chiba/api-client/src/stores/useNotificationStore';

export interface MockOrder {
  id: string;
  userId?: string;
  customerName: string;
  address: string;
  items: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

const AdminDashboard = () => {
  const { data: user, isLoading } = useProfile(api)
  const { data: allCustomers } = useGetAllCustomers(api)
  const { mutateAsync: getUserById } = useGetUserById(api)
  const {mutate: updateStatusOrder, isPending: isUpdateStatus} = useUpdateOrderStatus(api)
  const { data: allOrders } = useGetAllOrders(api)
  const { showSuccess, showError } = useNotificationStore()

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openPointModal, setOpenPointModal] = useState(false);
  const router = useRouter();

  // Navigation tab state
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState<string>('');

  // Set default tab based on role once user loads
  useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'ADMIN' ? 'SYSTEM' : 'ORDERS');
    }
  }, [user]);

  // Loyalty Points Admin States
  const handleSelectUser = async (id: string) => {
    try {
      const user = await getUserById(id);

      setSelectedUser(user);
      setOpenPointModal(true);
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
    }
  };

  const onUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateStatusOrder({ orderId, newStatus });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái đơn hàng.";
      showError(message)
    }
  }

  const handleNotification = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      showSuccess(msg);
      showError('');
    } else {
      showError(msg);
      showSuccess('');
    }
  };

  // Guard routing for admin and staff
  useEffect(() => {
    if (!isLoading) {
      if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile" className="p-2 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">
              📊 Bảng điều khiển {isAdmin ? 'Admin' : 'Nhân Viên'}
            </h1>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${isAdmin ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'
            }`}>
            Role: {user.role}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6 w-full flex-grow animate-fade-in">

        {/* Navigation Tabs based on role */}
        {activeTab && (
          <HeaderTabRole
            isAdmin={isAdmin}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Global Notifications */}

        {/* ========================================================
            TAB: SYSTEM OVERVIEW (ADMIN ONLY)
            ======================================================== */}
        {isAdmin && activeTab === 'SYSTEM' && (
          <SystemOverview
            allOrders={allOrders}
            allCustomers={allCustomers}
            onSetNotification={handleNotification}
            user={user}
          />)
        }

        {/* ========================================================
            TAB: CUSTOMERS & POINTS REDEMPTION (ADMIN & STAFF)
            ======================================================== */}
        {activeTab === 'CUSTOMERS' && (
          <CustomerManager
            allCustomers={allCustomers}
            isAdmin={isAdmin}
            handleSelectUser={handleSelectUser}
          />
        )}

        {/* ========================================================
            TAB: POINT TRANSACTION HISTORY (ADMIN ONLY)
            ======================================================== */}
        {isAdmin && activeTab === 'HISTORY' && <TransactionHistory />}

        {/* ========================================================
            TAB: ORDERS FULFILLMENT (STAFF ONLY)
            ======================================================== */}
        {!isAdmin && activeTab === 'ORDERS' && (
          <OrderFulfillment
            allOrders={allOrders}
            onUpdateStatus={onUpdateStatus}
            isUpdateStatus={isUpdateStatus}
          />)}

        {/* ========================================================
            TAB: PRODUCT STOCK CONTROLLER (STAFF ONLY)
            ======================================================== */}
        {!isAdmin && activeTab === 'STOCKS' && <StockController />}

        {/* Demo Info Box */}
        <div className=" p-4 bg-[#FAF7F2] border border-border rounded-xl flex gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground">Vai Trò Hệ Thống:</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isAdmin
                ? 'Bạn đang ở chế độ Admin: Quản lý thống kê, mời nhân viên mới, CRUD điểm tích lũy và kiểm tra nhật ký điểm.'
                : 'Bạn đang ở chế độ Staff: Giúp Admin vận hành đơn hàng, quản lý tình trạng còn/hết món, tra cứu và trừ điểm đổi quà tại quầy cho khách.'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL: REDEEM OR ADJUST POINTS FOR SELECTED CUSTOMER
          ======================================================== */}

      <PointActionModal
        openPointModal={openPointModal}
        setOpenPointModal={setOpenPointModal}
        selectedUser={selectedUser}
      />

    </div>
  );
}

export default AdminDashboard;
