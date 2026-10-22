'use client';

import React, { useState } from 'react';
import { User, useUpdateUserPoint } from '@chiba/api-client';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';
import { Button } from '../ui/button';
import { api } from '@/lib/axios';

interface PointActionModalProps {
  openPointModal: boolean;
  setOpenPointModal: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUser: User | null;
}

export const PointActionModal = ({
  openPointModal,
  setOpenPointModal,
  selectedUser,
}: PointActionModalProps) => {
  const { mutate: updateProfile } = useUpdateUserPoint(api)

  const [point, setPoint] = useState("")

  const handleSavePoint = () => {
    if (!selectedUser || point.trim() === "") {
      return;
    }

    const zenPoints = Number(point);

    if (!Number.isInteger(zenPoints) || zenPoints < 0) {
      return;
    }

    updateProfile({
      id: selectedUser.id,
      zenPoints,
    });
  };

  return (
    <Dialog open={openPointModal} onOpenChange={setOpenPointModal}>
      <DialogContent className="w-[92%] max-w-md rounded-2xl p-0 overflow-hidden border border-border bg-background shadow-xl">
        {/* ================= HEADER ================= */}
        <DialogHeader className="p-4 border-b border-border bg-[#FAF7F5] text-base font-black">
          ✏️ Điều chỉnh điểm người dùng
        </DialogHeader>
        <div className="flex flex-col space-y-5 m-5">
          {selectedUser ? (
            <>
              <div className="flex items-center space-x-2">
                <p>Số điểm hiện tại của
                  <span className='font-bold'> {selectedUser.fullName} là </span>
                </p>
                <p className='font-bold'>{selectedUser.zenPoints}</p>
              </div>

              <input
                type="number"
                value={point}
                onChange={(e) => setPoint(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm transition-all"
                placeholder="Thay đổi thành"
              />

              <Button onClick={handleSavePoint} className="primary-btn">
                <p className="text-sm font-bold text-white">
                  Lưu thay đổi
                </p>
              </Button>
            </>
          ) : (
            <p className="p-5">Đang tải thông tin người dùng...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}