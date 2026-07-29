import { useNotificationStore } from '@/stores/useNotificationStore';
import React, { useState } from 'react'

interface DeliveryAddressProps {
    orderType: string;
    address: string;
    setAddress: (val: string) => void;
    saveAsDefault: boolean;
    setSaveAsDefault: (val: boolean) => void;
}

export const DeliveryAddress = ({ orderType, address, setAddress, saveAsDefault, setSaveAsDefault
}: DeliveryAddressProps) => {
    const { showError } = useNotificationStore()

    const [locating, setLocating] = useState(false);

    const handleGetCurrentLocation = () => {
        if (typeof window === 'undefined' || !navigator.geolocation) {
            showError('Trình duyệt của bạn không hỗ trợ tự động định vị vị trí');
            return;
        }

        setLocating(true);
        showError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // OpenStreetMap Nominatim Free Reverse Geocoding API
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=vi`
                    );

                    if (!response.ok) throw new Error('Failed to resolve coordinates');

                    const data = await response.json();
                    if (data && data.display_name) {
                        setAddress(data.display_name);
                    } else {
                        showError('Không thể tìm thấy địa chỉ cho tọa độ này');
                    }
                } catch (error) {
                    showError(`Không thể kết nối dịch vụ bản đồ. Vui lòng nhập tay địa chỉ.${error}`);
                } finally {
                    setLocating(false);
                }
            },
            (err) => {
                setLocating(false);
                if (err.code === 1) {
                    showError('Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền GPS cho trình duyệt.');
                } else {
                    showError('Không thể xác định vị trí GPS từ thiết bị của bạn');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };
    return (
        <>
            {orderType === 'DELIVERY' ? (
                <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            📍 Địa Chỉ Nhận Hàng (Giao Tận Nơi)
                        </h3>
                        <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={locating}
                            className="text-[10px] font-black text-accent hover:bg-accent/10 border border-accent/20 px-2.5 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {locating ? '⌛ Đang định vị...' : '🎯 Lấy vị trí GPS'}
                        </button>
                    </div>

                    <div className="space-y-3">
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
                            rows={2}
                            className="w-full px-4 py-3 bg-neutral-50/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-xs font-semibold placeholder:text-muted-foreground/50 shadow-sm leading-relaxed"
                            required
                        />

                        {/* Save as default address checkbox */}
                        <label className="flex items-center gap-2.5 cursor-pointer select-none text-[11px] font-bold text-muted-foreground">
                            <input
                                type="checkbox"
                                checked={saveAsDefault}
                                onChange={(e) => setSaveAsDefault(e.target.checked)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-border"
                            />
                            <span>Lưu làm địa chỉ giao hàng mặc định cho lần sau</span>
                        </label>
                    </div>
                </div>
            ) : (
                <div className="bg-[#FAF7F2] border border-border p-5 rounded-2xl space-y-2 shadow-sm animate-fade-in flex items-start gap-3">
                    <span className="text-xl mt-0.5">🏪</span>
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-primary uppercase tracking-wider">Đến nhận trực tiếp tại cửa hàng</h4>
                        <p className="text-[10.5px] text-muted-foreground font-semibold leading-relaxed">
                            Bạn sẽ nhận nước trực tiếp tại chi nhánh của Chiba. Đơn hàng này <strong>không có phí vận chuyển (0đ)</strong>. Bạn chỉ cần đưa mã đơn hàng cho nhân viên tại quầy khi đến nhận.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}
