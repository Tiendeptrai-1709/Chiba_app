import { History, UserCheck, Users } from 'lucide-react';
import React from 'react'

interface HeaderTabRoleProps {
    isAdmin: boolean;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    refreshCustomers: () => void;
}

const HeaderTabRole = ({ isAdmin, activeTab, setActiveTab, refreshCustomers }: HeaderTabRoleProps) => {
    return (
        <div className="flex bg-neutral-100 p-1 rounded-xl border border-border/80 shadow-inner">
            {isAdmin ? (
                <>
                    <button
                        onClick={() => {
                            setActiveTab('SYSTEM');
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'SYSTEM' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        📊 Hệ thống
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('CUSTOMERS');
                            refreshCustomers();
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'CUSTOMERS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Users className="w-3.5 h-3.5" /> Khách hàng
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('HISTORY');
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'HISTORY' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <History className="w-3.5 h-3.5" /> Lịch sử điểm
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => {
                            setActiveTab('ORDERS');
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'ORDERS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        📦 Đơn hàng
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('STOCKS');
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'STOCKS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        🛒 Kho món
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('CUSTOMERS');
                            refreshCustomers();
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 ${activeTab === 'CUSTOMERS' ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <UserCheck className="w-3.5 h-3.5" /> Khách đổi quà
                    </button>
                </>
            )}
        </div>
    )
}

export default HeaderTabRole