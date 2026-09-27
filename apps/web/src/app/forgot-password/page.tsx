"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useForgotPassword } from "@/hooks/useAuth";
import { useNotificationStore } from "@/stores/useNotificationStore";
import {Notification} from "@/components/ui/Notication";

const ForgotPasswordPage = ()=> {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess } = useForgotPassword();
  const { showError } = useNotificationStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    showError("");
    if (!email) {
      showError("Vui lòng nhập email");
      return;
    }

    mutate(email);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-orange-50 to-orange-100/60 px-6 py-12">
      <div className="mx-auto w-full max-w-sm space-y-8">
        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="bg-card rounded-full border border-border p-2.5 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-semibold text-muted-foreground">
            Quay lại đăng nhập
          </span>
        </div>

        {/* Logo / Title */}
        <div className="text-center">
          <div className="mb-3 text-5xl">☕</div>
          <h1 className="text-3xl font-extrabold text-primary">
            Quên mật khẩu
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhập email để nhận link đặt lại mật khẩu
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card shadow-premium rounded-2xl border border-border p-6">
          {isSuccess ? (
            <div className="space-y-4 text-center">
              <div className="font-semibold text-green-600">
                Email đã được gửi
              </div>
              <p className="text-sm text-muted-foreground">
                Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link reset mật khẩu.
              </p>
              <Link href="/login" className="primary-btn block">
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-border bg-neutral-50/50 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <button
                disabled={isPending}
                className="primary-btn flex w-full items-center justify-center gap-2"
              >
                {isPending ? (
                  "Đang gửi..."
                ) : (
                  <>
                    Gửi link đặt lại
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
