import { MockOrder } from '@/app/admin/dashboard/page';
// import { User } from '@/types';
import { CheckCircle2, Clock } from 'lucide-react';
import React from 'react'

interface OrderFulfillmentProps {
    mockOrders: any[];
    setMockOrders: React.Dispatch<React.SetStateAction<MockOrder[]>>;
    
}

function OrderFulfillment({ mockOrders, setMockOrders }: OrderFulfillmentProps) {

    const handleUpdateOrderStatus = (orderId: string, nextStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
        setMockOrders(prev => {
            const updated = prev.map(ord => ord.id === orderId ? { ...ord, status: nextStatus } : ord);
            if (typeof window !== 'undefined') {
                localStorage.setItem('zen_fb_orders', JSON.stringify(updated));
            }
            return updated;
        });
    };

    return (
        <>
            {/* ========================================================
            TAB: ORDERS FULFILLMENT (STAFF ONLY)
            ======================================================== */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border pb-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
                        📦 Hỗ trợ đơn hàng hoạt động
                    </h3>
                    <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        Fulfillment
                    </span>
                </div>

                {mockOrders.length > 0 ? (
                    <div className="space-y-3">
                        {mockOrders.map((order) => (
                            <div key={order.id} className="p-4 bg-neutral-50 rounded-xl border border-border space-y-3 shadow-sm hover:border-primary/20 transition">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-primary">{order.id}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {order.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                        {order.status}
                                    </span>
                                </div>

                                <div className="space-y-1.5 border-y border-border/40 py-2">
                                    <p className="text-xs font-black text-foreground">Khách: {order.customerName}</p>

                                    {/* Delivery Address display */}
                                    <p className="text-[10.5px] text-muted-foreground font-bold flex items-start gap-1">
                                        <span className="shrink-0 text-xs">📍</span>
                                        <span>Giao tới: {order.address}</span>
                                    </p>

                                    <p className="text-xs text-neutral-600 font-semibold bg-white p-2 rounded-lg border border-border/50 shadow-inner">
                                        {order.items}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-xs font-black text-primary">Giá: {order.total.toLocaleString('vi-VN')}₫</p>

                                    {/* Fulfill actions */}
                                    {order.status !== 'COMPLETED' && (
                                        <div className="flex gap-2">
                                            {order.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition active:scale-95 shadow-sm"
                                                >
                                                    Xác nhận đơn
                                                </button>
                                            )}
                                            {order.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                                                    className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition active:scale-95 shadow-sm"
                                                >
                                                    Hoàn thành pha chế ✓
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground text-center py-8 bg-neutral-50 rounded-xl border border-dashed border-border">
                        Chưa có đơn hàng nào cần xử lý.
                    </p>
                )}
            </div>
        </>
    )
}

export default OrderFulfillment