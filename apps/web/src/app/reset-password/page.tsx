'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Lock } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';
import PageLoader from '@/components/ui/PageLoader';

function ResetPasswordForm() {
  const token = useSearchParams().get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validToken = /^[a-f0-9]{64}$/.test(token);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      const res = await apiRequest<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: { token, newPassword: password },
        auth: false,
      });
      setDone(res.message);
    } catch (err: any) {
      setError(err?.message ?? 'Không đặt lại được mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100/60 px-6 py-10">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Đặt mật khẩu mới</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Sau khi đổi, bạn sẽ được đăng xuất khỏi mọi thiết bị.</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-premium">
          {done ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
              <p className="text-sm text-foreground">{done}</p>
              <Link href="/" className="primary-btn mt-2">
                Đăng nhập
              </Link>
            </div>
          ) : !validToken ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-foreground">Liên kết không hợp lệ hoặc đã bị cắt mất một phần.</p>
              <Link href="/forgot-password" className="primary-btn">
                Gửi lại liên kết
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {[
                { id: 'new-password', label: 'Mật khẩu mới', value: password, set: setPassword, placeholder: 'Ít nhất 6 ký tự' },
                { id: 'confirm-password', label: 'Nhập lại mật khẩu', value: confirm, set: setConfirm, placeholder: 'Gõ lại mật khẩu phía trên' },
              ].map((f) => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {f.label}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                      id={f.id}
                      type="password"
                      autoComplete="new-password"
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      placeholder={f.placeholder}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>
              ))}
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg border border-destructive/20">⚠️ {error}</div>
              )}
              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// useSearchParams cần nằm trong Suspense khi Next.js dựng trang tĩnh
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
