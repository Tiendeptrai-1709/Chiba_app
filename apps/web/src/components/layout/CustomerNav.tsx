'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, Home, QrCode, User, LucideIcon } from 'lucide-react';

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/home', label: 'Trang chủ', icon: Home },
  { href: '/order', label: 'Đặt món', icon: Coffee },
  { href: '/qr', label: 'Mã QR', icon: QrCode },
  { href: '/profile', label: 'Hồ sơ', icon: User },
];

// Thanh điều hướng dạng viên thuốc nổi ở đáy màn hình cho khách hàng.
// Trang dùng thanh này cần chừa khoảng trống phía dưới (pb-32).
export default function CustomerNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(42rem-2rem)] z-40">
      <div className="flex items-center justify-between bg-caramel rounded-full p-1.5 shadow-floating">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center justify-center gap-2 h-12 rounded-full transition-all duration-300 active:scale-95 ${
                active
                  ? 'bg-card text-primary px-5 shadow-sm'
                  : 'text-caramel-foreground opacity-60 hover:opacity-100 w-12'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.4 : 2} />
              {active && <span className="text-sm font-bold whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
