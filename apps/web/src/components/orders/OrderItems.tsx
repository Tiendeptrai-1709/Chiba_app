import { ICE_LABELS, OrderItem, sugarLabel } from '@/types';

// Danh sách món trong một đơn, kèm độ ngọt / đá / topping
export default function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, idx) => {
        const opts = [
          item.sugar !== null ? sugarLabel(item.sugar) : null,
          item.ice ? ICE_LABELS[item.ice] : null,
          item.toppings.length ? '+ ' + item.toppings.map((t) => t.name).join(', ') : null,
        ].filter(Boolean);
        return (
          <li key={idx} className="flex justify-between gap-3 text-sm">
            <span className="min-w-0">
              <b>{item.quantity}×</b> {item.name}
              {opts.length > 0 && <span className="block text-xs text-muted-foreground mt-0.5">{opts.join(' · ')}</span>}
            </span>
            <span className="font-semibold whitespace-nowrap tabular-nums">{item.lineTotal.toLocaleString('vi-VN')}₫</span>
          </li>
        );
      })}
    </ul>
  );
}
