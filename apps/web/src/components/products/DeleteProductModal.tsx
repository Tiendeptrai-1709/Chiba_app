import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'

interface DeleteProductModalProps {
    isOpenDeleteModal: boolean;
    setIsOpenDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    productName: string;
    productPrice: number;
    onConfirm: () => void;
}

const DeleteProductModal = ({ isOpenDeleteModal, setIsOpenDeleteModal, productName, productPrice, onConfirm }: DeleteProductModalProps) => {
    return (
        <Dialog open={isOpenDeleteModal} onOpenChange={setIsOpenDeleteModal}>
            <DialogContent className="w-[92%] max-w-md rounded-2xl p-0 overflow-hidden border border-border bg-background shadow-xl">
                {/* ================= HEADER ================= */}
                <DialogHeader className="p-4 border-b border-border bg-[#FAF7F5]">
                    <div className="flex gap-4">
                        {/* Product icon */}
                        <p className="text-2xl">☕</p>

                        <div className="flex-row">
                            <DialogTitle className="text-base font-black">
                                {productName}
                            </DialogTitle>

                            <p className="text-xs text-primary font-extrabold mt-0.5">
                                Đơn giá: {productPrice.toLocaleString("vi-VN")} đ
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                <div className="m-5">
                    <div className="p-5">
                        <p className="text-sm font-bold text-foreground">
                            Bạn có chắc chắn muốn xóa sản phẩm này không?
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
                        </p>
                    </div>
                    <Button onClick={onConfirm} className="primary-btn">
                        <p className="text-sm font-bold text-white">
                            Xóa sản phẩm
                        </p>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteProductModal
