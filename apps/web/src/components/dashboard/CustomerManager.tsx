
import { User } from '@chiba/api-client';
import { Coins, Search, User2 } from 'lucide-react';
import React, { useState } from 'react'

interface CustomerManagerProps {
    allCustomers: User[];
    isAdmin: boolean;
    handleSelectUser: (id:string) => void;
}
const CustomerManager = ({ allCustomers, isAdmin, handleSelectUser }: CustomerManagerProps) => {
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
                <div className="max-h-[500px] overflow-y-auto space-y-3">
                    {filteredCustomers.map(cust => (
                        <div key={cust.id} className="p-4 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-20 h-20 bg-neutral-200 border-4 border-white shadow-premium rounded-full flex items-center justify-center text-neutral-500 overflow-hidden mb-4">
                                    <User2 />
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
                                        <span className="text-[10px] font-bold text-accent bg-orange-50 border border-orange-100/50 px-2 py-0.5 rounded flex items-center gap-1 ">
                                            <Coins className="w-3.5 h-3.5" /> Điểm: <strong className="font-black ">{cust.zenPoints || 0}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 self-end sm:self-center">
                                {isAdmin && (
                                    <button
                                        onClick={() => handleSelectUser(cust.id)}
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