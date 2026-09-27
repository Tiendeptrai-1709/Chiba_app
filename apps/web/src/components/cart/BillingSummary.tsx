
// import { useAuthStore } from '@/lib/stores/useAuthStore';
// import { useNotificationStore } from '@/lib/stores/useNotificationStore';
// import { Coins } from 'lucide-react';
import React from 'react'

interface BillingSummaryProps {
    orderType: string;
    address: string;
    usePoints: boolean;
    pointsToUse: number;
    saveAsDefault: boolean;
    setEarnedPoints: (points: number) => void;
    setShowSuccessModal: (show: boolean) => void;
}

export const BillingSummary =({
    // orderType,
    // address,
    // usePoints,
    // pointsToUse,
    // saveAsDefault,
    // setEarnedPoints,
    // setShowSuccessModal,
}: BillingSummaryProps)=> {
    // const { items, totalPrice, totalItems, clearCart } = useCart();
    // const { user, updateProfileAddress, updateUserPoints } = useAuthStore()
    // const { showError } = useNotificationStore()

    // const [loading, setLoading] = useState(false)

    // const discountAmount = usePoints ? pointsToUse * 500 : 0;
    // const shippingFee = orderType === 'DELIVERY' ? (totalPrice >= 100000 ? 0 : 20000) : 0;
    // const finalPrice = totalPrice - discountAmount + shippingFee;

    // const handleCheckout = async () => {
    //     if (items.length === 0) {
    //         showError('Giỏ hàng trống');
    //         return;
    //     }

    //     if (orderType === 'DELIVERY' && !address.trim()) {
    //         showError('Vui lòng cung cấp địa chỉ nhận hàng để shop tiến hành giao hàng 📍');
    //         return;
    //     }

    //     setLoading(true);
    //     showError('');

    //     try {
    //         if (!user) {
    //             showError('Bạn cần đăng nhập để thực hiện đặt hàng');
    //             setLoading(false);
    //             return;
    //         }

    //         // Simulate API call delay
    //         await new Promise((resolve) => setTimeout(resolve, 1500));

    //         // 1. Save address to profile if checked
    //         if (saveAsDefault && orderType === 'DELIVERY') {
    //             await updateProfileAddress(address.trim());
    //         }

    //         // 2. Synchronize order with simulated database in localStorage
    //         const storedOrders = localStorage.getItem('zen_fb_orders');
    //         const orders = storedOrders ? JSON.parse(storedOrders) : [];

    //         // Calculate formatted items text for simple admin reading
    //         const formattedItemsText = items
    //             .map(item => {
    //                 const toppingsText = item.selectedToppings && item.selectedToppings.length > 0
    //                     ? ` (${item.selectedToppings.map(t => t.name).join(', ')})`
    //                     : '';
    //                 return `${item.quantity}x ${item.name}${toppingsText}`;
    //             })
    //             .join(', ');

    //         const orderId = `DH00` + (orders.length + 4);
    //         const discount = usePoints ? pointsToUse * 500 : 0;
    //         const shipFee = orderType === 'DELIVERY' ? (totalPrice >= 100000 ? 0 : 20000) : 0;
    //         const finalTotal = totalPrice - discount + shipFee;

    //         const newOrder = {
    //             id: orderId,
    //             userId: user.id,
    //             customerName: user.fullName,
    //             address: orderType === 'DELIVERY' ? address.trim() : 'Đến nhận tại cửa hàng 🏠',
    //             items: formattedItemsText,
    //             total: finalTotal,
    //             orderType: orderType,
    //             shippingFee: shipFee,
    //             pointsUsed: usePoints ? pointsToUse : 0,
    //             discountAmount: discount,
    //             status: 'PENDING' as const,
    //             createdAt: new Date().toISOString()
    //         };

    //         orders.unshift(newOrder); // Prepend so newest is at the top
    //         localStorage.setItem('zen_fb_orders', JSON.stringify(orders));

    //         // 3. Deduct points first via Context
    //         if (usePoints && pointsToUse > 0) {
    //             await updateUserPoints(
    //                 user.id,
    //                 -pointsToUse,
    //                 'REDEEMED_APP',
    //                 `Áp dụng điểm giảm giá cho đơn hàng ${orderId} (-${discount.toLocaleString('vi-VN')}đ)`
    //             );
    //         }

    //         // 4. Calculate earned points from final product amount (excluding shipping fee): 10,000đ spent = 1 point
    //         const pointsAdded = Math.floor((totalPrice - discount) / 10000);
    //         setEarnedPoints(pointsAdded);

    //         if (pointsAdded > 0) {
    //             await updateUserPoints(
    //                 user.id,
    //                 pointsAdded,
    //                 'EARNED_ORDER',
    //                 `Tích điểm từ đơn hàng ${orderId} (+${pointsAdded} điểm)`
    //             );
    //         }

    //         clearCart();
    //         setShowSuccessModal(true);
    //     } catch (err: any) {
    //         showError(err?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="space-y-2 border-b border-border pb-4">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Tổng số món:</span>
                    {/* <span>{totalItems} cốc/phần</span> */}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Phí giao hàng:</span>
                    {/* {shippingFee === 0 ? (
                        <span className="text-primary font-bold">
                            {orderType === 'DELIVERY' ? 'Miễn phí (Đơn > 100k) 🎁' : 'Miễn phí (Nhận tại quán) 🎁'}
                        </span>
                    ) : (
                        <span className="text-foreground font-bold">{shippingFee.toLocaleString('vi-VN')}₫</span>
                    )} */}
                </div>
                {/* {usePoints && discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-accent-foreground font-semibold bg-orange-50 border border-orange-100 p-2.5 rounded-xl">
                        <span className="flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-accent" /> Giảm giá bằng điểm ({pointsToUse} điểm):
                        </span>
                        <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                )} */}
            </div>

            <div className="flex items-center justify-between text-base font-bold text-foreground pt-1">
                <span>Tổng tiền thanh toán:</span>
                <span className="text-primary text-2xl tracking-tight">
                    {/* {finalPrice.toLocaleString('vi-VN')}₫ */}
                </span>
            </div>

            {/* Checkout Buttons */}
            {/* <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-premium transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
            >
                {loading ? 'Đang xử lý đặt hàng...' : '✓ Đặt Hàng Ngay'}
            </button> */}

            <button
                // onClick={() => router.push('/')}
                className="w-full bg-neutral-50 hover:bg-neutral-100 border border-border text-foreground font-semibold py-3 rounded-xl transition active:scale-98 text-sm"
            >
                Quay lại mua thêm nước
            </button>
        </div>
    )
}