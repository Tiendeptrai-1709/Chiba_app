import { Banknote, Landmark } from 'lucide-react';
import { OrderType, PaymentMethod } from '@/types';
import { isBankConfigured } from '@/lib/payment';

interface PaymentMethodSectionProps {
  orderType: OrderType;
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export default function PaymentMethodSection({ orderType, value, onChange }: PaymentMethodSectionProps) {
  const options: { key: PaymentMethod; title: string; desc: string; icon: typeof Banknote }[] = [
    {
      key: 'CASH',
      title: 'Tiền mặt',
      desc: orderType === 'DELIVERY' ? 'Trả khi nhận hàng' : 'Trả tại quầy',
      icon: Banknote,
    },
    {
      key: 'BANK_TRANSFER',
      title: 'Chuyển khoản',
      desc: 'Quét mã VietQR bằng app ngân hàng',
      icon: Landmark,
    },
  ];

  return (
    <div className="bg-card border border-border p-5 rounded-2xl space-y-4 shadow-sm">
      <h3 className="text-xs font-black text-primary uppercase tracking-widest border-b border-border/40 pb-2">
        💳 Phương thức thanh toán
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {options.map(({ key, title, desc, icon: Icon }) => {
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={active}
              className={`p-3.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all active:scale-[0.98] ${
                active
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm'
                  : 'border-border bg-neutral-50/50 hover:bg-neutral-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm font-bold ${active ? 'text-primary' : 'text-foreground'}`}>{title}</span>
              <span className="text-[11px] text-muted-foreground leading-snug">{desc}</span>
            </button>
          );
        })}
      </div>

      {value === 'BANK_TRANSFER' && (
        <p className="text-[11px] text-muted-foreground bg-neutral-50 border border-dashed border-border rounded-xl p-3 leading-relaxed">
          {isBankConfigured()
            ? 'Sau khi đặt hàng, mã QR chuyển khoản (đã điền sẵn số tiền và nội dung là mã đơn) sẽ hiện ra. Nhân viên xác nhận đơn sau khi nhận được tiền.'
            : '⚠️ Cửa hàng chưa cấu hình tài khoản nhận chuyển khoản. Bạn vẫn đặt được, nhân viên sẽ liên hệ gửi thông tin chuyển khoản.'}
        </p>
      )}
    </div>
  );
}
