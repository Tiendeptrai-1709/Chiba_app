'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, Coins, Gift, Keyboard, RotateCcw, Search } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { PointTransaction, User } from '@/types';

const CODE_PATTERN = /^Z\d{8}$/;
const VND_PER_EARNED_POINT = 10_000; // khớp backend

// Camera + giải mã QR bằng jsQR (chạy được cả iPhone lẫn Android).
// Lưu ý: trình duyệt chỉ cho mở camera trên HTTPS hoặc localhost.
function useQrCamera(onCode: (code: string) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        window.isSecureContext
          ? 'Trình duyệt này không hỗ trợ camera. Hãy nhập mã thủ công.'
          : 'Camera chỉ hoạt động khi mở trang bằng HTTPS. Hãy dùng link https hoặc nhập mã thủ công.',
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setActive(true);

      const tick = () => {
        const canvas = canvasRef.current;
        if (!canvas || !streamRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          // Thu nhỏ khung hình để giải mã nhanh trên điện thoại.
          const scale = Math.min(1, 480 / video.videoWidth);
          canvas.width = Math.floor(video.videoWidth * scale);
          canvas.height = Math.floor(video.videoHeight * scale);
          const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
          const text = result?.data.trim().toUpperCase();
          if (text && CODE_PATTERN.test(text)) {
            navigator.vibrate?.(80);
            stop();
            onCode(text);
            return;
          }
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      stop();
      setError(
        e?.name === 'NotAllowedError'
          ? 'Bạn đã từ chối quyền camera. Hãy cho phép camera trong cài đặt trình duyệt rồi thử lại.'
          : 'Không mở được camera. Hãy nhập mã thủ công.',
      );
    }
  }, [onCode, stop]);

  useEffect(() => stop, [stop]);

  return { videoRef, canvasRef, active, error, start, stop };
}

