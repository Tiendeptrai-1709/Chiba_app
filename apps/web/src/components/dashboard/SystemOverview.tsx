
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useNotificationStore } from '@/lib/stores/useNotificationStore';
import { User } from '@/types';
import { Mail, Trash2, UserPlus, Users } from 'lucide-react'
import React, { useState } from 'react'

interface SystemOverviewProps {
    mockOrders: any[];
    allCustomers: User[];
    onSetNotification: (type: 'success' | 'error', msg: string) => void;
}

function SystemOverview({
    mockOrders,
    allCustomers,
    onSetNotification
}: SystemOverviewProps) {
    // const {
    //     invitedStaffEmails,
    //     activeStaffList,
    //     inviteStaff,
    //     revokeInvitation
    // } = useAuthStore();
    const { showError, showSuccess} = useNotificationStore()

    const [emailInput, setEmailInput] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = emailInput.trim();
        if (!email) return;

        setSubmitting(true);
        showSuccess(''); // Clear thông báo cũ

        try {
            // await inviteStaff(email);
            showSuccess(`Đã gửi lời mời làm Staff tới email ${email}!`);
            setEmailInput(''); // Reset input thành công
        } catch (err: any) {
            showError(err?.message || 'Có lỗi xảy ra khi gửi lời mời.');
        } finally {
            setSubmitting(false);
        }
    };

    // 4. Đưa hàm handleRevokeInvite vào trong con
    const handleRevokeInvite = async (email: string) => {
        showSuccess('');
        try {
            // await revokeInvitation(email);
            showSuccess(`Đã thu hồi lời mời dành cho ${email}`);
        } catch (err: any) {
            showError('Không thể thu hồi lời mời này');
        }
    };
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
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 border border-blue-200 p-4 rounded-xl shadow-sm">
                            <div className="text-2xl mb-1">📋</div>
                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Đơn hàng</p>
                            <p className="text-2xl font-black text-blue-900">{mockOrders.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100/70 border border-green-200 p-4 rounded-xl shadow-sm">
                            <div className="text-2xl mb-1">💰</div>
                            <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Doanh thu</p>
                            <p className="text-2xl font-black text-green-900">
                                {(mockOrders.reduce((sum, o) => sum + o.total, 0) / 1000).toFixed(1)}k₫
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100/70 border border-purple-200 p-4 rounded-xl shadow-sm">
                            <div className="text-2xl mb-1">📦</div>
                            <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Sản phẩm</p>
                            <p className="text-2xl font-black text-purple-900">19</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/70 border border-orange-200 p-4 rounded-xl shadow-sm">
                            <div className="text-2xl mb-1">👥</div>
                            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Khách hàng</p>
                            <p className="text-2xl font-black text-orange-900">{allCustomers.length}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Invite Staff Panel via Email */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
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
                </div>

                {/* 3. Pending Invitations list */}
                {/* {invitedStaffEmails.length > 0 && (
                    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            ✉️ Lời mời đang chờ ({invitedStaffEmails.length})
                        </h4>
                        <div className="divide-y divide-border">
                            {invitedStaffEmails.map((email) => (
                                <div key={email} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                    <span className="text-xs font-bold text-foreground truncate max-w-[200px]">
                                        {email}
                                    </span>
                                    <button
                                        onClick={() => handleRevokeInvite(email)}
                                        className="text-[10px] text-destructive hover:bg-destructive/5 font-bold px-3 py-1.5 rounded-lg border border-destructive/20 transition-all flex items-center gap-1 active:scale-95"
                                    >
                                        <Trash2 className="w-3 h-3" /> Thu hồi
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )} */}

                {/* 4. Active Staff Team Members */}
                <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
                    {/* <div className="flex items-center gap-2 text-foreground font-bold">
                        <Users className="w-5 h-5 text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-wider">Đội ngũ Nhân viên hoạt động ({activeStaffList.length})</h3>
                    </div> */}

                    {/* {activeStaffList.length > 0 ? (
                        <div className="space-y-3">
                            {activeStaffList.map((staff) => (
                                <div key={staff.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-border/60">
                                    <div className="w-9 h-9 bg-accent/15 text-accent-foreground font-bold flex items-center justify-center rounded-full text-xs">
                                        {staff.fullName[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-foreground truncate">{staff.fullName}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{staff.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                            {staff.customerCode}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-4 bg-neutral-50 rounded-xl border border-dashed border-border">
                            Chưa có Staff nào đăng ký hoạt động. Hãy điền email để mời Staff lên hệ thống!
                        </p>
                    )} */}
                </div>
            </div>
        </>
    )
}

export default SystemOverview