import { ToggleLeft, ToggleRight } from 'lucide-react';
import React, { useState } from 'react'

const StockController = () => {

    const [productStocks, setProductStocks] = useState<Record<string, boolean>>({
        'p1': true, // Trà Thanh Đào
        'p2': true, // Trà Thạch Sen
        'b4': false // Bánh Tiramisu (Out of stock example)
    });
    // Staff action: Toggle Product Stock Availability
    const handleToggleStock = (prodId: string) => {
        setProductStocks(prev => ({
            ...prev,
            [prodId]: !prev[prodId]
        }));
    };
    return (
        <>
            {/* ========================================================
            TAB: PRODUCT STOCK CONTROLLER (STAFF ONLY)
            ======================================================== */}
            <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4 animate-fade-in">
                <div className="border-b border-border pb-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
                        🛒 Quản lý tình trạng Món (Stock)
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Nhân viên có thể bật/tắt nhanh khi hết nguyên liệu pha chế.
                    </p>
                </div>

                <div className="space-y-3.5">
                    {[
                        { id: 'p1', name: 'Trà Thanh Đào Highlands' },
                        { id: 'p2', name: 'Trà Thạch Sen Bùi Thơm' },
                        { id: 'b4', name: 'Bánh Tiramisu Highlands Mềm' }
                    ].map((prod) => {
                        const inStock = productStocks[prod.id] !== false;
                        return (
                            <div key={prod.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-border/70 hover:border-primary/20 transition">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground">{prod.name}</p>
                                    <p className="text-[9px] font-medium text-muted-foreground">ID: {prod.id}</p>
                                </div>

                                <button
                                    onClick={() => handleToggleStock(prod.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${inStock
                                        ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                        : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                        }`}
                                >
                                    {inStock ? (
                                        <>
                                            <ToggleRight className="w-5 h-5 text-primary stroke-[2.2]" /> Còn hàng
                                        </>
                                    ) : (
                                        <>
                                            <ToggleLeft className="w-5 h-5 text-destructive stroke-[2.2]" /> Hết hàng
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}

export default StockController