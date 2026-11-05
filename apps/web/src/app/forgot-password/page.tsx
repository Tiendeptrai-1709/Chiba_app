'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { apiRequest } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiRequest<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
        auth: false,
      });
      setSent(res.message);
    } catch (err: any) {
      setError(err?.message ?? 'Không gửi được yêu cầu, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen bg-gradient-to-br from-orange-50 to-orange-100/60 px-6 py-10">
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Quay lại đăng nhập" className="p-2.5 bg-card border border-border rounded-full active:scale-95 shadow-sm transition">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-sm font-semibold text-muted-foreground">Quay lại đăng nhập</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Quên mật khẩu</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
        </div>

        <div className="bg-card p-6 rounded-2xl border border-border shadow-premium">
          {sent ? (
            <div className="text-center space-y-3">
              <MailCheck className="w-12 h-12 mx-auto text-primary" />
              <p className="text-sm text-foreground leading-relaxed">{sent}</p>
              <p className="text-xs text-muted-foreground">Liên kết có hiệu lực trong 15 phút. Nhớ kiểm tra cả mục Thư rác.</p>
              <Link href="/" className="primary-btn mt-2">
                Về trang đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg border border-destructive/20">⚠️ {error}</div>
              )}
              <button type="submit" disabled={loading} className="primary-btn">
                {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
