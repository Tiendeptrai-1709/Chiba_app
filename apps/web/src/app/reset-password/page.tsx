"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import {Notification} from "@/components/ui/Notication";
import { useNotificationStore } from "@chiba/api-client/src/stores/useNotificationStore";
import { useResetPassword } from "@chiba/api-client/src/hooks/useAuth";
import { api } from "@/lib/axios";


const ResetPasswordPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const { mutate, isPending, isSuccess } = useResetPassword(api);
    const { showError } = useNotificationStore();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        showError("");
        if (password !== confirmPassword) {
            showError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (password.length < 6) {
            showError("Mật khẩu tối thiểu 6 ký tự");
            return;
        }

        mutate({ token: token!, newPassword: password },{
            onSuccess() {
                router.replace("/login");
            }
        });
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-orange-50 to-orange-100/60 px-6 py-12">
            <div className="mx-auto w-full max-w-sm space-y-8">
                {/* Navigation */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="bg-card rounded-full border border-border p-2.5 shadow-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <span className="text-sm font-semibold text-muted-foreground">
                        Đăng nhập
                    </span>
                </div>

                {/* Header */}
                <div className="text-center">
                    <div className="mb-3 text-5xl">☕</div>
                    <h1 className="text-3xl font-extrabold text-primary">
                        Đặt lại mật khẩu
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Tạo mật khẩu mới cho tài khoản
                    </p>
                </div>

                {/* Card Form */}
                <div className="bg-card shadow-premium rounded-2xl border border-border p-6">
                    {isSuccess ? (
                        <div className="space-y-4 text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                            <p className="font-semibold text-foreground">
                                Đổi mật khẩu thành công
                            </p>
                            <button
                                onClick={() => router.push("/login")}
                                className="primary-btn w-full"
                            >
                                Đăng nhập
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* New Password */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-neutral-50/50 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Nhập mật khẩu mới"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full rounded-xl border border-border bg-neutral-50/50 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                    />
                                </div>
                            </div>

                            <Notification />

                            <button
                                disabled={isPending}
                                className="primary-btn w-full"
                            >
                                {isPending ? "Đang cập nhật..." : "Đổi mật khẩu"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
export default ResetPasswordPage;
