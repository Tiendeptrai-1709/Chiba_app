
import { History, Search } from 'lucide-react';
import React, { useState } from 'react'

const TransactionHistory = () => {
    // const { getPointHistory } = useAuthStore();
    const [historySearchQuery, setHistorySearchQuery] = useState('');

    // const allHistory = getPointHistory ? getPointHistory() : [];
    // const filteredHistory = allHistory.filter(tx => {
    //     const query = historySearchQuery.toLowerCase().trim();
    //     if (!query) return true;
    //     return (
    //         tx.userName.toLowerCase().includes(query) ||
    //         tx.userEmail.toLowerCase().includes(query) ||
    //         tx.description.toLowerCase().includes(query)
    //     );
    // });
    return (
        <>
            {/* ========================================================
            TAB: POINT TRANSACTION HISTORY (ADMIN ONLY)
            ======================================================== */}
            <div className="space-y-4">
                <div className="border-b border-border/60 pb-2">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                        <History className="w-4 h-4 text-primary" /> Nhật ký giao dịch điểm toàn hệ thống
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Lịch sử ghi nhận tất cả thay đổi tích điểm tự động hoặc điều chỉnh từ Admin/đổi quà tại quầy.
                    </p>
                </div>

                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                        type="text"
                        placeholder="Lọc lịch sử theo tên khách hàng, email hoặc nội dung..."
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm"
                    />
                </div>

                {/* Point History Log */}
                {/* <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border/60 shadow-sm">
                    {filteredHistory.map(tx => {
                        const isPositive = tx.points >= 0;
                        return (
                            <div key={tx.id} className="p-4 hover:bg-neutral-50/40 transition flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-foreground">{tx.userName}</span>
                                        <span className="text-[9.5px] text-muted-foreground font-medium">({tx.userEmail})</span>
                                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase ${tx.type === 'EARNED_ORDER' ? 'bg-green-50 text-green-700 border border-green-200' :
                                            tx.type === 'REDEEMED_APP' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                tx.type === 'REDEEMED_STORE' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                                    'bg-purple-50 text-purple-700 border border-purple-200'
                                            }`}>
                                            {tx.type === 'EARNED_ORDER' ? 'Tích đơn' :
                                                tx.type === 'REDEEMED_APP' ? 'Tiêu app' :
                                                    tx.type === 'REDEEMED_STORE' ? 'Tiêu quầy' : 'Admin chỉnh'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-neutral-600 font-semibold">{tx.description}</p>
                                    <div className="flex gap-2.5 text-[9.5px] text-muted-foreground/70 font-semibold mt-0.5 flex-wrap">
                                        <span>Số dư trước: {tx.pointsBefore || 0}</span>
                                        <span>•</span>
                                        <span>Số dư sau: {tx.pointsAfter || 0}</span>
                                        <span>•</span>
                                        <span>{new Date(tx.createdAt).toLocaleString('vi-VN')}</span>
                                    </div>
                                </div>

                                <div className={`text-xs font-black whitespace-nowrap px-2 py-1 rounded ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-destructive'
                                    }`}>
                                    {isPositive ? '+' : ''}{tx.points}
                                </div>
                            </div>
                        );
                    })}

                    {filteredHistory.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xs text-muted-foreground font-bold">Không tìm thấy giao dịch nào</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Hệ thống chưa ghi nhận giao dịch điểm tương ứng</p>
                        </div>
                    )}
                </div> */}
            </div>
        </>
    )
}

export default TransactionHistory