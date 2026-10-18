// app/order/[id]/page.tsx

"use client";

import DeleteOrderModal from "@/components/order/DeleteOrderModal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";
import { useCancelOrder, useGetOrderById, useNotificationStore } from "@chiba/api-client";
import { OrderItem, OrderItemTopping } from "@chiba/api-client/src/types";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const formatVND = (value: number | null | undefined) =>
    `${(value ?? 0).toLocaleString("vi-VN")}đ`;

const formatDate = (value: string) =>
    new Date(value).toLocaleString("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
    });

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const orderId = params.id;
    const { data: order } = useGetOrderById(api, orderId);
    const { mutate: cancelOrder, isPending: isCancelling, } = useCancelOrder(api);
    const { showError, showSuccess } = useNotificationStore()

    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

    const handleCancelOrder = async () => {
        try {
            await cancelOrder(order.id);
            showSuccess("Hủy đơn thành công")
            router.push("/order");
        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Không thể cập nhật trạng thái đơn hàng.";
            showError(message)
        }
    };


    return (
        <main className="mx-8 max-w-5xl px-4 py-8">
            <div className="mb-8 border-b pb-6">
                <div className="flex items-center justify-between pb-6">
                    <div onClick={() => router.push("/order")} className="flex items-center cursor-pointer hover:bg-muted border p-2 rounded-full transition-all duration-200 disabled:opacity-50">
                        <ArrowLeft className="text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">Chi tiết đơn hàng</h1>
                    <div />
                </div>

                <p className="mt-2 text-md text-muted-foreground">
                    Mã đơn hàng: {order?.orderCode}
                </p>

                <p className="mt-1 text-md text-muted-foreground">
                    Đặt lúc: {formatDate(order?.createdAt)}
                </p>
            </div>

            {/* Hình thức nhận hàng */}
            <section className="mb-6 rounded-xl border border-primary bg-primary/5 p-4">
                <p className="font-semibold">
                    {order?.orderType === "DELIVERY"
                        ? "🛵 Giao hàng tận nơi"
                        : "🏪 Nhận tại cửa hàng"}
                </p>

                {order?.orderType === "DELIVERY" && order?.deliveryAddress && (
                    <p className="mt-2 text-sm">
                        Địa chỉ: {order?.deliveryAddress}
                    </p>
                )}

                {/* <p className="mt-2 text-sm">
                    Trạng thái: {statusLabels[order?.status] ?? order?.status}
                </p> */}
            </section>

            {/* Thông tin khách hàng */}
            <section className="mb-8 rounded-xl border p-4">
                <h2 className="mb-3 font-semibold">Thông tin khách hàng</h2>

                <p>Họ tên: {order?.customerName}</p>
                <p className="mt-1">Số điện thoại: {order?.customerPhone}</p>

                {order?.note && <p className="mt-2">Ghi chú: {order?.note}</p>}
            </section>

            {/* Danh sách sản phẩm */}
            <section>
                <h2 className="mb-4 text-lg font-semibold">
                    Sản phẩm ({order?.items.length})
                </h2>

                <div className="divide-y border-y">
                    {order?.items.map((item:OrderItem) => (
                        <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 py-5"
                        >
                            <div className="flex min-w-0 gap-4">
                                {item.productImage ? (
                                    // Dùng img để không cần cấu hình hostname cho next/image.
                                    <Image
                                        src={item.productImage}
                                        alt={item.productName}
                                        className="h-20 w-20 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted text-xs">
                                        No image
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p className="font-medium">{item.productName}</p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {formatVND(item.unitPrice)} × {item.quantity}
                                    </p>

                                    {item.toppings?.length > 0 && (
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            <p>Topping:</p>

                                            {item.toppings?.map((topping:OrderItemTopping) => (
                                                <p key={topping.id}>
                                                    {topping.toppingName ?? "Topping"}
                                                    {" · "}
                                                    {formatVND(topping.unitPrice)}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="shrink-0 font-semibold">
                                {formatVND(item.lineTotal)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tổng tiền */}
            <section className="mt-8 space-y-3">
                <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span>{formatVND(order?.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Điểm đã sử dụng</span>
                    <span>{order?.pointsUsed ?? 0} điểm</span>
                </div>

                <div className="flex justify-between">
                    <span>Giảm giá</span>
                    <span>-{formatVND(order?.discountAmount)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Phí giao hàng</span>
                    <span>{formatVND(order?.shippingFee)}</span>
                </div>

                <div className="flex justify-between border-t pt-4 text-lg font-bold">
                    <span>Tổng thanh toán</span>
                    <span>{formatVND(order?.totalAmount)}</span>
                </div>
            </section>

            {/* Nút hủy: hiện mới là giao diện */}
            <div className="mt-8 flex justify-center">
                {
                    order?.status === "PENDING" ? (
                        <Button onClick={() => setIsOpenDeleteModal(true)} className="secondary-btn mt-2">
                            <p className="text-destructive"> Hủy đơn hàng</p>
                        </Button>
                    ) : order?.status === "CANCELLED" ? (
                        <p className="text-muted-foreground font-semibold">Đơn đã bị hủy</p>
                    ) : (
                        <p className="text-muted-foreground font-semibold">Đơn đã xác nhận thì không thể hủy</p>
                    )
                }
            </div>
            <DeleteOrderModal isOpenDeleteModal={isOpenDeleteModal} setIsOpenDeleteModal={setIsOpenDeleteModal} handleCancelOrder={handleCancelOrder} isCancelling={isCancelling} />
        </main >
    );
}