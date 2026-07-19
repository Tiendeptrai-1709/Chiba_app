import { useCart } from '@/lib/context/CartContext'
import { Coffee, Trash2 } from 'lucide-react'
import React from 'react'

function CartItemsList() {
    const {items, updateQuantity, removeItem} = useCart();
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border interactive-card">
                    {/* Icon */}
                    <div className="w-12 h-12 flex items-center justify-center bg-muted text-2xl rounded-xl">
                        <Coffee className="w-6 h-6 text-primary" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-snug">{item.name}</h3>

                        {/* Display selected toppings list beautifully */}
                        {item.selectedToppings && item.selectedToppings.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight italic font-medium">
                                + Toppings: {item.selectedToppings.map(t => t.name).join(', ')}
                            </p>
                        )}

                        <p className="text-primary font-bold text-sm mt-1">
                            {item.price.toLocaleString('vi-VN')}₫
                        </p>
                    </div>

                    {/* Quantity Actions */}
                    <div className="flex items-center gap-1.5 bg-neutral-50 border border-border px-1.5 py-1 rounded-lg">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white hover:bg-neutral-100 text-foreground border border-border rounded font-bold transition active:scale-90"
                        >
                            −
                        </button>
                        <span className="w-8 text-center font-bold text-sm text-foreground">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white hover:bg-neutral-100 text-foreground border border-border rounded font-bold transition active:scale-90"
                        >
                            +
                        </button>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-destructive hover:bg-destructive/5 rounded-lg transition active:scale-90"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            ))}
        </div>
    )
}

export default CartItemsList