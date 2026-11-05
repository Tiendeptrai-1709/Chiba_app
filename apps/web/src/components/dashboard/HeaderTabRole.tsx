import React from 'react';
import { UserRole } from '@/types';

export type DashboardTab = 'SYSTEM' | 'STATS' | 'MENU' | 'CUSTOMERS' | 'HISTORY' | 'ORDERS' | 'SCAN' | 'TEAM';

type TabDef = { key: DashboardTab; label: string };

const STAFF_TABS: TabDef[] = [
  { key: 'ORDERS', label: '📦 Đơn hàng' },
  { key: 'SCAN', label: '📷 Quét QR' },
  { key: 'MENU', label: '🛒 Kho món' },
  { key: 'CUSTOMERS', label: '🎁 Khách đổi quà' },
];

// Admin làm được mọi việc của nhân viên (kể cả quét QR) + quản trị
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

export const tabsForRole = (role: UserRole): TabDef[] =>
  role === 'OWNER' ? OWNER_TABS : role === 'ADMIN' ? ADMIN_TABS : STAFF_TABS;

export const defaultTab = (role: UserRole): DashboardTab => (role === 'STAFF' ? 'ORDERS' : 'SYSTEM');

interface HeaderTabRoleProps {
  role: UserRole;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  badges?: Partial<Record<DashboardTab, number>>;
}

function HeaderTabRole({ role, activeTab, setActiveTab, badges = {} }: HeaderTabRoleProps) {
  return (
    <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl border border-border/80 shadow-inner overflow-x-auto scrollbar-none" role="tablist">
      {tabsForRole(role).map((tab) => {
        const active = activeTab === tab.key;
        const badge = badges[tab.key];
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 whitespace-nowrap py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${
              active ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {!!badge && (
              <span className="min-w-5 h-5 px-1 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default HeaderTabRole;