export default function QrScanPanel() {
  const { showError, showSuccess } = useNotificationStore();
  const [manualCode, setManualCode] = useState('');
  const [customer, setCustomer] = useState<User | null>(null);
  const [looking, setLooking] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemReason, setRedeemReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastTx, setLastTx] = useState<PointTransaction | null>(null);

  const lookup = useCallback(
    async (code: string) => {
      const normalized = code.trim().toUpperCase();
      if (!CODE_PATTERN.test(normalized)) return showError('Mã khách hàng có dạng Z + 8 chữ số, ví dụ Z12345678');
      setLooking(true);
      setLastTx(null);
      try {
        setCustomer(await apiRequest<User>(`/users/by-code/${encodeURIComponent(normalized)}`));
        setManualCode(normalized);
      } catch (e: any) {
        setCustomer(null);
        showError(e?.message ?? 'Không tìm thấy khách hàng');
      } finally {
        setLooking(false);
      }
    },
    [showError],
  );

  const camera = useQrCamera(lookup);

  const reset = () => {
    setCustomer(null);
    setManualCode('');
    setBillAmount('');
    setRedeemPoints('');
    setRedeemReason('');
    setLastTx(null);
  };

  const bill = parseInt(billAmount.replace(/\D/g, ''), 10) || 0;
  const previewPoints = Math.floor(bill / VND_PER_EARNED_POINT);

  const earn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    if (bill < VND_PER_EARNED_POINT) return showError('Hóa đơn tối thiểu 10.000đ mới được tích điểm');
    if (!window.confirm(`Cộng ${previewPoints} điểm cho ${customer.fullName} (hóa đơn ${bill.toLocaleString('vi-VN')}đ)?`)) return;
    setSubmitting(true);
    try {
      const tx = await apiRequest<PointTransaction>('/points/store-earn', {
        method: 'POST',
        body: { customerCode: customer.customerCode, billAmount: bill },
      });
      setLastTx(tx);
      setCustomer({ ...customer, zenPoints: tx.pointsAfter });
      setBillAmount('');
      showSuccess(`Đã cộng ${tx.points} điểm cho ${customer.fullName}`);
    } catch (e: any) {
      showError(e?.message ?? 'Không tích được điểm');
    } finally {
      setSubmitting(false);
    }
  };

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    const pts = parseInt(redeemPoints, 10) || 0;
    if (pts <= 0) return showError('Nhập số điểm cần trừ');
    if (pts > customer.zenPoints) return showError('Khách không đủ điểm');
    if (!redeemReason.trim()) return showError('Nhập tên quà / lý do đổi điểm');
    if (!window.confirm(`Trừ ${pts} điểm của ${customer.fullName} để đổi "${redeemReason.trim()}"?`)) return;
    setSubmitting(true);
    try {
      const tx = await apiRequest<PointTransaction>('/points/adjust', {
        method: 'POST',
        body: { userId: customer.id, points: -pts, type: 'REDEEMED_STORE', description: `Đổi quà: ${redeemReason.trim()}` },
      });
      setLastTx(tx);
      setCustomer({ ...customer, zenPoints: tx.pointsAfter });
      setRedeemPoints('');
      setRedeemReason('');
      showSuccess(`Đã trừ ${pts} điểm của ${customer.fullName}`);
    } catch (e: any) {
      showError(e?.message ?? 'Không đổi được điểm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {!customer ? (
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">📷 Quét QR tích điểm</h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              Khách mở mục “QR tích điểm” trong app, nhân viên quét mã để tích điểm hoặc đổi quà.
            </p>
          </div>

          <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden bg-neutral-900">
            <video ref={camera.videoRef} playsInline muted className={`w-full h-full object-cover ${camera.active ? '' : 'hidden'}`} />
            <canvas ref={camera.canvasRef} className="hidden" />
            {camera.active ? (
              <div className="absolute inset-[18%] border-4 border-white/80 rounded-2xl pointer-events-none" aria-hidden />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80 p-6 text-center">
                <Camera className="w-10 h-10" />
                <p className="text-xs">{camera.error ?? 'Bấm “Mở camera” để quét mã QR của khách'}</p>
              </div>
            )}
          </div>

          <button
            onClick={camera.active ? camera.stop : camera.start}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition active:scale-[0.98] ${
              camera.active ? 'bg-neutral-200 text-foreground' : 'bg-primary text-white'
            }`}
          >
            {camera.active ? (
              <>
                <CameraOff className="w-4 h-4" /> Tắt camera
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" /> Mở camera
              </>
            )}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              lookup(manualCode);
            }}
            className="space-y-2"
          >
            <label htmlFor="manual-code" className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" /> Hoặc nhập mã khách hàng
            </label>
            <div className="flex gap-2">
              <input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Z12345678"
                maxLength={9}
                autoCapitalize="characters"
                className="flex-1 border border-border p-3 rounded-xl text-sm font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={looking}
                className="px-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <Search className="w-4 h-4" /> {looking ? '...' : 'Tìm'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Thông tin khách */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-lg">
              {customer.fullName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate">{customer.fullName}</p>
              <p className="text-[11px] text-muted-foreground">
                {customer.customerCode}
                {customer.phone ? ` · ${customer.phone}` : ''}
              </p>
              <p className="text-sm font-black text-accent-strong mt-0.5 flex items-center gap-1">
                <Coins className="w-4 h-4 text-accent" /> {customer.zenPoints} điểm
              </p>
            </div>
            <button
              onClick={reset}
              className="text-xs font-bold text-primary border border-border px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-muted"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Khách khác
            </button>
          </div>

          {lastTx && (
            <p className="text-xs font-semibold bg-green-50 border border-green-200 text-green-800 rounded-xl p-3">
              ✓ {lastTx.description}: {lastTx.points > 0 ? '+' : ''}
              {lastTx.points} điểm (còn {lastTx.pointsAfter})
            </p>
          )}

          {/* Tích điểm theo hóa đơn */}
          <form onSubmit={earn} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Coins className="w-4 h-4" /> Tích điểm hóa đơn tại quầy
            </h4>
            <label htmlFor="bill" className="text-[11px] text-muted-foreground">
              Số tiền khách thanh toán (10.000đ = 1 điểm)
            </label>
            <input
              id="bill"
              inputMode="numeric"
              value={bill ? bill.toLocaleString('vi-VN') : ''}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="Ví dụ: 125.000"
              className="w-full border border-border p-3 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={submitting || previewPoints <= 0}
              className="primary-btn rounded-xl"
            >
              {previewPoints > 0 ? `Cộng ${previewPoints} điểm` : 'Nhập số tiền hóa đơn'}
            </button>
          </form>

          {/* Đổi quà */}
          <form onSubmit={redeem} className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-black text-accent-strong uppercase tracking-widest flex items-center gap-1.5">
              <Gift className="w-4 h-4" /> Đổi quà / trừ điểm
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <input
                inputMode="numeric"
                value={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.value.replace(/\D/g, ''))}
                placeholder="Số điểm"
                aria-label="Số điểm cần trừ"
                className="col-span-1 border border-border p-3 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                value={redeemReason}
                onChange={(e) => setRedeemReason(e.target.value)}
                placeholder="Tên quà, vd. Ly sứ Chiba"
                aria-label="Tên quà hoặc lý do"
                maxLength={150}
                className="col-span-2 border border-border p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm bg-accent text-white disabled:opacity-50 active:scale-[0.98] transition"
            >
              Xác nhận đổi quà
            </button>
          </form>
        </>
      )}
    </div>
  );
}
