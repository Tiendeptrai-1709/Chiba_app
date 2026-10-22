
import React from 'react'
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Order, User } from '@chiba/api-client';

interface StatCardProps {
    icon: string;
    title: string;
    value: string | number;
    colorBg: string;
    colorText: string;
}

interface SystemOverviewProps {
    allOrders:Order[];
    allCustomers: User[];
    onSetNotification: (type: 'success' | 'error', msg: string) => void;
    user: User;
}

const StatCard = ({ icon, title, value, colorBg, colorText }: StatCardProps) => {
    return (
        <div className={`${colorBg} rounded-xl p-4 border border-border/50`}>
            <span className="text-2xl">{icon}</span>
            <p className={`text-xs font-bold ${colorText}-500`}>{title}</p>
            <p className={`text-xl font-black ${colorText}-900 mt-0.5`}>{value}</p>
        </div>
    );
};
const SystemOverview = ({
    allOrders,
    allCustomers,
    user
}: SystemOverviewProps) => {
    const router = useRouter()

    const totalRevenue = (
        allOrders?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / 1000
    ).toFixed(1);
    return (
        <>
            {/* ========================================================
            TAB: SYSTEM OVERVIEW (ADMIN ONLY)
            ======================================================== */}
            <div className="space-y-6">
                {/* 1. Inspect Stats Panel */}
                <div>
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                        📈 Giám sát hệ thống (Kiểm tra dữ liệu)
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard icon="📋" title="Đơn hàng" value={allOrders?.length} colorBg="bg-gradient-to-br from-blue-50 to-blue-100/70 border border-blue-200" colorText="text-blue" />
                        <StatCard icon="💰" title="Doanh thu" value={`${totalRevenue}k`} colorBg="bg-gradient-to-br from-green-50 to-green-100/70 border border-green-200" colorText="text-green" />

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200 rounded-xl p-4 flex items-center justify-between mt-1">
                            <div>
                                <span className="text-2xl">📦</span>
                                <p className="text-xs text-purple-500 mt-1">Sản phẩm</p>
                                <p className="text-xl font-black text-purple-900 mt-0.5">19</p>
                            </div>

                            <div>
                                {user.role && (
                                    <Button
                                        onClick={() => router.push("/products")}
                                        className="bg-primary p-5 rounded-xl hover:bg-primary-hover"
                                    >
                                        <p className="text-white font-semibold">
                                            + Thêm sản phẩm
                                        </p>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <StatCard icon="👥" title="Khách hàng" value={allCustomers?.length} colorBg="bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200" colorText="text-orange" />
                    </div>
                </div>

                {/* 2. Invite Staff Panel via Email */}
                {/* <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <UserPlus className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wider">Mời Nhân Viên (Staff) mới</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Nhập địa chỉ email của cộng tác viên/nhân viên. Hệ thống sẽ cấp quyền <strong>STAFF</strong> khi tài khoản này tiến hành đăng ký.
                    </p>

                    <form onSubmit={handleInviteSubmit} className="flex gap-2">
                        <div className="relative flex-grow">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-xs font-semibold"
                                placeholder="staff-email@zenfb.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm active:scale-95 transition-all"
                        >
                            {submitting ? 'Đang gửi...' : 'Mời Staff'}
                        </button>
                    </form>
                </div> */}

            </div>
        </>
    )
}

export default SystemOverview