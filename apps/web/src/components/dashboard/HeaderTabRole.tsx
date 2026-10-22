import React from 'react'

interface HeaderTabRoleProps {
    isAdmin: boolean;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const HeaderTabRole = ({ isAdmin, activeTab, setActiveTab }: HeaderTabRoleProps) => {
    const tabs = isAdmin
        ? [
            { id: "SYSTEM", label: "📊 Hệ thống" },
            { id: "CUSTOMERS", label: "👥 Khách hàng" },
            { id: "HISTORY", label: "📜 Lịch sử" },
        ]
        : [
            { id: "ORDERS", label: "📦 Đơn hàng" },
            { id: "STOCKS", label: "🛒 Kho món" },
            { id: "CUSTOMERS", label: "👤 Khách" },
        ];
    return (
        <div className="flex bg-neutral-100 p-1 rounded-xl border border-border/80 shadow-inner">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <>
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                // if (tab.id === "CUSTOMERS") {
                                //     refreshCustomers();
                                // }
                            }}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${isActive ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    </>
                )
            })}

        </div>
    )
}

export default HeaderTabRole