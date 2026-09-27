import { Coins, Sparkles } from 'lucide-react';
import React from 'react'
import { Button } from '../ui/button';

interface LoyaltyPointsProps {
    userPoints: number;
    usePoints: boolean;
    setUsePoints: (checked: boolean) => void;
    pointsToUse: number;
    setPointsToUse: (points: number) => void;
    maxPointsPossible: number;
    maxPointsAllowed: number;
}

export const LoyaltyPoints = ({
    userPoints,
    usePoints,
    setUsePoints,
    pointsToUse,
    setPointsToUse,
    maxPointsPossible,
    maxPointsAllowed,
}: LoyaltyPointsProps) => {
    const handleTogglePoints = (checked: boolean) => {
        setUsePoints(checked);
        if (checked) {
            setPointsToUse(maxPointsPossible);
        } else {
            setPointsToUse(0);
        }
    };
    return (
        <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2.5">
                <Coins className="w-5 h-5 text-accent" />
                <h3 className="text-xs font-black text-primary uppercase tracking-widest">
                    Chiba Points (Điểm tích lũy)
                </h3>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">Bạn đang có: <span className="text-accent font-black text-sm">{userPoints}</span> điểm</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Trị giá quy đổi: {(userPoints * 500).toLocaleString('vi-VN')}₫ (1 điểm = 500đ)</p>
                    </div>

                    {userPoints > 0 ? (
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={usePoints}
                                onChange={(e) => handleTogglePoints(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                    ) : (
                        <span className="text-[10px] font-bold text-muted-foreground bg-neutral-100 border border-border/60 px-2 py-1 rounded">
                            Chưa có điểm
                        </span>
                    )}
                </div>

                {usePoints && userPoints > 0 && (
                    <div className="pt-2 border-t border-dashed border-border/60 space-y-3 animate-fade-in">
                        <p className="text-[10.5px] font-bold text-foreground leading-relaxed">
                            Chọn số điểm muốn dùng để giảm giá (giảm tối đa 20%):
                        </p>

                        <div className="flex items-center gap-3">
                            <Button
                                disabled={pointsToUse <= 0}
                                onClick={() => setPointsToUse(Math.max(0, pointsToUse - 5))}
                                className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-muted-foreground text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                            >
                                -5
                            </Button>
                            <Button
                                disabled={pointsToUse <= 0}
                                onClick={() => setPointsToUse(Math.max(0, pointsToUse - 1))}
                                className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-muted-foreground text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                            >
                                -1
                            </Button>
                            <input
                                type="number"
                                min={0}
                                max={maxPointsPossible}
                                value={pointsToUse}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setPointsToUse(Math.max(0, Math.min(val, maxPointsPossible)));
                                }}
                                className="w-20 text-center font-black text-sm bg-neutral-50 border border-border py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <Button
                                disabled={pointsToUse >= maxPointsPossible}
                                onClick={() => setPointsToUse(Math.min(maxPointsPossible, pointsToUse + 1))}
                                className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-muted-foreground text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                            >
                                +1
                            </Button>
                            <Button
                                disabled={pointsToUse >= maxPointsPossible}
                                onClick={() => setPointsToUse(Math.min(maxPointsPossible, pointsToUse + 5))}
                                className="w-8 h-8 rounded-lg bg-neutral-100 border border-border flex items-center justify-center font-bold text-muted-foreground text-sm hover:bg-neutral-200 disabled:opacity-50 transition active:scale-95"
                            >
                                +5
                            </Button>
                            <Button
                                onClick={() => setPointsToUse(maxPointsPossible)}
                                className="text-[10px] font-black text-accent bg-accent/10 border border-accent/20 px-2.5 py-2 rounded-lg active:scale-95 transition"
                            >
                                Tối đa
                            </Button>
                        </div>

                        <div className="flex items-center gap-1.5 p-2 bg-[#FAF7F2] rounded-lg border border-border/80 text-[10px] text-muted-foreground font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                            <span>
                                Giảm giá áp dụng: <span>{(pointsToUse * 500).toLocaleString('vi-VN')}₫</span> (Khấu trừ {pointsToUse} điểm)
                            </span>
                        </div>

                        {maxPointsAllowed < userPoints && (
                            <p className="text-[9.5px] text-muted-foreground font-semibold">
                                🛡️ Đã áp dụng quy tắc bảo vệ lợi nhuận: Giảm tối đa 20% giá trị đơn hàng (giới hạn {maxPointsAllowed} điểm).
                            </p>
                        )}
                    </div>
                )}

                <div className="p-3 bg-neutral-50 rounded-xl border border-dashed border-border/80 text-[10px] text-muted-foreground leading-normal">
                    💡 <span>Quy tắc tích điểm:</span> Mỗi đơn hàng mua 10.000đ tích lũy 1 điểm. Điểm tích lũy mới được tính dựa trên số tiền thực tế thanh toán sau khi trừ điểm giảm giá.
                </div>
            </div>
        </div>
    )
}
