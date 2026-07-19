import { User } from '@/types';
import { Coins, Search } from 'lucide-react';
import React, { useState } from 'react'

interface CustomerManagerProps {
    mockOrders: any[];
    allCustomers: User[];
    isAdmin: boolean;
    onTriggerAction: (customer: User, type: 'REDEEM' | 'ADJUST') => void;
}
function CustomerManager({ mockOrders, allCustomers, isAdmin, onTriggerAction }: CustomerManagerProps) {
    const [customerSearchQuery, setCustomerSearchQuery] = useState('');

    const filteredCustomers = allCustomers.filter(c => {
        const query = customerSearchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            c.fullName.toLowerCase().includes(query) ||
            (c.phone && c.phone.includes(query)) ||
            c.customerCode.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query)
        );
    });

    const getCompletedOrdersCount = (cust: User) => {
        return mockOrders.filter(o => (o.userId === cust.id || o.customerName === cust.fullName) && o.status === 'COMPLETED').length;
    };
    return (
        <>
            {/* ========================================================
            TAB: CUSTOMERS & POINTS REDEMPTION (ADMIN & STAFF)
            ======================================================== */}
            <div className="space-y-4">
                <div className="border-b border-border/60 pb-2">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        👥 Quản lý điểm & đổi thưởng khách hàng
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Tìm kiếm khách hàng bằng tên, SĐT, hoặc mã khách hàng để thực hiện đổi quà tại quầy hoặc CRUD điểm.
                    </p>
                </div>

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                        type="text"
                        placeholder="Tìm khách hàng theo Tên, Số điện thoại hoặc Mã..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm transition-all"
                    />
                </div>

                {/* Customer List */}
                <div className="space-y-3">
                    {filteredCustomers.map(cust => (
                        <div key={cust.id} className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent/10 text-accent-foreground font-black flex items-center justify-center rounded-full text-xs">
                                    {cust.fullName[0].toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-foreground">{cust.fullName}</span>
                                        <span className="text-[9.5px] font-black px-1.5 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 tracking-widest">
                                            {cust.customerCode}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium">{cust.email} | SĐT: {cust.phone || 'Chưa cập nhật'}</p>

                                    <div className="flex gap-4 pt-1">
                                        <span className="text-[10px] font-bold text-accent-foreground bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded flex items-center gap-1">
                                            <Coins className="w-3.5 h-3.5 text-accent" /> Điểm: <strong className="font-black text-sm">{cust.zenPoints || 0}</strong>
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                            🛍️ Đã mua: <strong className="text-foreground">{getCompletedOrdersCount(cust)} đơn hàng</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 self-end sm:self-center">
                                <button
                                    onClick={() => onTriggerAction(cust, "REDEEM")}
                                    className="text-[10px] font-black text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 px-3 py-2 rounded-xl active:scale-95 transition"
                                >
                                    🎁 Đổi quà tại quầy
                                </button>
                                {isAdmin && (
                                    <button
                                        onClick={() => onTriggerAction(cust, "ADJUST")}
                                        className="text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-2 rounded-xl active:scale-95 transition"
                                    >
                                        ✏️ Điều chỉnh điểm
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-10 bg-neutral-50 rounded-2xl border border-dashed border-border/80">
                            <p className="text-xs text-muted-foreground font-bold">Không tìm thấy khách hàng nào</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Vui lòng kiểm tra lại từ khóa tìm kiếm</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default CustomerManager