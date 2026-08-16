'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, BadgeCheck, Star, Trash2, ShieldCheck, Pen } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@chiba/api-client';
import { api } from '@/lib/axios';
import { useLogout } from '@chiba/api-client/src/hooks/useAuth';

const ProfilePage = () => {
  const { data: user, isLoading } = useProfile(api)
  const { mutate, isPending } = useLogout(api)
  const { mutate: updateProfile } = useUpdateProfile(api)
  const router = useRouter();

  const [inputName, setInputName] = useState(user?.fullName || '');
  const [inputPhone, setInputPhone] = useState(user?.phone || '');

  const [showInputName, setShowInputName] = useState(false);
  const [showInputPhone, setShowInputPhone] = useState(false);

  const [history] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // useEffect(() => {
  //   if (user && getPointHistory) {
  //     setHistory(getPointHistory(user?.id));
  //   }
  // }, [user, getPointHistory]);

  // useEffect(() => {
  //   if (!isLoading || !user) {
  //     router.push('/login');
  //   }
  // }, [ isLoading, router]);

  // // Show the welcome modal automatically if name is "Noname" (similar to image pop-up)
  useEffect(() => {
    if (!user) return;

    setInputName(user?.fullName ?? '');
    setInputPhone(user?.phone ?? '');
  }, [user]);



  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleLogout = () => {
    mutate(undefined,{
      onSuccess() {
        router.replace("/login");
      }
    })
  };

  // const handleSaveName = async () => {
  //   if (!inputName.trim()) return;
  //   setUpdating(true);
  //   try {
  //     await updateProfileName(inputName.trim());
  //     setShowModal(false);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  const triggerUpdateModal = () => {
    setShowInputName(false);
    setShowInputPhone(false);

    updateProfile({ fullName: inputName, phone: inputPhone });
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {/* Stick Header standard layout */}
      <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-neutral-100 border border-border text-foreground rounded-full active:scale-95 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Thông tin cá nhân</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6 animate-fade-in">
        {/* User Large Avatar matching image placeholder */}
        <div className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl shadow-sm text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 text-7xl translate-x-4 -translate-y-4 opacity-5 select-none">👤</div>
          <div className="w-24 h-24 bg-neutral-200 border-4 border-white shadow-premium rounded-full flex items-center justify-center text-5xl text-neutral-500 overflow-hidden mb-4">
            👤
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">{user?.fullName}</h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{user?.email}</p>
          {user?.role === 'ADMIN' && (
            <div className="mt-3 inline-flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              <ShieldCheck className="w-3 h-3" /> Quản trị viên
            </div>
          )}
        </div>

        {/* User Info Form Grid from screenshot */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm divide-y divide-border">
          {/* Full Name field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-200/50 group transition">
            <div className="w-[50%] space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Họ và tên</p>
              {showInputName ? (
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-200 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white mt-3 font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/45"
                />
              ) : (
                <p className="font-bold text-foreground text-sm">{user?.fullName}</p>
              )}
            </div>
            <div className="flex items-center gap-5">
              <Pen onClick={() => setShowInputName(true)} className="w-5 h-5 opacity-0 group-hover:opacity-100 hover:cursor-pointer text-muted-foreground/40" />
              <User className="w-5 h-5 text-muted-foreground/40" />
            </div>
          </div>

          {/* Phone field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-200/50 group transition">
            <div className="w-[50%] space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Số điện thoại</p>
              {showInputPhone ? (
                <input
                  type="text"
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-200 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white mt-3 font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/45"
                />
              ) : (
                <p className="font-bold text-foreground text-sm">{user?.phone || 'Chưa cập nhật'}</p>
              )}
            </div>
            <div className="flex items-center gap-5">
              <Pen onClick={() => setShowInputPhone(true)} className="w-5 h-5 opacity-0 group-hover:opacity-100 hover:cursor-pointer text-muted-foreground/40" />
              <Phone className="w-5 h-5 text-muted-foreground/40" />
            </div>
          </div>

          {/* Customer code field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-200/50 transition">
            <div className="w-[50%] space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Mã khách hàng</p>
              <p className="font-bold text-primary text-sm tracking-widest">{user?.customerCode}</p>
            </div>
            <BadgeCheck className="w-5 h-5 text-primary/50" />
          </div>

          {/* Zen points field */}
          <div className="p-5 flex items-center justify-between hover:bg-neutral-200/50 transition">
            <div className="w-[50%] space-y-1">
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">Điểm Chiba</p>
              <p className="font-bold text-accent text-sm">{user?.zenPoints} điểm</p>
            </div>
            <Star className="w-5 h-5 text-accent/50" />
          </div>
        </div>

        {/* Lịch sử điểm tích lũy */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm p-5 space-y-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between font-bold text-sm text-foreground focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent stroke-[2.2]" />
              <span>Lịch sử điểm Chiba</span>
            </span>
            <span className="text-xs text-primary font-bold hover:underline">
              {showHistory ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
            </span>
          </button>

          {showHistory && (
            <div className="pt-3 border-t border-dashed border-border/60 space-y-3 max-h-60 overflow-y-auto pr-1 animate-fade-in">
              {history.length > 0 ? (
                history.map((tx) => {
                  const isPositive = tx.points >= 0;
                  return (
                    <div key={tx.id} className="flex justify-between items-start py-2.5 border-b border-border/40 last:border-b-0 gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{tx.description}</p>
                        <p className="text-[9px] text-muted-foreground">
                          Số dư: {tx.pointsBefore || 0} ➔ {tx.pointsAfter || 0} | {new Date(tx.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span className={`text-xs font-black shrink-0 px-2 py-0.5 rounded ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-destructive'
                        }`}>
                        {isPositive ? '+' : ''}{tx.points}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Bạn chưa thực hiện giao dịch tích điểm nào.</p>
              )}
            </div>
          )}
        </div>

        {/* Admin Section if Admin role */}
        {(user?.role === "ADMIN" || user?.role === "STAFF") && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-border pb-2">
              ⚙️ Tính năng Quản trị
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {user?.role === "ADMIN" ? (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
                  >
                    📊 Bảng điều khiển Admin
                  </Link>
                  <Link
                    href="/stores"
                    className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
                  >
                    📍 Danh sách Cửa Hàng
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="p-3 bg-neutral-50 hover:bg-primary hover:text-white border border-border rounded-xl text-center font-bold text-xs transition-all active:scale-98"
                  >
                    📊 Bảng điều khiển Staff
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="space-y-4 pt-4">
          {/* Delete Account link standard red text */}
          <div className="text-center">
            <Link
              href="/profile/delete-account"
              className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive-hover font-bold hover:underline transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa tài khoản
            </Link>
          </div>

          {/* Large Black Charcoal Button matches screenshot */}
          <button
            onClick={triggerUpdateModal}
            disabled={!showInputName && !showInputPhone}
            className="w-full bg-[#1A1A1A] hover:bg-black text-white font-bold py-4 rounded-xl shadow-premium transition active:scale-[0.99] text-sm uppercase tracking-wider disabled:bg-neutral-300 disabled:text-muted-foreground/70 "
          >
            Cập nhật thông tin
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-neutral-100 hover:bg-neutral-200 border border-border text-foreground font-semibold py-3 rounded-xl transition active:scale-[0.99] text-sm"
          >
            {isPending ? "Loading..." : "🚪 Đăng xuất tài khoản"}
          </button>
        </div>
      </div>

    </div>
  );
}

export default ProfilePage;