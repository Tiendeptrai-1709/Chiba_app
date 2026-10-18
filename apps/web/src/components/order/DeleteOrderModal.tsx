
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { X } from 'lucide-react';

interface DeleteOrderModalProps {
    isOpenDeleteModal: boolean;
    setIsOpenDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    handleCancelOrder: () => void;
    isCancelling: boolean;
}
const DeleteOrderModal = ({ isOpenDeleteModal, setIsOpenDeleteModal, handleCancelOrder, isCancelling }: DeleteOrderModalProps) => {

    return (
        <Dialog
            open={isOpenDeleteModal}
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
                            onClick={() => setIsOpenDeleteModal(false)}
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
                        <Button onClick={() => setIsOpenDeleteModal(false)} className="h-[35px] w-[50%] hover:bg-primary-hover">
                            Không
                        </Button>
                        <Button disabled={isCancelling} onClick={handleCancelOrder} className="h-[35px] w-[50%] bg-destructive ">
                            {isCancelling ? "Đang hủy..." : "Hủy đơn hàng"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteOrderModal
