"use client"
import React, { useState } from 'react'
import Link from 'next/link';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import {Notification} from '@/components/ui/Notication';
import { useLogin } from '@/hooks/useAuth';
import { useNotificationStore } from '@/stores/useNotificationStore';
import Image from 'next/image';
<<<<<<< Updated upstream
=======
import { useLogin, useNotificationStore } from '@chiba/api-client';
import { api } from '@/lib/axios';

import { useRouter } from 'next/navigation';

>>>>>>> Stashed changes

const LoginPage = () => {
    const { mutate, isPending } = useLogin();
    const { showError } = useNotificationStore()

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        showError('');

        if (!email || !password) {
            showError('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        mutate({ email, password });
    };

    return (
        <div className="w-full max-w-sm mx-auto space-y-8 animate-fade-in">
            {/* Chiba Brand Identity */}
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <Image
                        src="/logo.png"
                        alt="Chiba Logo"
                        width={500}
                        height={500}
                        className="w-24 h-24 rounded-full border border-primary/10 shadow-premium object-cover bg-white p-1 animate-fade-in"
                    />
                </div>
                <h1 className="text-4xl font-extrabold text-primary tracking-tight">Chiba</h1>
                <p className="text-muted-foreground mt-2 text-sm font-medium tracking-wide">Tea • Coffee • Foods</p>
            </div>

            {/* Auth Form Card */}
            <div className="bg-card p-6 rounded-2xl border border-border shadow-premium space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Tài khoản Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                placeholder="Nhập 6 ký tự"
                                required
                            />
                        </div>
                    </div>

                    {/* Error Message */}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="primary-btn mt-6 flex items-center justify-center gap-2"
                    >
                        {isPending ? 'Đang xác thực...' : (
                            <>
                                Đăng Nhập <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                    <div className='flex justify-end'>
                        <Link href="/forgot-password" className="text-primary underline text-sm font-bold hover:text-muted-foreground transition-all">
                            Quên tài khoản
                        </Link>
                    </div>
                </form>

            </div>

            {/* Link to Register */}
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Chưa có tài khoản?{' '}
                    <Link href="/register" className="text-primary hover:underline font-bold transition-all">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;