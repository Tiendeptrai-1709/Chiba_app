
import { api } from '@/lib/axios';
import { Order, useGetUserOrder } from '@chiba/api-client';
import { History, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react'

const TransactionHistory = () => {
    const { data: orders, isPending: isOrderLoading } = useGetUserOrder(api);
    const [historySearchQuery, setHistorySearchQuery] = useState("");

    const monthOrders = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        return orders?.filter((order:Order) => {
            if (!order.completedAt) return false;

            const completedAt = new Date(order.completedAt);

            return completedAt >= thirtyDaysAgo && completedAt <= now;
        });
    }, [orders]);

    const filteredHistory = monthOrders?.filter((order:Order) => {
        if (order.status !== "COMPLETED") {
            return false;
        }

        const query = historySearchQuery.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            order.id.toLowerCase().includes(query) ||
            (order.user?.fullName ?? "").toLowerCase().includes(query) ||
            (order.user?.email ?? "").toLowerCase().includes(query) ||
            (order.user?.customerCode ?? "").toLowerCase().includes(query)
        );
    });
    return (
        <>
            {/* ========================================================
            TAB: POINT TRANSACTION HISTORY (ADMIN ONLY)
            ======================================================== */}
            <div className="space-y-4">
                <div className="border-b border-border/60 pb-2">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                        <History className="w-4 h-4 text-primary" /> Nhật ký giao dịch toàn hệ thống
                    </h2>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Lịch sử ghi nhận tất cả giao dịch trong vòng 30 ngày
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
                <div className="max-h-[500px] overflow-y-auto bg-card border border-border rounded-2xl divide-y divide-border/60 shadow-sm">
                    {!isOrderLoading ? filteredHistory.map((tx:Order) => (
                        <div
                            key={tx.id}
                            className="p-4 hover:bg-neutral-50/40 transition flex items-start justify-between gap-4"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-foreground">
                                        {tx.user?.fullName ?? "Khách hàng"}
                                    </span>

                                    <span className="text-[9.5px] text-muted-foreground font-medium">
                                        ({tx.user?.email ?? "Chưa có email"})
                                    </span>

                                    <span className="text-[8.5px] font-black px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                                        Đơn hoàn thành
                                    </span>
                                </div>

                                <p className="text-xs text-neutral-600 font-semibold">
                                    Mã đơn: {tx.id}
                                </p>

                                <div className="flex gap-2.5 text-[9.5px] text-muted-foreground/70 font-semibold mt-0.5 flex-wrap">
                                    <span>Điểm tích lũy: {tx.earnedPoints ?? 0}</span>
                                    <span>•</span>
                                    <span>Điểm đã dùng: {tx.pointsUsed ?? 0}</span>
                                    <span>•</span>
                                    <span>
                                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                                    </span>
                                </div>
                            </div>

                            <div className="text-xs font-black whitespace-nowrap px-2 py-1 rounded bg-green-50 text-green-600">
                                {Number(tx.totalAmount).toLocaleString("vi-VN")} ₫
                            </div>
                        </div>
                    )) : (
                        <p className="p-4 flex items-start justify-between gap-4">Đang tải thông tin người dùng...</p>
                    )}

                    {filteredHistory?.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-xs text-muted-foreground font-bold">
                                Không tìm thấy đơn hàng nào
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                Hệ thống chưa ghi nhận đơn hàng hoàn thành tương ứng
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default TransactionHistory