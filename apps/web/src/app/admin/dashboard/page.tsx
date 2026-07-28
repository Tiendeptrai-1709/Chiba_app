'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { User } from '@/types';
import StockController from '@/components/dashboard/StockController';
import OrderFulfillment from '@/components/dashboard/OrderFulfillment';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import CustomerManager from '@/components/dashboard/CustomerManager';
import SystemOverview from '@/components/dashboard/SystemOverview';
import PointActionModal from '@/components/PointActionModal';
import HeaderTabRole from '@/components/dashboard/HeaderTabRole';
import Validation from '@/components/Validation';
import { useProfile } from '@/hooks/useUser';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';

export interface MockOrder {
  id: string;
  userId?: string;
  customerName: string;
  address: string;
  items: string;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export default function AdminDashboard() {
  const { data: user, isLoading } = useProfile()
  const {showSuccess,showError} = useNotificationStore()
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

  // Simulated Order list
  const [mockOrders, setMockOrders] = useState<MockOrder[]>([]);

  // Loyalty Points Admin States
  const [allCustomers] = useState<User[]>([]);

  const [pointAction, setPointAction] = useState<{
    customer: User;
    type: "REDEEM" | "ADJUST"
  } | null>(null)

  const handleNotification = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') {
      showSuccess(msg);
      showError('');
    } else {
      showError(msg);
      showSuccess('');
    }
  };

  const handleOnClose = () => {
    setPointAction(null);
  }

  // Guard routing for admin and staff
  useEffect(() => {
    if (!isLoading) {
      if (user?.role !== 'ADMIN' && user?.role !== 'STAFF') {
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  // // Refresh customer list from simulated DB
  const refreshCustomers = () => {
    // if (getAllUsers) {
    //   setAllCustomers(getAllUsers().filter(u => u.role === 'CUSTOMER'));
    // }
  };

  // Load actual orders from localStorage (or seed mock ones if none exist)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem('zen_fb_orders');
      if (storedOrders) {
        try {
          setMockOrders(JSON.parse(storedOrders));
        } catch (e) {
          console.error('Failed to parse stored orders', e);
        }
      } else {
        // Seed initial orders to make the dashboard feel alive instantly
        const defaultOrders: MockOrder[] = [
          {
            id: 'DH001',
            userId: 'user_1',
            customerName: 'Nguyễn Văn A',
            address: '123 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. HCM',
            items: '2x Trà Thạch Sen Bùi Thơm (Trân Châu Hoàng Kim), 1x Bánh Mì Que Pate Xá Xíu',
            total: 127000,
            status: 'PENDING'
          },
          {
            id: 'DH002',
            customerName: 'Lê Thị B',
            address: '456 Đường Lê Lợi, Quận 1, TP. HCM',
            items: '1x Trà Thanh Đào Highlands (Thạch Đào Giòn Sần Sật), 1x Bánh Tiramisu Highlands Mềm',
            total: 88000,
            status: 'CONFIRMED'
          },
          {
            id: 'DH003',
            customerName: 'Trần Văn C',
            address: '789 Đường Nguyễn Huệ, Quận 1, TP. HCM',
            items: '2x Phin Sữa Đá Đậm Đà',
            total: 70000,
            status: 'PENDING'
          }
        ];
        localStorage.setItem('zen_fb_orders', JSON.stringify(defaultOrders));
        setMockOrders(defaultOrders);
      }
      // refreshCustomers();
    }
  }, []);

  if (isLoading || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
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
            refreshCustomers={refreshCustomers}
          />
        )}

        {/* Global Notifications */}
        <Validation />

        {/* ========================================================
            TAB: SYSTEM OVERVIEW (ADMIN ONLY)
            ======================================================== */}
        {isAdmin && activeTab === 'SYSTEM' && (
          <SystemOverview
            mockOrders={mockOrders}
            allCustomers={allCustomers}
            onSetNotification={handleNotification} />)}

        {/* ========================================================
            TAB: CUSTOMERS & POINTS REDEMPTION (ADMIN & STAFF)
            ======================================================== */}
        {activeTab === 'CUSTOMERS' && (
          <CustomerManager
            mockOrders={mockOrders}
            allCustomers={allCustomers}
            isAdmin={isAdmin}
            onTriggerAction={(customer, type) => {
              setPointAction({ customer, type })
            }}
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
            mockOrders={mockOrders}
            setMockOrders={setMockOrders} />)}

        {/* ========================================================
            TAB: PRODUCT STOCK CONTROLLER (STAFF ONLY)
            ======================================================== */}
        {!isAdmin && activeTab === 'STOCKS' && <StockController />}

        {/* Demo Info Box */}
        <div className="p-4 bg-[#FAF7F2] border border-border rounded-xl flex gap-3">
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
      {pointAction && (
        <PointActionModal
          action={pointAction}
          onClose={handleOnClose}
          onSetNotification={handleNotification} />
      )}
    </div>
  );
}
