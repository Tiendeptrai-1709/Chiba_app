import React from 'react';

export type DashboardTab = 'SYSTEM' | 'MENU' | 'CUSTOMERS' | 'HISTORY' | 'ORDERS' | 'SCAN';

const ADMIN_TABS: { key: DashboardTab; label: string }[] = [
  { key: 'SYSTEM', label: '📊 Hệ thống' },
  { key: 'ORDERS', label: '📦 Đơn hàng' },
  { key: 'MENU', label: '🍹 Món & ảnh' },
  { key: 'CUSTOMERS', label: '👥 Khách hàng' },
  { key: 'HISTORY', label: '🧾 Lịch sử điểm' },
];

const STAFF_TABS: { key: DashboardTab; label: string }[] = [
  { key: 'ORDERS', label: '📦 Đơn hàng' },
  { key: 'SCAN', label: '📷 Quét QR' },
  { key: 'MENU', label: '🛒 Kho món' },
  { key: 'CUSTOMERS', label: '🎁 Khách đổi quà' },
];

export const defaultTab = (isAdmin: boolean): DashboardTab => (isAdmin ? 'SYSTEM' : 'ORDERS');

interface HeaderTabRoleProps {
  isAdmin: boolean;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  badges?: Partial<Record<DashboardTab, number>>;
}

function HeaderTabRole({ isAdmin, activeTab, setActiveTab, badges = {} }: HeaderTabRoleProps) {
  const tabs = isAdmin ? ADMIN_TABS : STAFF_TABS;
  return (
    <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl border border-border/80 shadow-inner overflow-x-auto scrollbar-none" role="tablist">
      {tabs.map((tab) => {
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
