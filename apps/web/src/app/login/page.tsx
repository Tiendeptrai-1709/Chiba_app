"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { Mail, Lock, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import Validation from '@/components/Validation';
import { useLogin } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useUser';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/useAuthStore';

function LoginPage() {
    const { mutate, isPending } = useLogin();
    const { data: user } = useProfile()
    const { showError } = useNotificationStore()
    const { accessToken, isChecking } = useAuthStore();

    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // const pathname = usePathname();
    // useEffect(() => {
    //     if (!accessToken && pathname !== "/login") {
    //         router.replace("/login")
    //     }
    // }, [accessToken, pathname])

    useEffect(() => {
        if (user && !isChecking) {
            if (user?.role === 'ADMIN' || user?.role === 'STAFF') {
                router.push('/admin/dashboard');
            } else {
                router.push('/');
            }
        }
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        showError('');

        if (!email || !password) {
            showError('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        mutate({ email, password });
    };

    // Helper function to auto-fill credentials for testing
    const handleQuickLogin = (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
        if (role === 'CUSTOMER') {
            setEmail('abc@gmail.com');
            setPassword('1');
        } else if (role === 'STAFF') {
            setEmail('staff@chiba.com');
            setPassword('1');
        } else {
            setEmail('admin@chiba.com');
            setPassword('1');
        }
    };
    return (
        <div className="w-full max-w-sm mx-auto space-y-8 animate-fade-in">
            {/* Chiba Brand Identity */}
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <img
                        src="/logo.png"
                        alt="Chiba Logo"
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
                    <Validation />

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
                </form>

                {/* Quick Access Account Options for Testing */}
                <div className="pt-4 border-t border-border">
                    <p className="text-[10px] text-center text-muted-foreground/80 font-medium mb-3 uppercase tracking-wider">
                        Bấm nhanh để test vai trò:
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('CUSTOMER')}
                            className="flex items-center justify-center gap-1 py-2 px-1 text-[10px] bg-accent/10 text-accent font-semibold rounded-lg hover:bg-accent hover:text-white border border-accent/20 active:scale-95 transition-all duration-200"
                        >
                            <UserCheck className="w-3.5 h-3.5" /> Khách Hàng
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('STAFF')}
                            className="flex items-center justify-center gap-1 py-2 px-1 text-[10px] bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white border border-blue-200 active:scale-95 transition-all duration-200"
                        >
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Nhân Viên
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickLogin('ADMIN')}
                            className="flex items-center justify-center gap-1 py-2 px-1 text-[10px] bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary hover:text-white border border-primary/20 active:scale-95 transition-all duration-200"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" /> Quản Trị
                        </button>
                    </div>
                </div>
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

export default LoginPage