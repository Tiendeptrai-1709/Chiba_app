import React from 'react'

interface OrderTypeSectionProps{
    orderType:string;
    setOrderType: React.Dispatch<React.SetStateAction<"DELIVERY" | "PICKUP">>;
}

export const OrderTypeSection =({orderType, setOrderType}: OrderTypeSectionProps) => {
    return (
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-border/40 pb-2">
                📋 Hình Thức Nhận Hàng
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setOrderType('DELIVERY')}
                    className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-98 ${orderType === 'DELIVERY'
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-sm'
                            : 'border-border bg-neutral-50/50 text-muted-foreground hover:bg-neutral-50'
                        }`}
                >
                    <span className="text-lg">🛵</span>
                    <span>Giao tận nơi (Ship đi)</span>
                </button>

                <button
                    onClick={() => setOrderType('PICKUP')}
                    className={`py-3.5 px-4 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all active:scale-98 ${orderType === 'PICKUP'
                            ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary/20 shadow-sm'
                            : 'border-border bg-neutral-50/50 text-muted-foreground hover:bg-neutral-50'
                        }`}
                >
                    <span className="text-lg">🏠</span>
                    <span>Đến nhận tại quán</span>
                </button>
            </div>
        </div>
    )
}