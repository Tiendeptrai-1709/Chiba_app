
// import { Coffee, Trash2 } from 'lucide-react'
import { api } from '@/lib/axios'
import { useClearCart, useGetCart, useRemoveItem, useUpdateItem } from '@chiba/api-client'
import { CartItem, Product } from '@chiba/api-client/src/types'
import { Coffee, Trash2, X } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

export const CartItemsList = () => {
    const { data: carts } = useGetCart(api);
    const { mutate: updateItem } = useUpdateItem(api)
    const { mutate: removeItem } = useRemoveItem(api)
    const { mutate: clearCart } = useClearCart(api)

    const [isOpen, setIsOpen] = useState(false)

    const handleUpdateItem = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            return;
        }
        updateItem({ itemId, quantity });
    };

    const handleRemoveItem = (itemId: string) => {
        removeItem(itemId)
    }

    const handleClearCart = () => {
        setIsOpen(true)
    }
    return (
        <div className="space-y-3">
            <span onClick={handleClearCart} className='flex justify-end font-medium text-destructive hover:cursor-pointer hover:underline'>Xóa tất cả</span>
            {carts.items?.map((item: CartItem) => {
                const toppingsPrice = item.toppings.reduce(
                    (sum, cartTopping) =>
                        sum + cartTopping.topping.price,
                    0
                );

                const itemUnitPrice = item.product.price + toppingsPrice;
                const itemTotalPrice = itemUnitPrice * item.quantity;
                return (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border interactive-card"
                    >
                        {/* Icon */}
                        <div className="w-12 h-12 flex items-center justify-center bg-muted text-2xl rounded-xl">
                            <Coffee className="w-6 h-6 text-primary" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm leading-snug">
                                {item.product.name}
                            </h3>

                            {item.toppings.length > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight italic font-medium">
                                    + Toppings:{" "}
                                    {item.toppings
                                        .map(
                                            (cartTopping) =>
                                                cartTopping.topping.name
                                        )
                                        .join(", ")}
                                </p>
                            )}
                            <p className="text-primary font-bold text-sm mt-1">
                                {itemTotalPrice.toLocaleString("vi-VN")}₫
                            </p>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-1.5 bg-neutral-50 border border-border px-1.5 py-1 rounded-lg">
                            <Button
                                onClick={() =>
                                    handleUpdateItem(
                                        item.id,
                                        item.quantity - 1
                                    )
                                }
                                disabled={item.quantity <= 1}
                                className="w-7 h-7 flex items-center justify-center bg-white hover:bg-neutral-100 text-foreground border border-border rounded font-bold transition active:scale-90"
                            >
                                −
                            </Button>

                            <span className="w-8 text-center font-bold text-sm text-foreground">
                                {item.quantity}
                            </span>

                            <Button
                                onClick={() =>
                                    handleUpdateItem(
                                        item.id,
                                        item.quantity + 1
                                    )
                                }
                                className="w-7 h-7 flex items-center justify-center bg-white hover:bg-neutral-100 text-foreground border border-border rounded font-bold transition active:scale-90"
                            >
                                +
                            </Button>
                        </div>

                        {/* Delete */}
                        <Button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-white hover:bg-destructive/5 rounded-lg transition active:scale-90"
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </div>
                );
            })}

            <Dialog
                open={isOpen}
            >
                <DialogContent
                    showCloseButton={false}
                    className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden rounded-2xl p-0 shadow-modal sm:max-w-lg"
                >
                    <DialogHeader className="border-b border-border bg-[#FAF7F5] p-5 pr-14">
                        <div className="flex items-center gap-3">
                            <DialogTitle className="truncate text-base font-black">
                                Xóa tất cả sản phẩm trong giỏ hàng
                            </DialogTitle>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Đóng"
                                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 border-t border-border bg-[#FAF7F5] p-5">
                        <p className=''>Bạn có chắc muốn xóa toàn bộ sản phẩm</p>
                        <div className="flex items-center justify-around w-full space-x-2">
                            <Button onClick={() => setIsOpen(false)} className="w-[50%]">
                                Không
                            </Button>
                            <Button onClick={() => clearCart()} className="w-[50%]">
                                Đồng ý
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
